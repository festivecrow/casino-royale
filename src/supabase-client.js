import { createClient } from '@supabase/supabase-js';

// Same Supabase project as The Clock and Lava Rush — just its own tables.
const SUPABASE_URL = 'https://mspmobcppyiyplkufmtz.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_A7fjCgRgXFwdMrxPu6nPfg_e4esoT8l';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export const CASINO_PLAY_URL = 'https://mspmobcppyiyplkufmtz.supabase.co/functions/v1/casino-play';
