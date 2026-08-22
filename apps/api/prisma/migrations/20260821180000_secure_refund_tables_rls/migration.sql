-- Refund data is server-only. RLS prevents direct anon/authenticated API access
-- while Prisma continues to use the privileged database connection.
ALTER TABLE public.tenant_refund_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_refunds ENABLE ROW LEVEL SECURITY;
