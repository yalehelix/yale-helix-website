import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types for the database schema
export interface StudentApplication {
  id?: string;
  ref_code?: string;
  first_name: string;
  last_name: string;
  email: string;
  class_year: number;
  intended_major: string;
  linkedin_url?: string;
  areas_of_interest: string[];
  q1: string; // Why Helix?
  q2: string; // What have you built?
  q3: string; // Future goals
  longform_choice: 'portfolio_link' | 'portfolio_pdf' | 'graphical_abstract' | 'slide_deck';
  longform_portfolio_link?: string;
  longform_portfolio_desc?: string;
  longform_graphical_caption?: string;
  longform_video_url?: string;
  submitted_at?: string;
}

export interface ApplicationFile {
  id?: string;
  application_id: string;
  role: 'resume' | 'portfolio_pdf' | 'graphical_abstract' | 'slide_deck';
  storage_path: string;
  original_filename: string;
  mime_type?: string;
  size_bytes?: number;
  sha256_hex?: string;
  uploaded_at?: string;
}
