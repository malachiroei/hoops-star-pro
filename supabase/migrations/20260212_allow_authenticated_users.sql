-- Allow authenticated users to insert/update league standings
-- This fixes the client-side app's ability to save standings data

-- Add new policy for authenticated users
create policy "Allow authenticated users to manage league standings"
  on league_standings
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
