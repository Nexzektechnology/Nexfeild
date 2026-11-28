import { db } from '../config/database.js';
import { createNotification } from './notificationRepository.js';

const fail = (message, status = 400) => { const e = new Error(message); e.status = status; throw e; };
const elevated = new Set(['SUPER_ADMIN','ADMIN','CEO','MD','MANAGING_DIRECTOR','FINANCE','FINANCE_MANAGER','ACCOUNTANT','SENIOR_ACCOUNTANT']);
const role = u => String(u?.role_code || u?.role || '').toUpperCase();
const company = u => Number(u.company_id || 1);
const idOf = u => Number(u.employee_id || u.employee?.id || u.id);

async function usersFor(companyId, emails = [], roles = []) {
  const all = await db.find('users', { company_id: companyId });
  const wantedEmails = new Set(emails.map(e => String(e).trim().toLowerCase()).filter(Boolean));
  const wantedRoles = new Set(roles.map(r => String(r).toUpperCase()));
  return all.filter(u => wantedEmails.has(String(u.email || '').toLowerCase()) || wantedRoles.has(role(u)));
}
async function notifyUsers(users, title, body) {
  for (const u of users) { try { await createNotification({ employee_id: idOf(u), company_id: company(u), type: 'Approval', title, body }); } catch { /* unlinked accounts still see the request in their queue */ } }
}

export const approvalService = {
  async create(user, input = {}) {
    const title = String(input.title || '').trim();
    const description = String(input.description || '').trim();
    if (!title || !description) fail('A title and description are required.');
    const recipients = Array.isArray(input.recipient_emails) ? input.recipient_emails : [];
    const mdUsers = await usersFor(company(user), recipients, ['MD','MANAGING_DIRECTOR','CEO','SUPER_ADMIN','ADMIN']);
    if (!mdUsers.length) fail('Add at least one MD/approver email or configure an MD/CEO account.');
    const request = await db.insert('approval_requests', {
      company_id: company(user), requested_by: idOf(user), title, description,
      amount: input.amount == null || input.amount === '' ? null : Number(input.amount),
      category: String(input.category || 'General').trim(), status: 'pending_md',
      recipient_emails: JSON.stringify(recipients), metadata: JSON.stringify(input.metadata || {})
    });
    await notifyUsers(mdUsers, 'Approval requested', `${user.name || user.email || 'A staff member'} submitted “${title}” for MD approval.`);
    return request;
  },
  async list(user, query = {}) {
    const rows = await db.find('approval_requests', { company_id: company(user) }, { order: { column: 'created_at', ascending: false }, limit: Math.min(Number(query.limit) || 100, 200) });
    const actor = idOf(user); const management = elevated.has(role(user));
    return rows.filter(r => management || Number(r.requested_by) === actor || (r.finance_user_id && Number(r.finance_user_id) === actor));
  },
  async review(user, requestId, input = {}) {
    const request = await db.findById('approval_requests', requestId);
    if (!request || Number(request.company_id) !== company(user)) fail('Approval request not found.', 404);
    if (!['MD','MANAGING_DIRECTOR','CEO','SUPER_ADMIN','ADMIN'].includes(role(user))) fail('Only the MD or an authorized administrator can review this request.', 403);
    if (request.status !== 'pending_md') fail('This request has already been reviewed.');
    const decision = String(input.decision || '').toLowerCase();
    if (!['approved','declined'].includes(decision)) fail('Decision must be approved or declined.');
    const reason = String(input.reason || '').trim();
    if (decision === 'declined' && !reason) fail('A decline reason is required.');
    const status = decision === 'approved' ? 'pending_finance' : 'declined';
    const updated = await db.update('approval_requests', request.id, { status, md_decision: decision, md_reason: reason || null, md_reviewed_by: idOf(user), md_reviewed_at: new Date().toISOString() });
    const requester = await db.findById('users', request.requested_by);
    if (requester) await notifyUsers([requester], decision === 'approved' ? 'Request approved by MD' : 'Request declined by MD', `${request.title}${reason ? ` — ${reason}` : ''}`);
    if (decision === 'approved') {
      const finance = await usersFor(company(user), [], ['FINANCE','FINANCE_MANAGER','ACCOUNTANT','SENIOR_ACCOUNTANT','SUPER_ADMIN','ADMIN']);
      await notifyUsers(finance, 'Finance action required', `MD approved “${request.title}”. Upload the supporting document and complete Finance processing.`);
    }
    return updated;
  },
  async finance(user, requestId, input = {}) {
    if (!['FINANCE','FINANCE_MANAGER','ACCOUNTANT','SENIOR_ACCOUNTANT','SUPER_ADMIN','ADMIN'].includes(role(user))) fail('Only Finance or an authorized administrator can complete this step.', 403);
    const request = await db.findById('approval_requests', requestId);
    if (!request || Number(request.company_id) !== company(user)) fail('Approval request not found.', 404);
    if (request.status !== 'pending_finance') fail('This request is not awaiting Finance.');
    const note = String(input.finance_note || '').trim();
    if (!note) fail('Add a Finance note or upload reference before completing the request.');
    return db.update('approval_requests', request.id, { status: 'completed', finance_user_id: idOf(user), finance_note: note, finance_completed_at: new Date().toISOString(), attachment_url: input.attachment_url || null });
  }
};
