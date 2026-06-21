import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bdxfbffxqekffkmwlxew.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Z9T0lDsDHSNHOyW2z4OjlA_bj_xVrPY';

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
