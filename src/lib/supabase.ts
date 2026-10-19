import { createClient } from '@supabase/supabase-js';

// Fallback kredensial Supabase agar website tetap berjalan otomatis di hosting (seperti Vercel)
// tanpa harus mewajibkan pengisian Environment Variables di dashboard hosting.
const DEFAULT_SUPABASE_URL = 'https://npqykfruxdpyekihqqlu.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wcXlrZnJ1eGRweWVraWhxcWx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5MDEyODUsImV4cCI6MjEwNzQ3NzI4NX0.e4CDRgJ3bfH_mR9kg3pS-3WEi6y8aatX2JKdLCHfwgg';
const DEFAULT_SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wcXlrZnJ1eGRweWVraWhxcWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTkwMTI4NSwiZXhwIjoyMTA3NDc3Mjg1fQ.tarKo6DaA-xnbw16jiLdqmOOTk4_loo0pn2BndWaPJo';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey =
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Conditionally create service role client if service role key is available
export const supabaseServiceRole = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;
