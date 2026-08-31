import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only Supabase client (service-role key). Never import from a client component.
// Created lazily so importing this module never throws during `next build` — a missing
// env var surfaces at request time instead of breaking the build.
export const DECK_BUCKET = "startup-decks";
export const RESUME_BUCKET = "student-resumes";
export const PROJECT_FILE_BUCKET = "student-projects";
export const SOLUTION_FILE_BUCKET = "student-solutions";

let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
