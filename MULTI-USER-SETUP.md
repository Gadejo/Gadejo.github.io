# ADHD Learning RPG - Multi-User System Setup Guide

## Overview

Your ADHD Learning RPG now supports multiple users with complete data isolation, email-based authentication, and seamless user switching. Each user maintains their own private learning progress, achievements, and customizations.

## ✅ **What's Been Implemented**

### 🗄️ **Multi-User Database Schema**
- **Users Table**: Email-based authentication with profiles and overall stats
- **Session Management**: Secure token-based sessions (7-day expiry)
- **User Profiles**: Extended user information, achievements, and preferences
- **Data Isolation**: All learning data is properly linked to individual users
- **Global Achievements**: Shared achievement system with individual progress tracking

### 🔐 **Authentication System**
- **Email Registration**: Users create accounts with email, password, and display name
- **Secure Login**: SHA-256 password hashing with secure session tokens
- **Session Management**: 7-day token expiry with automatic refresh
- **User Switching**: Quick switching between registered users
- **Privacy Controls**: Each user's data remains completely separate

### 🎮 **User Interface**
- **AuthScreen Component**: Beautiful registration/login interface with user selection
- **UserSwitcher Component**: Header dropdown showing current user and switch options
- **User Selection**: Visual user cards showing progress statistics
- **Seamless UX**: Smooth transitions between authentication states

### 🛡️ **Security & Privacy**
- **Token-Based Auth**: All API calls require valid authentication tokens
- **Data Isolation**: Users can only access their own data (enforced at API level)
- **Session Security**: Automatic token validation and cleanup
- **Privacy by Design**: No cross-user data visibility

## 📋 **Database Tables Created**

### Core Tables
```sql
users                    -- User accounts and overall stats
user_sessions           -- Authentication sessions
user_profiles           -- Extended user information
```

### Learning Data (Per User)
```sql
subject_configs         -- Subject configurations
subjects               -- Learning progress per subject
sessions               -- Study session records
goals                  -- User learning goals
pips                   -- Daily progress tracking
user_templates         -- Custom subject templates
```

### Achievement System
```sql
global_achievements           -- System-wide achievements
user_achievement_progress    -- Individual achievement progress
```

## 🚀 **Deployment Steps**

### 1. Update Database Schema
```bash
# Apply the new multi-user schema
wrangler d1 execute adhd-learning-rpg --file=./database/schema.sql

# Add default achievements
wrangler d1 execute adhd-learning-rpg --file=./database/seed-data.sql
```

### 2. Deploy Updated Functions
```bash
# Build and deploy
npm run build
wrangler pages deploy dist --project-name=adhd-learning-rpg
```

### 3. Update Environment Variables
Ensure your D1 database binding is correctly configured in `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "adhd-learning-rpg"
database_id = "your-database-id"
```

## 👥 **User Experience Flow**

### First Time Users
1. **Landing Page**: Shows "Create New Account" option
2. **Registration**: Email, password, display name
3. **Automatic Login**: Immediately logged in after registration
4. **Fresh Start**: New user begins with default subjects and clean slate

### Returning Users
1. **User Selection**: Shows all registered users with their progress stats
2. **Quick Login**: Click user → enter password → immediate access
3. **Data Continuity**: All previous progress, subjects, and achievements intact

### User Switching
1. **Header Dropdown**: Click profile picture/name in header
2. **Switch Options**: See all available users and their basic stats
3. **Quick Switch**: Enter password for target user
4. **Seamless Transition**: Immediate access to that user's data

## 🔒 **Privacy & Security Features**

### Data Separation
- Each user's data is completely isolated
- No cross-user data visibility or access
- API endpoints enforce user-specific data queries

### Authentication Security
- Passwords are SHA-256 hashed
- Session tokens have 7-day expiry
- Automatic token cleanup for expired sessions
- IP and user agent tracking for session security

### Privacy Controls
Users can set privacy preferences:
- `private`: Data not visible to others (default)
- `public`: Basic stats visible to other users
- `friends`: Extended sharing (future feature)

## 📊 **User Statistics & Achievements**

