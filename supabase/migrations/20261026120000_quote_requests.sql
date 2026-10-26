-- Quote requests (D-12, D-17, D-20).
-- The browser never touches this table: RLS is on with no policies and the public roles have no grants.
-- Only the submit-quote Edge Function (service role) writes, through submit_quote().

create table public.quote_requests (
  -- The request number shown to the customer ("Request No. 0412") is this id.
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),

  name text not null check (char_length(name) between 2 and 100),
  phone text not null check (phone ~ '^\+254[17][0-9]{8}$'),
  email text check (email is null or char_length(email) <= 254),
  pickup text not null check (char_length(pickup) between 2 and 150),
  dropoff text not null check (char_length(dropoff) between 2 and 150),
  cargo_type text not null check (cargo_type in ('construction', 'timber', 'agriculture', 'commercial', 'general')),
  description text check (description is null or char_length(description) <= 1000),
  weight text check (weight is null or char_length(weight) <= 100),
  size text check (size is null or char_length(size) <= 200),
  preferred_date date not null,
  time_window text not null check (time_window in ('06-09', '09-12', '12-15', '15-19')),
  notes text check (notes is null or char_length(notes) <= 1000),

  -- SHA-256 of a secret salt and the visitor's IP. The IP itself is never stored.
  ip_hash text not null check (ip_hash ~ '^[0-9a-f]{64}$'),
  -- SHA-256 of phone, route, day and time window, for duplicate blocking.
  dedupe_key text not null check (dedupe_key ~ '^[0-9a-f]{64}$'),
  email_status text not null default 'pending' check (email_status in ('pending', 'sent', 'failed'))
);

comment on table public.quote_requests is
  'Website quote requests. Kept until the owner asks for deletion (D-17). Contains personal data.';

create index quote_requests_ip_recent on public.quote_requests (ip_hash, created_at desc);
create index quote_requests_dedupe_recent on public.quote_requests (dedupe_key, created_at desc);

alter table public.quote_requests enable row level security;
revoke all on table public.quote_requests from anon, authenticated;

-- Saves one request, atomically applying the duplicate check and the per-IP hourly limit.
-- Returns {status: 'saved', id} | {status: 'duplicate', id, emailSent} | {status: 'rate_limited'}.
create function public.submit_quote(
  p_quote jsonb,
  p_ip_hash text,
  p_dedupe_key text,
  p_max_per_hour integer
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing record;
  v_recent integer;
  v_id bigint;
begin
  -- Serialise concurrent submissions from the same visitor and of the same request.
  perform pg_advisory_xact_lock(hashtextextended(p_ip_hash, 0));
  perform pg_advisory_xact_lock(hashtextextended(p_dedupe_key, 0));

  select id, email_status into v_existing
  from public.quote_requests
  where dedupe_key = p_dedupe_key and created_at > now() - interval '24 hours'
  order by id desc
  limit 1;
  if found then
    return jsonb_build_object('status', 'duplicate', 'id', v_existing.id, 'emailSent', v_existing.email_status = 'sent');
  end if;

  select count(*) into v_recent
  from public.quote_requests
  where ip_hash = p_ip_hash and created_at > now() - interval '1 hour';
  if v_recent >= p_max_per_hour then
    return jsonb_build_object('status', 'rate_limited');
  end if;

  insert into public.quote_requests (
    name, phone, email, pickup, dropoff, cargo_type, description, weight, size,
    preferred_date, time_window, notes, ip_hash, dedupe_key
  ) values (
    p_quote->>'name', p_quote->>'phone', p_quote->>'email', p_quote->>'pickup', p_quote->>'dropoff',
    p_quote->>'cargoType', p_quote->>'description', p_quote->>'weight', p_quote->>'size',
    (p_quote->>'preferredDate')::date, p_quote->>'timeWindow', p_quote->>'notes', p_ip_hash, p_dedupe_key
  )
  returning id into v_id;

  return jsonb_build_object('status', 'saved', 'id', v_id);
end;
$$;

revoke all on function public.submit_quote(jsonb, text, text, integer) from public, anon, authenticated;
grant execute on function public.submit_quote(jsonb, text, text, integer) to service_role;
