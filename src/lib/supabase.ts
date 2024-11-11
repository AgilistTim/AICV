import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export async function setupDatabase() {
  const { error } = await supabase.rpc('setup_database', {
    sql: `
      -- Enable UUID extension
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- Create profiles table if it doesn't exist
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID REFERENCES auth.users(id) PRIMARY KEY,
        cv_data JSONB DEFAULT '{}' NOT NULL,
        created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Enable RLS
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

      -- Create policies
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile'
        ) THEN
          CREATE POLICY "Users can view own profile" ON public.profiles
            FOR SELECT USING (auth.uid() = id);
        END IF;

        IF NOT EXISTS (
          SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
        ) THEN
          CREATE POLICY "Users can update own profile" ON public.profiles
            FOR UPDATE USING (auth.uid() = id);
        END IF;

        IF NOT EXISTS (
          SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile'
        ) THEN
          CREATE POLICY "Users can insert own profile" ON public.profiles
            FOR INSERT WITH CHECK (auth.uid() = id);
        END IF;
      END $$;

      -- Create profile on signup function
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO public.profiles (id)
        VALUES (NEW.id)
        ON CONFLICT (id) DO NOTHING;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Create trigger for new users
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `
  });

  if (error) {
    console.error('Error setting up database:', error);
    throw error;
  }
}

export async function loadProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error loading profile:', error);
    throw error;
  }
}

export async function updateProfile(userId: string, cvData: any) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        cv_data: cvData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}