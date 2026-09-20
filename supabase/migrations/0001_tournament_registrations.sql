-- Tournament registrations, with an optional paid-entry flow.
-- payment_status stays 'not_required' for free tournaments (every event so
-- far) — the payment columns only matter once a tournament sets an entry
-- fee. Rows only ever move pending -> paid via the capture-paypal-order /
-- paypal-webhook edge functions (server-side, after PayPal confirms the
-- money actually moved) — the client never sets payment_status directly.

create table if not exists tournament_registrations (
  id uuid primary key default gen_random_uuid(),
  tournament_id text not null,
  pseudo text not null,
  activision_id text not null,
  discord text not null,
  team text,
  is_captain boolean not null default false,

  entry_fee_cents integer not null default 0,
  currency text not null default 'EUR',
  payment_status text not null default 'not_required'
    check (payment_status in ('not_required', 'pending', 'paid', 'failed', 'cancelled')),
  paypal_order_id text unique,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tournament_registrations_tournament_id_idx
  on tournament_registrations (tournament_id);

create index if not exists tournament_registrations_paypal_order_id_idx
  on tournament_registrations (paypal_order_id);

alter table tournament_registrations enable row level security;

-- Anyone can create their own registration row (the public registration
-- form has no login). Nobody can read/update/delete via the public anon
-- key — only the edge functions, using the service_role key, can do that.
-- This stops one player from reading another's Activision ID/Discord, or
-- from marking their own entry "paid" by hand.
create policy "public can register"
  on tournament_registrations for insert
  to anon
  with check (payment_status = 'not_required' or payment_status = 'pending');

create or replace function set_tournament_registrations_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on tournament_registrations
  for each row
  execute function set_tournament_registrations_updated_at();
