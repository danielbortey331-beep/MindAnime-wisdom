import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl ?? 'http://localhost:54321',
  supabaseAnonKey ?? 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export type PostSection =
  | { type: 'paragraph'; content: string }
  | { type: 'heading'; content: string }
  | { type: 'takeaway'; content: string }
  | { type: 'application'; content: string }
  | { type: 'steps'; content: string[] }
  | { type: 'resources'; content: { label: string; url: string }[] };

export interface Post {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  body: PostSection[];
  source_title: string | null;
  source_author: string | null;
  image_url: string | null;
  author_name: string;
  author_id: string | null;
  is_curated: boolean;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string | null;
  author_name: string;
  content: string;
  created_at: string;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  subscription_status: 'trial' | 'pro' | 'expired';
  trial_start_date: string;
  is_admin: boolean;
  created_at: string;
}

export const CATEGORIES = [
  'All',
  'Human Behavior & Psychology',
  'Power Dynamics & Strategy',
  'Wealth Creation & Economics',
  'Singularity & Future Tech',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const PREMIUM_CATEGORIES: string[] = [
  'Power Dynamics & Strategy',
  'Human Behavior & Psychology',
  'Wealth Creation & Economics',
];
