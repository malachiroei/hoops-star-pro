import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// הכתובת והמפתח של הפרויקט עם 9 הקבוצות
const SUPABASE_URL = "https://gyxqczdhzsndzcqfqmgl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5eHFjemRhenNuZHpjcWZx bWdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjE2NDMsImV4cCI6MjA1NDAwNTY0M30.S6YnF-p_3XjW9v1mN8M9Y5K_v5L_v5L_v5L_v5L_v5L";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});