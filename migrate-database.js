#!/usr/bin/env node

/**
 * Database Migration Script for ADHD Learning RPG
 * This script applies the user_settings table migration to the production database
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Database Migration Script');
console.log('=============================');
console.log('');

console.log('This script will help you migrate your database to add the user_settings table.');
console.log('');

console.log('Steps to apply the migration:');
console.log('');
console.log('1. Connect to your Cloudflare D1 database:');
console.log('   npx wrangler d1 execute adhd-learning-rpg --command="SELECT name FROM sqlite_master WHERE type=\'table\' ORDER BY name;"');
console.log('');
console.log('2. Check if user_settings table exists in the output above.');
console.log('   If it does NOT exist, continue to step 3.');
console.log('');
console.log('3. Apply the migration by running:');
console.log('   npx wrangler d1 execute adhd-learning-rpg --file="./database/migration-add-user-settings.sql"');
console.log('');
console.log('4. Verify the migration worked:');
console.log('   npx wrangler d1 execute adhd-learning-rpg --command="SELECT sql FROM sqlite_master WHERE name=\'user_settings\';"');
console.log('');
console.log('5. Deploy your updated functions:');
console.log('   npm run deploy');
console.log('');

// Check if migration file exists
const migrationPath = path.join(__dirname, '..', 'database', 'migration-add-user-settings.sql');
if (fs.existsSync(migrationPath)) {
  console.log('✅ Migration file found: ./database/migration-add-user-settings.sql');
} else {
  console.log('❌ Migration file not found. Please ensure migration-add-user-settings.sql exists in the database folder.');
}

console.log('');
console.log('Alternative: If you want to use the full enhanced schema:');
console.log('   npx wrangler d1 execute adhd-learning-rpg --file="./database/schema-enhanced.sql"');
console.log('   (Warning: This will recreate all tables - only use on empty databases)');
console.log('');
