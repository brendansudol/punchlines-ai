ALTER TABLE generated_jokes ADD PRIMARY KEY (id);

create table saved_jokes (
  id uuid not null default gen_random_uuid(),
  gen_joke_id uuid references generated_jokes not null,
  user_id uuid references auth.users not null,
  setup text,
  punchline text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table saved_jokes enable row level security;
create policy "Allow public read-only access." on saved_jokes for select using (true);
create policy "Can insert own user jokes data." on saved_jokes for insert to authenticated with check (auth.uid() = user_id);
create policy "Can delete own user jokes data." on saved_jokes for delete using (auth.uid() = user_id);