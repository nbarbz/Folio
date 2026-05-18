-- ============================================================
-- Folio Resume Builder — Supabase SQL Setup
-- Run this in your Supabase project: SQL Editor > New Query
-- ============================================================

-- 1. PROFILES TABLE
-- Extends the built-in auth.users table with app-specific data.
-- Automatically populated via trigger on sign-up.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  is_pro boolean default false,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text, -- 'active' | 'canceled' | 'past_due' | 'trialing'
  trial_ends_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Users can only read/update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 2. RESUMES TABLE

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text default 'My Resume',
  template text default 'classic',
  personal jsonb default '{}',
  experience jsonb default '[]',
  education jsonb default '[]',
  skills jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.resumes enable row level security;

create policy "Users can manage own resumes"
  on public.resumes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ============================================================
-- STRIPE WEBHOOK HANDLER (Supabase Edge Function)
-- ============================================================
-- After running this SQL, create an Edge Function at:
-- supabase/functions/stripe-webhook/index.ts
--
-- The function should:
-- 1. Verify the Stripe webhook signature
-- 2. Handle these events:
--    - customer.subscription.created → set is_pro=true, subscription_status='active'
--    - customer.subscription.updated → update subscription_status
--    - customer.subscription.deleted → set is_pro=false, subscription_status='canceled'
--    - checkout.session.completed → link stripe_customer_id to profile
-- 3. Update the profiles table accordingly
--
-- Example handler (install Stripe via: deno add npm:stripe):
--
-- import Stripe from 'npm:stripe'
-- import { createClient } from 'npm:@supabase/supabase-js'
--
-- const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)
-- const supabase = createClient(
--   Deno.env.get('SUPABASE_URL')!,
--   Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
-- )
--
-- Deno.serve(async (req) => {
--   const signature = req.headers.get('stripe-signature')!
--   const body = await req.text()
--   const event = stripe.webhooks.constructEvent(
--     body, signature, Deno.env.get('STRIPE_WEBHOOK_SECRET')!
--   )
--
--   if (event.type === 'customer.subscription.created') {
--     const sub = event.data.object as Stripe.Subscription
--     await supabase.from('profiles').update({
--       is_pro: true,
--       stripe_subscription_id: sub.id,
--       subscription_status: sub.status,
--     }).eq('stripe_customer_id', sub.customer)
--   }
--
--   if (event.type === 'customer.subscription.deleted') {
--     const sub = event.data.object as Stripe.Subscription
--     await supabase.from('profiles').update({
--       is_pro: false,
--       subscription_status: 'canceled',
--     }).eq('stripe_customer_id', sub.customer)
--   }
--
--   return new Response(JSON.stringify({ received: true }), { status: 200 })
-- })
