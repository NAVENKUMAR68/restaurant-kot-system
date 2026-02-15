# SmartKOT Configuration Guide

## Environment Variables Setup

Before running the SmartKOT application, you must configure the following environment variables:

### 1. MongoDB Atlas Connection

**Variable:** `MONGODB_URI`

**Value:**
```
mongodb+srv://ss3534418_db_user:mRAideUHn9E3QVxE@cluster0.hy7yraz.mongodb.net/smartkot
```

This is your MongoDB Atlas connection string. It includes:
- Username: ss3534418_db_user
- Password: mRAideUHn9E3QVxE
- Cluster: cluster0.hy7yraz.mongodb.net
- Database: smartkot

### 2. NextAuth Secret

**Variable:** `NEXTAUTH_SECRET`

**Value:**
```
smartkot_secret_123
```

This secret is used to encrypt session tokens and CSRF tokens. In production, use a strong, random secret.

### 3. NextAuth URL

**Variable:** `NEXTAUTH_URL`

**Value:**
```
http://localhost:3000
```

For local development, use `http://localhost:3000`. In production, use your actual domain URL.

## Setup Instructions

1. **For Local Development (.env.local):**
   - Create a `.env.local` file in the project root
   - Add the environment variables with the values above:
     ```
     MONGODB_URI=mongodb+srv://ss3534418_db_user:mRAideUHn9E3QVxE@cluster0.hy7yraz.mongodb.net/smartkot
     NEXTAUTH_URL=http://localhost:3000
     NEXTAUTH_SECRET=smartkot_secret_123
     ```
   - Save the file (do NOT commit to version control)

2. **For Vercel Deployment:**
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add each variable:
     - MONGODB_URI
     - NEXTAUTH_URL (use your production domain)
     - NEXTAUTH_SECRET (use a strong, random secret)

3. **Verify Configuration:**
   - After setting environment variables, restart your development server
   - Visit `http://localhost:3000/api/health` to verify the connection
   - You should see a response indicating "MongoDB connected successfully"

## Database Connection Details

The application uses MongoDB Atlas with the following features:
- Connection pooling (min: 2, max: 10 connections)
- Server selection timeout: 5 seconds
- Automatic retry on connection failures
- Connection caching to prevent multiple connections

## Authentication Configuration

NextAuth is configured with:
- Credentials provider (email/password)
- MongoDB adapter for session and user storage
- Role-based access control (Admin, Manager, Chef)
- Automatic session management

## Troubleshooting

### "MONGODB_URI is not defined"
- Ensure the MONGODB_URI environment variable is set in .env.local or Vercel
- Restart your development server after adding the variable
- Check that there are no typos in the variable name

### "Failed to connect to MongoDB"
- Verify the MongoDB Atlas credentials are correct
- Check that your IP address is whitelisted in MongoDB Atlas (Network Access)
- Ensure the cluster is active and not paused
- Check your internet connection

### "NextAuth authentication failed"
- Verify NEXTAUTH_SECRET is set
- Verify NEXTAUTH_URL matches your domain
- Clear browser cookies and try again
- Check that MongoDB is properly connected

## Testing the Connection

Visit the health check endpoint to verify everything is working:
```
http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "MongoDB connected successfully",
  "mongodbUri": "configured",
  "nextAuthUrl": "configured",
  "nextAuthSecret": "configured"
}
```

## Security Notes

- Never commit `.env.local` to version control
- Use strong, random secrets in production
- Rotate `NEXTAUTH_SECRET` periodically in production
- Enable IP whitelisting in MongoDB Atlas for production
- Use HTTPS (not HTTP) for production `NEXTAUTH_URL`
