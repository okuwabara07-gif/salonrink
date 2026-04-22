-- Add 'free' plan to subscriptions table CHECK constraint
ALTER TABLE public.subscriptions
DROP CONSTRAINT IF EXISTS subscriptions_plan_check;

ALTER TABLE public.subscriptions
ADD CONSTRAINT subscriptions_plan_check CHECK (plan IN ('basic','small','medium','free'));

-- Add 'free' plan to salons table if it exists
ALTER TABLE public.salons
DROP CONSTRAINT IF EXISTS salons_plan_check;

ALTER TABLE public.salons
ADD CONSTRAINT salons_plan_check CHECK (plan IN ('basic','small','medium','free'));
