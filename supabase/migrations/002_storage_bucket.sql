-- Private bucket for PDFs, signatures, uploads
insert into storage.buckets (id, name, public)
values ('submissions', 'submissions', false)
on conflict (id) do nothing;
