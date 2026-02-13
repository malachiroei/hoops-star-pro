import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gyxqczdhzsndzcqfqmgl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5eHFjemRoenNuZHpjcWZxbWdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MDcyOTEsImV4cCI6MjA4NjQ4MzI5MX0.ydt6zysdzuyENUDrQwI-nMeDwrKlbwAWobankZhXy9w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);