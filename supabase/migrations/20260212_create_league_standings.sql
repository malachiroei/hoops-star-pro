-- Create league_standings table
create table if not exists league_standings (
  id bigint primary key generated always as identity,
  position integer not null,
  name text not null,
  "gamesPlayed" integer not null,
  wins integer not null,
  losses integer not null,
  points integer not null,
  "updatedAt" timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for faster queries
create index if not exists idx_league_standings_position on league_standings(position);

-- Enable RLS
alter table league_standings enable row level security;

-- Create policy to allow public read access
create policy "Allow public read access"
  on league_standings
  for select
  using (true);

-- Create policy to allow service role to manage data
create policy "Allow service role to manage league standings"
  on league_standings
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
