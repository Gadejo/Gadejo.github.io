# Database Migration Fix for Settings API Error

## Problem
The production Cloudflare Pages application is encountering a 500 Internal Server Error when calling `/api/settings`. The error occurs because:

1. The production database uses the basic schema (`schema.sql`) which doesn't include the `user_settings` table
2. The settings API code attempts to query the `user_settings` table which doesn't exist
3. This causes a database error that results in a 500 response

## Root Cause
The application has two schema files:
- `database/schema.sql` - Basic schema (used in production)
- `database/schema-enhanced.sql` - Enhanced schema with `user_settings` table

The API code was written to work with the enhanced schema, but production is using the basic schema.

## Solution

### 1. Enhanced Settings API
- Updated `functions/api/settings.ts` to gracefully handle missing tables
- Added `checkTableExists()` function to verify table existence before queries
- Improved error handling to return meaningful responses instead of 500 errors
- Added fallback to default settings when database operations fail

### 2. Database Migration
- Created `database/migration-add-user-settings.sql` to add the missing table
- Added npm scripts for easy migration execution
- Created `migrate-database.js` helper script with step-by-step instructions

### 3. Package.json Updates
Added new scripts:
- `npm run db:migrate:settings` - Apply the user_settings table migration
- `npm run db:check` - Check which tables exist in the database
- `npm run migrate:help` - Show migration instructions

## Quick Fix Steps

### Option 1: Apply Migration (Recommended)
```bash
# 1. Check current database tables
npm run db:check

# 2. Apply the migration if user_settings table doesn't exist
npm run db:migrate:settings

# 3. Verify the migration worked
npm run db:check

# 4. Deploy the updated functions
npm run cf:deploy
```

### Option 2: Full Schema Update (For new databases)
```bash
# Only use this on empty databases - it recreates all tables
npm run db:schema:enhanced
npm run db:seed:enhanced
npm run cf:deploy
```

## Files Changed

### Modified Files:
- `functions/api/settings.ts` - Enhanced with better error handling and table existence checks
- `package.json` - Added migration scripts

### New Files:
- `database/migration-add-user-settings.sql` - Migration to add user_settings table
- `migrate-database.js` - Helper script with instructions

## Testing
After applying the fix:
1. The `/api/settings` endpoint should return a 200 response instead of 500
2. Users will see default settings if they haven't saved any yet
3. The application will load successfully without the console errors
4. Settings can be saved and loaded properly once the migration is applied

## Backward Compatibility
The enhanced settings API maintains backward compatibility:
- Works with databases that have the `user_settings` table (enhanced schema)
- Works with databases that don't have the table (basic schema) by returning defaults
- Gracefully handles all error conditions without crashing

This fix ensures the application works regardless of which schema version is deployed, making it more robust and easier to maintain.
