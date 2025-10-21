# Gmail Manager Backend

Node.js/Express backend for Gmail Management Tool with OAuth 2.0 and Gmail API integration.

## Features

- ✅ OAuth 2.0 authentication with Google
- ✅ Fetch Gmail messages with metadata
- ✅ Group emails by sender
- ✅ Bulk delete emails by sender
- ✅ Auto-categorization of emails
- ✅ Session management
- ✅ CORS enabled for frontend integration

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Gmail API:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click "Enable"

4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URI: `http://localhost:3001/auth/google/callback`
   - Download the credentials JSON

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
PORT=3001
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
SESSION_SECRET=generate_a_random_secret_here
```

### 4. Run the Server

**Development mode:**
```bash
npm run dev
```

**Production build:**
```bash
npm run build
npm start
```

Server will run on `http://localhost:3001`

## API Endpoints

### Authentication

- `GET /auth/google` - Initiate OAuth flow
- `GET /auth/google/callback` - OAuth callback
- `GET /auth/status` - Check authentication status
- `POST /auth/logout` - Logout user

### Gmail Operations

- `GET /api/gmail/messages` - Fetch messages
  - Query params: `maxResults` (default: 100), `q` (search query)
  
- `GET /api/gmail/senders` - Get grouped senders
  - Query params: `maxResults` (default: 500)
  
- `POST /api/gmail/delete` - Delete emails by sender
  - Body: `{ "senders": ["email1@example.com", "email2@example.com"] }`

### Health Check

- `GET /health` - Server health status

## Email Categories

The backend automatically categorizes emails into:

- **promotional** - Newsletters, marketing, sales
- **social** - Social media notifications
- **billing** - Invoices, receipts, payments
- **security** - Security alerts, verification
- **transactional** - Order confirmations, no-reply
- **work** - Default category

## Security Notes

- Never commit `.env` file or credentials
- Use HTTPS in production
- Set `NODE_ENV=production` in production
- Rotate `SESSION_SECRET` regularly
- Review OAuth scopes before deployment

## Scopes Used

- `gmail.readonly` - Read email metadata
- `gmail.modify` - Delete emails
- `userinfo.email` - Get user email address

## Troubleshooting

**"Not authenticated" error:**
- Make sure you've completed OAuth flow
- Check if session is properly configured

**"Failed to fetch messages" error:**
- Verify Gmail API is enabled
- Check OAuth credentials are correct
- Ensure redirect URI matches exactly

**CORS errors:**
- Verify `FRONTEND_URL` in `.env` matches your frontend URL
- Check CORS configuration in `index.ts`