### Individual Stats (Per User)
- Total study time across all subjects
- Current streak (days)
- Longest streak achieved
- Total sessions completed
- User level and XP

### Global Achievements (40+ Available)
**Study Time**: 1h, 10h, 50h, 100h, 500h milestones
**Streaks**: 3, 7, 14, 30, 60, 100-day streaks
**Sessions**: 10, 50, 100, 500, 1000 session milestones
**Diversity**: Multi-subject learning achievements
**Special**: Night owl, early bird, weekend warrior badges

## 🛠️ **API Changes Summary**

### Authentication Endpoints (`/api/auth`)
- `register`: Create new user account
- `login`: Authenticate user and create session
- `verify`: Validate session token
- `logout`: Invalidate session
- `getUsers`: List all registered users (for selection)
- `switchUser`: Switch to different user account

### Data Endpoints (`/api/data`)
- **Token Required**: All endpoints now require authentication token
- **User Isolation**: Data automatically filtered by authenticated user
- **Privacy Enforced**: Cannot access other users' data

### Template Endpoints (`/api/templates`)
- **User-Specific**: Templates are now per-user
- **Token Authentication**: Secure access to user templates

## 🔄 **Migration Strategy**

### For Existing Single-User Data
1. **Automatic Detection**: System detects existing localStorage data
2. **Migration Prompt**: User chooses to migrate or start fresh
3. **Seamless Transfer**: All existing progress transferred to new user account
4. **Data Preservation**: Nothing is lost in the migration process

### For New Multi-User Deployments
1. **Clean Installation**: Fresh database with multi-user schema
2. **First User Setup**: First person creates account and starts learning
3. **Additional Users**: Others can create their own accounts independently

## 🎯 **Key Benefits Achieved**

### ✅ **Individual Learning Journeys**
- Each person gets their own RPG character with unique progress
- Personal achievement unlocking and streak tracking
- Customized subjects and learning goals

### ✅ **Family/Group Friendly**
- Multiple family members can use the same installation
- Each child/adult maintains their own learning progress
- No interference between different users' data

### ✅ **Privacy & Security**
- Strong authentication prevents accidental data mixing
- Each user's learning data remains completely private
- Secure session management with automatic expiry

### ✅ **Motivational Features**
- Individual achievement systems encourage personal growth
- User-specific statistics show personal progress
- Friendly competition through visible (but private) progress stats

### ✅ **Seamless User Experience**
- Quick user switching without losing context
- Beautiful user selection interface
- Smooth authentication flow with helpful feedback

## 🧪 **Testing Checklist**

### User Management
- [ ] New user registration works correctly
- [ ] Login/logout functions properly
- [ ] User switching maintains separate data
- [ ] Session expiry and renewal working
- [ ] Password validation and security

### Data Isolation
- [ ] Each user sees only their own subjects
- [ ] Sessions are user-specific
- [ ] Goals and achievements are separate
- [ ] Templates don't cross between users
- [ ] Migration preserves data correctly

### UI/UX
- [ ] Auth screens are user-friendly
- [ ] User switcher shows correct information
- [ ] Error messages are helpful
- [ ] Loading states work smoothly
- [ ] Responsive design on all devices

## 🚨 **Important Notes**

1. **Breaking Change**: This is a major update that changes the database schema
2. **Migration Required**: Existing users need to migrate their data
3. **Session Management**: Users stay logged in for 7 days by default
4. **Email Validation**: Users must provide valid email addresses
5. **Password Security**: Minimum 6 characters required

## 🔧 **Troubleshooting**

### Common Issues
- **"Invalid token"**: User session expired, need to log in again
- **"User not found"**: Email not registered, check spelling or create account
- **Migration problems**: Clear localStorage and start fresh if migration fails

### Database Issues
- **Connection errors**: Verify D1 database configuration in wrangler.toml
- **Schema errors**: Ensure both schema.sql and seed-data.sql were applied
- **Permission errors**: Check Cloudflare Pages has access to D1 database

Your ADHD Learning RPG is now a powerful multi-user system that maintains all the original functionality while adding robust user management, security, and privacy features. Each user gets their own personalized learning journey with complete data isolation and a seamless experience.