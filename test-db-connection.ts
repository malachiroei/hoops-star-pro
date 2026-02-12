/**
 * Test Database Connection Script
 * This script tests if we can connect to Supabase and insert data
 * 
 * Run with: npx ts-node test-db-connection.ts
 * (Make sure to set SUPABASE_SERVICE_ROLE_KEY in .env.local)
 */

import { createClient } from "@supabase/supabase-js";

// Load from .env
const supabaseUrl = "https://gyxqczdhzsndzcqfqmgl.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error("❌ ERROR: SUPABASE_SERVICE_ROLE_KEY not found in environment variables");
  console.error("Please set it in .env.local or pass it as an environment variable");
  process.exit(1);
}

console.log("🔍 Testing Supabase Connection...");
console.log(`   Project URL: ${supabaseUrl}`);
console.log(`   Service Key: ${supabaseServiceKey.substring(0, 20)}...`);

// Create client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  // Step 1: Check if table exists by reading
  console.log("\n📋 Step 1: Reading existing data from league_standings...");
  const { data: existing, error: readError } = await supabase
    .from("league_standings")
    .select("*");

  if (readError) {
    console.error("❌ Read Error:", readError.message);
    return;
  }

  console.log(`✅ Read successful! Found ${existing?.length || 0} existing teams`);
  if (existing && existing.length > 0) {
    console.log("   First team:", existing[0]);
  }

  // Step 2: Insert a test team
  console.log("\n🧪 Step 2: Inserting test team...");
  const testTeam = {
    name: "🧪 Test Team - Connection Verification",
    position: 999,
    points: 0,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    updatedAt: new Date().toISOString(),
  };

  const { data: inserted, error: insertError } = await supabase
    .from("league_standings")
    .insert([testTeam])
    .select();

  if (insertError) {
    console.error("❌ Insert Error:", insertError.message);
    console.error("   Code:", insertError.code);
    console.error("   Details:", JSON.stringify(insertError));
    return;
  }

  console.log("✅ Insert successful!");
  console.log(`   Data: ${JSON.stringify(inserted)}`);

  // Step 3: Read again to verify
  console.log("\n✔️ Step 3: Verifying data was saved...");
  const { data: verified, error: verifyError } = await supabase
    .from("league_standings")
    .select("*")
    .eq("position", 999);

  if (verifyError) {
    console.error("❌ Verify Error:", verifyError.message);
    return;
  }

  if (verified && verified.length > 0) {
    console.log("✅ Verification successful! Test team is in the database");
    console.log(`   Team: ${verified[0].name}`);
  } else {
    console.error("❌ Test team not found in database (insert may have failed silently)");
  }

  // Step 4: Count total teams
  console.log("\n📊 Step 4: Counting total teams in database...");
  const { count, error: countError } = await supabase
    .from("league_standings")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("❌ Count Error:", countError.message);
    return;
  }

  console.log(`✅ Total teams in database: ${count}`);

  // Step 5: Delete test team
  console.log("\n🧹 Step 5: Cleaning up test team...");
  const { error: deleteError } = await supabase
    .from("league_standings")
    .delete()
    .eq("position", 999);

  if (deleteError) {
    console.error("❌ Delete Error:", deleteError.message);
    return;
  }

  console.log("✅ Test team deleted");

  console.log("\n" + "═".repeat(60));
  console.log("✅ ALL TESTS PASSED - Database connection is working!");
  console.log("═".repeat(60));
}

testConnection().catch((error) => {
  console.error("\n❌ FATAL ERROR:", error);
  process.exit(1);
});
