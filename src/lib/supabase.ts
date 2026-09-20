import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * `null` until VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are set (see
 * .env.example) — every caller must handle that case rather than assume a
 * backend exists, since most deployments of this site won't have one yet.
 */
export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null;
