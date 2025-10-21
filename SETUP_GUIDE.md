# Complete Setup Guide for Gmail Management Tool

This guide will walk you through setting up the Gmail Management Tool from scratch.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Google Cloud Setup](#google-cloud-setup)
3. [Backend Installation](#backend-installation)
4. [Frontend Installation](#frontend-installation)
5. [Running the Application](#running-the-application)
6. [Verification](#verification)
7. [Common Issues](#common-issues)

---

## Prerequisites

### Required Software

- **Node.js** (v18 or higher)
  - Download: https://nodejs.org/
  - Verify: `node --version`
  
- **npm** (comes with Node.js)
  - Verify: `npm --version`
  
- **Git**
  - Download: https://git-scm.com/
  - Verify: `git --version`

### Required Accounts

- **Google Account** - for Gmail access
- **Google Cloud Account** - for API credentials (free tier available)

---

## Google Cloud Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "NEW PROJECT"
4. Enter project name: `Gmail Manager` (or your choice)
5. Click "CREATE"
6. Wait for project creation (1-2 minutes)
7. Select the new project from the dropdown

### Step 2: Enable Gmail API

1. In Google Cloud Console, go to **"APIs & Services"** > **"Library"**
2. Search for **"Gmail API"**
3. Click on **"Gmail API"** in the results
4. Click **"ENABLE"** button
5. Wait for activation (a few seconds)

### Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** > **"OAuth consent screen"**
2. Select **"External"** user type
3. Click **"CREATE"**
4. Fill in required fields:
   - **App name**: `Gmail Manager`
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click **"SAVE AND CONTINUE"**
6. On "Scopes" page, click **"ADD OR REMOVE SCOPES"**
7. Search and add these scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.modify`
   - `https://www.googleapis.com/auth/userinfo.email`
8. Click **"UPDATE"** then **"SAVE AND CONTINUE"**
9. On "Test users" page, click **"ADD USERS"**
10. Add your email address (the one you'll use to test)
11. Click **"SAVE AND CONTINUE"**
12. Review and click **"BACK TO DASHBOARD"**

### Step 4: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** > **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"OAuth client ID"**
4. Choose **"Web application"**
5. Enter name: `Gmail Manager Web Client`
6. Under **"Authorized redirect URIs"**, click **"+ ADD URI"**
7. Enter: `http://localhost:3001/auth/google/callback`
8. Click **"CREATE"**
9. A dialog will appear with your credentials
10. **IMPORTANT**: Copy both:
    - **Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)
    - **Client Secret** (random string)
11. Click **"OK"**

---

## Backend Installation

### Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/MarlinZH/gmail_management_tool.git

# Navigate to backend directory
cd gmail_management_tool/backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages (may take 2-3 minutes).

### Step 3: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env
```

Now edit the `.env` file with your favorite text editor:

```bash
# On Mac/Linux
nano .env

# On Windows
notepad .env
```

Replace the placeholder values:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Paste your Google OAuth credentials here
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback

# Generate a random string for session secret (30+ characters)
SESSION_SECRET=your_random_secret_string_here_make_it_long_and_random
```

**To generate a random SESSION_SECRET:**

```bash
# On Mac/Linux
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use an online generator:
# https://www.random.org/strings/
```

Save and close the file.

### Step 4: Verify Backend Setup

```bash
# Test the backend
npm run dev
```

You should see:
```
✅ Server running on http://localhost:3001
📧 Gmail Manager Backend Ready
```

Press `Ctrl+C` to stop the server.

---

## Frontend Installation

### Step 1: Navigate to Frontend Directory

```bash
# From the backend directory
cd ../frontend

# Or from project root
cd gmail_management_tool/frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages (may take 2-3 minutes).

### Step 3: Verify Frontend Setup

```bash
# Test the frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Press `Ctrl+C` to stop the server.

---

## Running the Application

### You need TWO terminal windows:

**Terminal 1 - Backend:**
```bash
cd gmail_management_tool/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd gmail_management_tool/frontend
npm run dev
```

### Access the Application

Open your web browser and go to:
```
http://localhost:5173
```

---

## Verification

### Test the Authentication Flow

1. **Visit** `http://localhost:5173`
2. You should see a **login screen** with "Sign in with Google" button
3. **Click** "Sign in with Google"
4. You'll be redirected to Google's sign-in page
5. **Select** your Google account
6. **Review** the permissions requested
7. **Click** "Allow" or "Continue"
8. You should be redirected back to the app
9. The app should now show your **emails grouped by sender**

### Test the Functionality

1. **Search**: Try searching for a sender in the search box
2. **Filter**: Use the category dropdown to filter emails
3. **Select**: Click checkboxes to select senders
4. **Analyze**: Click "Analyze Inbox" button
5. **Refresh**: Click the refresh button to reload emails

⚠️ **Don't test the delete function with important emails yet!**

---

## Common Issues

### Issue 1: "Cannot connect to server"

**Solution:**
- Make sure backend is running on port 3001
- Check if another application is using port 3001
- Verify `FRONTEND_URL` in backend `.env` is `http://localhost:5173`

### Issue 2: "OAuth error" or "Redirect URI mismatch"

**Solution:**
- Verify redirect URI in Google Cloud Console matches exactly:
  `http://localhost:3001/auth/google/callback`
- Check `GOOGLE_REDIRECT_URI` in `.env` matches the above
- No trailing slashes!

### Issue 3: "Failed to fetch emails"

**Solution:**
- Ensure Gmail API is enabled in Google Cloud Console
- Check if you added yourself as a test user
- Verify OAuth scopes are correctly configured
- Try logging out and logging in again

### Issue 4: "Module not found" errors

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Issue 5: Port already in use

**Solution:**
```bash
# Find and kill the process using the port
# On Mac/Linux:
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# On Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Issue 6: "CORS error"

**Solution:**
- Check that backend `.env` has correct `FRONTEND_URL`
- Make sure you're accessing frontend at `http://localhost:5173` (not 127.0.0.1)
- Restart both backend and frontend servers

### Issue 7: "Access blocked: This app's request is invalid"

**Solution:**
- You didn't add your email as a test user
- Go back to OAuth consent screen in Google Cloud Console
- Add your email to "Test users" list

---

## Next Steps

✅ Your Gmail Management Tool is now set up!

Recommended actions:

1. **Test with a small inbox** first
2. **Backup important emails** before bulk deletion
3. **Review the categories** to understand how emails are classified
4. **Read the main README.md** for usage details
5. **Consider implementing** the AI features from the roadmap

---

## Production Deployment (Optional)

### For production use, you'll need to:

1. **Publish OAuth consent screen**:
   - Go to OAuth consent screen in Google Cloud Console
   - Click "PUBLISH APP"
   - Submit for verification (required for >100 users)

2. **Set up environment variables** on your hosting platform

3. **Update redirect URIs** to your production domain

4. **Enable HTTPS** (required for OAuth in production)

5. **Set `NODE_ENV=production`** in backend

---

## Getting Help

If you're still having issues:

1. Check the [main README troubleshooting section](README.md#troubleshooting)
2. Review [Gmail API documentation](https://developers.google.com/gmail/api)
3. Check the browser console for error messages (F12)
4. Check backend terminal for error logs
5. Open an issue on GitHub with:
   - Your Node.js version
   - Error messages
   - Steps to reproduce

---

**Happy inbox cleaning! 🎉**
