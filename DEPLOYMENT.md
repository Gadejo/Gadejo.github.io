# ADHD Learning RPG - Cloudflare D1 Deployment Guide

This guide will help you deploy your ADHD Learning RPG with Cloudflare D1 database integration.

## Prerequisites

1. A Cloudflare account
2. Node.js and npm installed
3. Wrangler CLI installed: `npm install -g wrangler`

## Step 1: Set up Cloudflare D1 Database

1. **Create a D1 database:**
   ```bash
   wrangler d1 create adhd-learning-rpg
   ```

2. **Copy the database ID** from the output and update `wrangler.toml`:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "adhd-learning-rpg"
   database_id = "your-database-id-here"  # Replace this
   ```

3. **Initialize the database schema:**
   ```bash
   wrangler d1 execute adhd-learning-rpg --file=./database/schema.sql
   ```

## Step 2: Deploy to Cloudflare Pages

### Option A: Deploy via Wrangler CLI

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy:**
   ```bash
   wrangler pages deploy dist --project-name=adhd-learning-rpg
   ```

### Option B: Deploy via Cloudflare Dashboard

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Go to Cloudflare Pages** in your dashboard

3. **Create a new project** and upload the `dist` folder

4. **Configure environment variables** in the Pages dashboard:
   - Go to your project settings
   - Add D1 database binding: `DB` → `adhd-learning-rpg`

## Step 3: Configure Custom Domain (Optional)

1. In your Pages project settings, go to "Custom domains"
2. Add your domain and configure DNS

## Step 4: Test the Deployment

1. Visit your deployed site
2. Set up your password (first-time setup)
3. Test creating subjects, adding sessions
4. Verify cross-device sync by logging in from another device

## Environment Configuration

### Production Environment Variables
- `NODE_ENV=production` (automatically set by Cloudflare)

### D1 Database Binding
- Binding name: `DB`
- Database: `adhd-learning-rpg`

## Local Development

To test the D1 integration locally:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start local development with D1:**
   ```bash
   wrangler pages dev -- npm run dev
   ```

This will run your Vite dev server with Cloudflare Pages Functions and D1 database locally.

## Database Management

### View database contents:
```bash
wrangler d1 execute adhd-learning-rpg --command="SELECT * FROM users;"
```

### Backup database:
```bash
wrangler d1 export adhd-learning-rpg --output=backup.sql
```

### Reset database (careful!):
```bash
wrangler d1 execute adhd-learning-rpg --file=./database/schema.sql
```

## Security Notes

- Passwords are hashed using SHA-256
- Sessions expire after 24 hours
- Data is private and single-user by design
- All API endpoints require authentication
- Cross-device sync uses the same password for authentication

## Troubleshooting

### Database Connection Issues
- Verify the database ID in `wrangler.toml`
- Check that the D1 binding is properly configured
- Ensure the database schema was applied successfully

### Authentication Issues
- Clear browser storage and try again
- Verify the auth API endpoints are working
- Check browser console for error messages

### Migration Issues
- Ensure you're authenticated before attempting migration
- Check that localStorage contains the expected data
- Verify the migration API endpoint is accessible

## Cost Considerations

Cloudflare D1 has a generous free tier:
- 5GB storage
- 25 million row reads/month
- 50,000 row writes/month

For personal use, this should be more than sufficient for the ADHD Learning RPG.