const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key';

const isConfigured = Boolean(
  process.env.SUPABASE_URL &&
  !process.env.SUPABASE_URL.includes('placeholder') &&
  !process.env.SUPABASE_URL.includes('mock') &&
  !process.env.SUPABASE_URL.includes('your-project-id') &&
  process.env.NODE_ENV !== 'test'
);

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

module.exports = {
  supabase,
  isConfigured,
};
