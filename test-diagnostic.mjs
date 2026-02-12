/**
 * DIAGNOSTIC: Show exactly which Supabase project we're connecting to
 * Helps identify if we're using the right credentials
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: `${__dirname}/.env.local` });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n═══════════════════════════════════════════════════════');
console.log('🔍 DIAGNOSTIC: Supabase Project Connection');
console.log('═══════════════════════════════════════════════════════\n');

console.log('📍 URL from .env.local:');
console.log(`   ${SUPABASE_URL}\n`);

console.log('🔑 Service Key from .env.local:');
console.log(`   ${SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20)}...\n`);

// Extract project ID from URL
const projectId = SUPABASE_URL?.split('//')[1]?.split('.')[0];
console.log('📊 Extracted Project ID:');
console.log(`   ${projectId}\n`);

// Create client with these credentials
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  try {
    // Try to read from league_standings to see if table exists
    const { data, error, count } = await supabase
      .from('league_standings')
      .select('name', { count: 'exact' });

    console.log('📋 Table league_standings check:');
    
    if (error) {
      console.error(`   ❌ Error: ${error.message}\n`);
    } else {
      console.log(`   ✅ Table exists`);
      console.log(`   📊 Row count: ${count}\n`);
      
      if (data && data.length > 0) {
        console.log('   First 5 rows:');
        data.slice(0, 5).forEach((row, i) => {
          console.log(`     ${i + 1}. ${row.name}`);
        });
      } else {
        console.log('   ⚠️  Table is EMPTY - no rows found\n');
      }
    }

    // Specifically look for CONNECTION_TEST
    console.log('\n🧪 Looking for CONNECTION_TEST row...');
    const { data: testRow, error: testError } = await supabase
      .from('league_standings')
      .select('*')
      .eq('name', 'CONNECTION_TEST');

    if (testError) {
      console.error(`   ❌ Error: ${testError.message}`);
    } else if (testRow && testRow.length > 0) {
      console.log(`   ✅ FOUND! Row exists:\n`);
      console.log(JSON.stringify(testRow[0], null, 2));
    } else {
      console.log('   ❌ NOT FOUND - CONNECTION_TEST does not exist in this project\n');
      console.log('   This means we are connected to the WRONG Supabase project!\n');
    }

    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ FATAL ERROR:', error);
  }
})();
