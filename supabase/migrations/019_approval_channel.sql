CREATE TABLE IF NOT EXISTS public.approval_requests (
 id BIGSERIAL PRIMARY KEY, company_id INTEGER NOT NULL DEFAULT 1, requested_by INTEGER NOT NULL,
 title TEXT NOT NULL, description TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'General', amount NUMERIC(14,2),
 status TEXT NOT NULL DEFAULT 'pending_md' CHECK (status IN ('pending_md','pending_finance','declined','completed')),
 recipient_emails JSONB NOT NULL DEFAULT '[]'::jsonb, metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
 md_decision TEXT, md_reason TEXT, md_reviewed_by INTEGER, md_reviewed_at TIMESTAMPTZ,
 finance_user_id INTEGER, finance_note TEXT, attachment_url TEXT, finance_completed_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS approval_requests_company_status_idx ON public.approval_requests(company_id,status,created_at DESC);
CREATE INDEX IF NOT EXISTS approval_requests_requester_idx ON public.approval_requests(company_id,requested_by,created_at DESC);
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.approval_requests FROM anon, authenticated;
GRANT SELECT,INSERT,UPDATE ON public.approval_requests TO service_role;
