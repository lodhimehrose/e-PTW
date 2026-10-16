-- Run once in Supabase SQL Editor after the original schema.
-- Links a submission to the contractor who signed in.

alter table submissions
  add column if not exists owner_id uuid references auth.users (id) on delete set null;

create index if not exists submissions_owner_idx on submissions (owner_id);
create index if not exists submissions_contact_email_idx on submissions (lower(contact_email));
