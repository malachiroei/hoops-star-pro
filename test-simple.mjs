/**
 * MINIMAL CONNECTION TEST
 * This script tests if we can insert ONE row into Supabase
 * 
 * Setup:
 * 1. Fill in your .env.local with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * 2. Run: node test-simple.mjs
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: `${__dirname}/.env.local` });

// Load from environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n═══════════════════════════════════════════════════════');
console.log('🧪 CONNECTION TEST - Minimal Insert');
console.log('═══════════════════════════════════════════════════════\n');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ ERROR: Missing environment variables!\n');
  console.error('Required:');
  console.error('  SUPABASE_URL');
  console.error('  SUPABASE_SERVICE_ROLE_KEY\n');
  console.error('Setup:');
  console.error('  1. Copy .env.local.example → .env.local');
  console.error('  2. Get your keys from: https://supabase.com/dashboard/project/_/settings/api');
  console.error('  3. Fill in .env.local with your actual keys\n');
  process.exit(1);
}

console.log(`📍 Project URL: ${SUPABASE_URL}`);
console.log(`🔑 Service Key: ${SUPABASE_SERVICE_ROLE_KEY.substring(0, 10)}...\n`);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  try {
    // Insert test row
    console.log('💾 Inserting test row...');
    const { data, error } = await supabase
      .from('league_standings')
      .insert([
        {
          name: 'CONNECTION_TEST',
          position: 999,
          points: 0,
          gamesPlayed: 0,
          wins: 0,
          losses: 0,
          updatedAt: new Date().toISOString(),
        }
      ])
      .select();

    if (error) {
      console.error('\n❌ INSERT FAILED!\n');
      console.error('Error:', error.message);
      console.error('Code:', error.code);
      console.error('Details:', JSON.stringify(error, null, 2));
      process.exit(1);
    }

    console.log('✅ INSERT SUCCESSFUL!\n');
    console.log('Data inserted:');
    console.log(JSON.stringify(data, null, 2));

    // Verify it's there
    console.log('\n🔍 Verifying row exists...');
    const { data: verify, error: verifyError } = await supabase
      .from('league_standings')
      .select('*')
      .eq('name', 'CONNECTION_TEST');

    if (verifyError) {
      console.error('❌ Verify failed:', verifyError.message);
      process.exit(1);
    }

    if (verify && verify.length > 0) {
      console.log('✅ Row verified in database!\n');
      console.log(JSON.stringify(verify[0], null, 2));
    } else {
      console.error('❌ Row NOT found in database!');
      process.exit(1);
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ CONNECTION TEST PASSED!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\nNow check your Supabase Table Editor:');
    console.log('  1. Go to: https://supabase.com/dashboard');
    console.log('  2. Click table: league_standings');
    console.log('  3. Look for: CONNECTION_TEST row (position 999)\n');

  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error);
    process.exit(1);
  }
})();
