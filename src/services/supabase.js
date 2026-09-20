import { createClient } from '@supabase/supabase-js';

// Default public cloud sync workspace channel
const DEFAULT_SUPABASE_URL = "https://xyzcompany.supabase.co"; 
const DEFAULT_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emNvbXBhbnkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY3MjUxMjAwMCwiZXhwIjoxOTg4MDg4MDAwfQ.dummy";

export const getSupabaseClient = () => {
  const customUrl = localStorage.getItem('socio_sync_supabase_url');
  const customKey = localStorage.getItem('socio_sync_supabase_key');
  
  if (customUrl && customKey) {
    try {
      return createClient(customUrl, customKey);
    } catch (e) {
      console.error('Custom Supabase error:', e);
    }
  }
  return null;
};
