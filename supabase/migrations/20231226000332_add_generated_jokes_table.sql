create table generated_jokes (
  id uuid not null default gen_random_uuid(),
  user_id uuid references auth.users,
  setup text,
  results jsonb,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table generated_jokes enable row level security;
create policy "Allow public read-only access." on generated_jokes for select using (true);
