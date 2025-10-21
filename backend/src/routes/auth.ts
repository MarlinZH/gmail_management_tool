import express, { Request, Response } from 'express';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// OAuth2 Client Setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Scopes required for Gmail access
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/userinfo.email'
];

/**
 * GET /auth/google
 * Initiates the OAuth flow by redirecting to Google's consent screen
 */
router.get('/google', (req: Request, res: Response) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
  res.redirect(authUrl);
});

/**
 * GET /auth/google/callback
 * Handles the OAuth callback from Google
 */
router.get('/google/callback', async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    return res.redirect(`${process.env.FRONTEND_URL}?error=no_code`);
  }

  try {
    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Store tokens in session
    if (req.session) {
      req.session.tokens = tokens;
    }

    // Redirect back to frontend with success
    res.redirect(`${process.env.FRONTEND_URL}?auth=success`);
  } catch (error) {
    console.error('Error getting tokens:', error);
    res.redirect(`${process.env.FRONTEND_URL}?error=auth_failed`);
  }
});

/**
 * GET /auth/status
 * Check if user is authenticated
 */
router.get('/status', (req: Request, res: Response) => {
  const isAuthenticated = !!(req.session && req.session.tokens);
  res.json({ authenticated: isAuthenticated });
});

/**
 * POST /auth/logout
 * Clear session and logout user
 */
router.post('/logout', (req: Request, res: Response) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  } else {
    res.json({ message: 'No active session' });
  }
});

export default router;
export { oauth2Client };
