import { createClient } from "@supabase/supabase-js";

// Browser client (anon key). Used only to upload a file straight to Storage via a
// signed upload URL, which bypasses Vercel's 4.5 MB serverless request-body limit.
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
