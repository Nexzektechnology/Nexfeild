import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock3, FileCheck2, XCircle } from 'lucide-react';
import { api } from '../../lib/api';

const statusLabel = { pending_md: 'Awaiting MD', pending_finance: 'Awaiting Finance', declined: 'Declined', completed: 'Completed' };
export default function ApprovalChannel() {
  const [rows, setRows] = useState([]); const [form, setForm] = useState({ title:'', description:'', category:'General', recipient_emails:'' }); const [note, setNote] = useState({}); const [message, setMessage] = useState('');
  const load = () => api.get('/approvals').then(setRows).catch(e => setMessage(e.message));
  useEffect(load, []);
  const submit = async e => { e.preventDefault(); try { await api.post('/approvals', { ...form, recipient_emails: form.recipient_emails.split(',').map(x=>x.trim()).filter(Boolean) }); setForm({ title:'', description:'', category:'General', recipient_emails:'' }); setMessage('Request sent to the MD approval queue.'); load(); } catch(e) { setMessage(e.message); } };
  const review = async (id, decision) => { try { await api.post(`/approvals/${id}/review`, { decision, reason: note[id] || '' }); setMessage(decision === 'approved' ? 'Approved and routed to Finance.' : 'Declined and requester notified.'); load(); } catch(e) { setMessage(e.message); } };
  const complete = async id => { try { await api.post(`/approvals/${id}/finance`, { finance_note: note[id] || '' }); setMessage('Finance step completed.'); load(); } catch(e) { setMessage(e.message); } };
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
    <div><h2 className="text-lg font-semibold text-slate-900">Approval channel</h2><p className="text-sm text-slate-500">Requests flow from the requester to the MD, then to Finance after approval.</p></div>
    <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
      <input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Request title" className="rounded-lg border p-2" />
      <input value={form.category} onChange={e=>setForm({...form,category:e.target.value})} placeholder="Category" className="rounded-lg border p-2" />
      <textarea required value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Describe the request and business reason" className="rounded-lg border p-2 md:col-span-2" />
      <input value={form.recipient_emails} onChange={e=>setForm({...form,recipient_emails:e.target.value})} placeholder="MD emails (comma-separated; optional if organogram is configured)" className="rounded-lg border p-2 md:col-span-2" />
      <button className="rounded-lg bg-slate-900 px-4 py-2 text-white md:col-span-2">Submit for MD approval</button>
    </form>
    {message && <p className="text-sm text-indigo-700">{message}</p>}
    <div className="space-y-3">{rows.map(r=><article key={r.id} className="rounded-xl border border-slate-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-medium">{r.title}</h3><p className="text-sm text-slate-500">{r.description}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs">{statusLabel[r.status] || r.status}</span></div>
      {(r.status === 'pending_md' || r.status === 'pending_finance') && <div className="mt-3 flex flex-wrap gap-2"><input value={note[r.id] || ''} onChange={e=>setNote({...note,[r.id]:e.target.value})} placeholder={r.status === 'pending_md' ? 'Reason (required to decline)' : 'Finance note / upload reference'} className="min-w-[240px] flex-1 rounded-lg border p-2 text-sm" />{r.status === 'pending_md' && <><button onClick={()=>review(r.id,'approved')} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white">Approve</button><button onClick={()=>review(r.id,'declined')} className="rounded-lg bg-rose-600 px-3 py-2 text-sm text-white">Decline</button></>}{r.status === 'pending_finance' && <button onClick={()=>complete(r.id)} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white">Complete Finance</button>}</div>}
    </article>)}</div>
  </section>;
}
