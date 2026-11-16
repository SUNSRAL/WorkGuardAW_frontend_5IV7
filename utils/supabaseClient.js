import { createClient } from '@supabase/supabase-js';

// Reemplaza estos valores con las credenciales de tu proyecto de Supabase 
// (Las encuentras en Supabase > Project Settings > API)
const SUPABASE_URL = 'TU_SUPABASE_URL_AQUI';
const SUPABASE_ANON_KEY = 'TU_SUPABASE_ANON_KEY_AQUI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);