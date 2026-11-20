-- Private Supabase Storage dan metadata file per user.
-- Jalankan di Supabase SQL Editor setelah project Supabase dibuat.

-- File disimpan privat. Sesuaikan batas 50 MB bila diperlukan.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'user-files',
  'user-files',
  false,
  52428800,
  array[
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', -- .docx
    'application/pdf',                                                        -- .pdf
    'image/jpeg',                                                             -- .jpg/.jpeg
    'image/png',                                                              -- .png
    'image/vnd.adobe.photoshop',                                              -- .psd
    'application/vnd.adobe.photoshop',
    'application/photoshop',
    'image/x-photoshop',
    'application/vnd.oasis.opendocument.text',                                -- .odt
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',     -- .xlsx
    'application/vnd.ms-powerpoint',                                          -- .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation' -- .pptx
  ]::text[]
)
on conflict (id) do update set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.user_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  storage_path text not null unique,
  original_name text not null check (char_length(btrim(original_name)) between 1 and 255),
  extension text not null check (
    extension in ('docx', 'pdf', 'jpg', 'jpeg', 'psd', 'png', 'odt', 'xlsx', 'ppt', 'pptx')
  ),
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 52428800),
  download_count bigint not null default 0 check (download_count >= 0),
  created_at timestamptz not null default now(),
  constraint user_files_storage_path_owner check (
    split_part(storage_path, '/', 1) = user_id::text
    and split_part(storage_path, '/', 2) <> ''
  )
);

-- Migrasi aman jika tabel sudah dibuat sebelum kolom download_count tersedia.
alter table public.user_files
  add column if not exists download_count bigint not null default 0;

create index if not exists user_files_owner_created_idx
  on public.user_files (user_id, created_at desc);

create index if not exists user_files_owner_popular_idx
  on public.user_files (user_id, download_count desc, created_at desc);

-- Catat download hanya untuk file milik user yang sedang login.
create or replace function public.record_file_download(p_file_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.user_files
  set download_count = download_count + 1
  where id = p_file_id
    and user_id = (select auth.uid());
$$;

revoke all on function public.record_file_download(uuid) from public;
grant execute on function public.record_file_download(uuid) to authenticated;

alter table public.user_files enable row level security;

drop policy if exists "Users can read their own file metadata" on public.user_files;
create policy "Users can read their own file metadata"
  on public.user_files for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can add their own file metadata" on public.user_files;
create policy "Users can add their own file metadata"
  on public.user_files for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and split_part(storage_path, '/', 1) = (select auth.uid())::text
  );

drop policy if exists "Users can delete their own file metadata" on public.user_files;
create policy "Users can delete their own file metadata"
  on public.user_files for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Path objek wajib berbentuk <auth.uid()>/<nama-objek-unik>.
drop policy if exists "Users can upload files to their own folder" on storage.objects;
create policy "Users can upload files to their own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'user-files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can download files from their own folder" on storage.objects;
create policy "Users can download files from their own folder"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'user-files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can delete files from their own folder" on storage.objects;
create policy "Users can delete files from their own folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'user-files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
