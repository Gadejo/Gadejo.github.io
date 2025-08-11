# Testing Your ADHD Learning RPG Setup

## Pre-Deployment Testing

### 1. Local Development Test
```bash
npm install
npm run dev
```
- Verify the app loads without errors
- Test localStorage functionality (should work without authentication)
- Check that all components render properly

### 2. Build Test
```bash
npm run build
npm run preview
```
- Ensure the production build works correctly
- Verify there are no build errors or warnings

## Post-Deployment Testing Checklist

### Authentication Flow
- [ ] First-time setup: Can create a password
- [ ] Login: Can authenticate with the correct password
- [ ] Login: Cannot authenticate with incorrect password
- [ ] Session: Stays logged in for 24 hours
- [ ] Session: Automatically logs out after 24 hours
- [ ] Logout: Can manually log out

### Data Migration
- [ ] Migration prompt appears for users with localStorage data
- [ ] Migration successfully transfers all data to D1
- [ ] Migration handles empty localStorage gracefully
- [ ] Can skip migration and start fresh

### Core Functionality
- [ ] Create new subjects
- [ ] Add study sessions
- [ ] Track daily pips
- [ ] Create and manage goals
- [ ] View statistics and progress
- [ ] Import/export data still works
- [ ] Template system functions properly

### Cross-Device Sync
- [ ] Data syncs between devices with same password
- [ ] Changes on one device appear on another
- [ ] Offline changes sync when reconnected
- [ ] Concurrent usage doesn't corrupt data

### Performance & Reliability
- [ ] App loads quickly on first visit
- [ ] Subsequent loads are fast (caching working)
- [ ] Works offline (localStorage fallback)
- [ ] Handles network failures gracefully
- [ ] No data loss during network issues

## Manual Testing Script

### Test Account Setup
1. Open the deployed app
2. Enter password "TestPass123!"
3. Should see successful first-time setup

### Test Data Creation
```javascript
// Run in browser console after login
// Create test subject
const testSubject = {
  id: 'test-subject',
  name: 'Test Subject',
  emoji: '🧪',
  color: '#FF6B6B',
  achievements: [],
  questTypes: [
    { id: 'easy', name: 'Easy', duration: 15, xp: 10, emoji: '🌟' }
  ],
  pipAmount: 5,
  targetHours: 8,
  resources: []
};

// Add session
const testSession = {
  subjectId: 'test-subject',
  duration: 30,
  date: new Date().toISOString(),
  notes: 'Test session',
  questType: 'easy'
};

console.log('Test subject:', testSubject);
console.log('Test session:', testSession);
```

### Test Cross-Device Sync
1. Login on Device A
2. Add a study session
3. Login on Device B with same password
4. Verify the session appears on Device B
5. Add a session on Device B
6. Check that it appears on Device A

### Database Verification
```bash
# Check if data was saved to D1
wrangler d1 execute adhd-learning-rpg --command="SELECT COUNT(*) FROM users;"
wrangler d1 execute adhd-learning-rpg --command="SELECT * FROM sessions LIMIT 5;"
```

## Expected Results

### Successful Authentication
- Login screen appears for unauthenticated users
- First-time users can set up password
- Returning users can log in with existing password
- Invalid passwords are rejected

### Data Persistence
- All actions save to D1 database when online
- Falls back to localStorage when offline
- Data migrates properly from localStorage to D1
- No data loss during migration

### Cross-Device Experience
- Same experience across all devices
- Real-time sync of study progress
- Consistent UI and functionality
- Secure password-based access

## Troubleshooting Common Issues

### "Failed to load data" Error
- Check D1 database configuration
- Verify API endpoints are deployed
- Check browser network tab for failed requests

### Authentication Not Working
- Clear browser storage completely
- Check that auth API returns proper responses
- Verify password hashing is consistent

### Migration Fails
- Check if localStorage data exists
- Verify migration API endpoint works
- Check for network connectivity issues

### Cross-Device Sync Issues
- Ensure same password on both devices
- Check for API connectivity
- Verify data is saving to D1 database