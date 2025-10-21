import express, { Request, Response } from 'express';
import { google } from 'googleapis';
import { oauth2Client } from './auth';

const router = express.Router();

// Middleware to check authentication
const requireAuth = (req: Request, res: Response, next: any) => {
  if (!req.session || !req.session.tokens) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  oauth2Client.setCredentials(req.session.tokens);
  next();
};

/**
 * GET /api/gmail/messages
 * Fetch messages from Gmail inbox
 */
router.get('/messages', requireAuth, async (req: Request, res: Response) => {
  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const maxResults = parseInt(req.query.maxResults as string) || 100;

    // Get list of message IDs
    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      maxResults: maxResults,
      q: req.query.q as string || '' // Optional search query
    });

    const messages = listResponse.data.messages || [];

    if (messages.length === 0) {
      return res.json({ emails: [], count: 0 });
    }

    // Fetch full details for each message (in batches for efficiency)
    const emailPromises = messages.map(async (message) => {
      const msg = await gmail.users.messages.get({
        userId: 'me',
        id: message.id!,
        format: 'metadata',
        metadataHeaders: ['From', 'Subject', 'Date']
      });

      const headers = msg.data.payload?.headers || [];
      const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
      const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
      const date = headers.find(h => h.name === 'Date')?.value || '';

      // Extract email address from "Name <email@domain.com>" format
      const emailMatch = from.match(/<(.+?)>/) || from.match(/([^\s]+@[^\s]+)/);
      const senderEmail = emailMatch ? emailMatch[1] : from;

      return {
        id: message.id,
        sender: senderEmail,
        senderFull: from,
        subject: subject,
        date: date,
        threadId: msg.data.threadId,
        labelIds: msg.data.labelIds || []
      };
    });

    const emails = await Promise.all(emailPromises);

    res.json({
      emails: emails,
      count: emails.length
    });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages', details: error.message });
  }
});

/**
 * GET /api/gmail/senders
 * Get grouped list of senders with email counts
 */
router.get('/senders', requireAuth, async (req: Request, res: Response) => {
  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const maxResults = parseInt(req.query.maxResults as string) || 500;

    // Get list of message IDs
    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      maxResults: maxResults
    });

    const messages = listResponse.data.messages || [];

    if (messages.length === 0) {
      return res.json({ senders: [], count: 0 });
    }

    // Fetch sender info for each message
    const senderMap = new Map<string, any>();

    const promises = messages.map(async (message) => {
      try {
        const msg = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!,
          format: 'metadata',
          metadataHeaders: ['From', 'Subject', 'Date']
        });

        const headers = msg.data.payload?.headers || [];
        const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
        const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
        const date = headers.find(h => h.name === 'Date')?.value || '';

        // Extract email address
        const emailMatch = from.match(/<(.+?)>/) || from.match(/([^\s]+@[^\s]+)/);
        const senderEmail = emailMatch ? emailMatch[1] : from;

        if (!senderMap.has(senderEmail)) {
          senderMap.set(senderEmail, {
            sender: senderEmail,
            senderFull: from,
            count: 0,
            emails: [],
            category: categorizeSender(senderEmail, subject)
          });
        }

        const senderData = senderMap.get(senderEmail);
        senderData.count++;
        senderData.emails.push({
          id: message.id,
          subject: subject,
          date: date
        });
      } catch (error) {
        console.error(`Error processing message ${message.id}:`, error);
      }
    });

    await Promise.all(promises);

    // Convert map to array and sort by count
    const senders = Array.from(senderMap.values())
      .sort((a, b) => b.count - a.count);

    res.json({
      senders: senders,
      count: senders.length
    });
  } catch (error: any) {
    console.error('Error fetching senders:', error);
    res.status(500).json({ error: 'Failed to fetch senders', details: error.message });
  }
});

/**
 * POST /api/gmail/delete
 * Delete emails from specified senders
 */
router.post('/delete', requireAuth, async (req: Request, res: Response) => {
  try {
    const { senders } = req.body;

    if (!senders || !Array.isArray(senders) || senders.length === 0) {
      return res.status(400).json({ error: 'No senders provided' });
    }

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    let deletedCount = 0;

    // For each sender, find and delete their emails
    for (const sender of senders) {
      // Search for emails from this sender
      const searchQuery = `from:${sender}`;
      const listResponse = await gmail.users.messages.list({
        userId: 'me',
        q: searchQuery,
        maxResults: 500 // Gmail API limit
      });

      const messages = listResponse.data.messages || [];

      if (messages.length > 0) {
        // Batch delete (Gmail API supports batchDelete)
        const messageIds = messages.map(m => m.id!);
        
        await gmail.users.messages.batchDelete({
          userId: 'me',
          requestBody: {
            ids: messageIds
          }
        });

        deletedCount += messageIds.length;
      }
    }

    res.json({
      success: true,
      deletedCount: deletedCount,
      message: `Deleted ${deletedCount} emails from ${senders.length} sender(s)`
    });
  } catch (error: any) {
    console.error('Error deleting messages:', error);
    res.status(500).json({ error: 'Failed to delete messages', details: error.message });
  }
});

/**
 * Helper function to categorize senders
 */
function categorizeSender(email: string, subject: string): string {
  const lowerEmail = email.toLowerCase();
  const lowerSubject = subject.toLowerCase();

  // Promotional
  if (
    lowerEmail.includes('newsletter') ||
    lowerEmail.includes('promo') ||
    lowerEmail.includes('marketing') ||
    lowerSubject.includes('sale') ||
    lowerSubject.includes('offer') ||
    lowerSubject.includes('discount')
  ) {
    return 'promotional';
  }

  // Social
  if (
    lowerEmail.includes('facebook') ||
    lowerEmail.includes('twitter') ||
    lowerEmail.includes('linkedin') ||
    lowerEmail.includes('instagram') ||
    lowerEmail.includes('notification')
  ) {
    return 'social';
  }

  // Billing
  if (
    lowerEmail.includes('billing') ||
    lowerEmail.includes('invoice') ||
    lowerEmail.includes('receipt') ||
    lowerSubject.includes('payment')
  ) {
    return 'billing';
  }

  // Security
  if (
    lowerSubject.includes('security') ||
    lowerSubject.includes('alert') ||
    lowerSubject.includes('verify') ||
    lowerSubject.includes('suspicious')
  ) {
    return 'security';
  }

  // Transactional
  if (
    lowerEmail.includes('no-reply') ||
    lowerEmail.includes('noreply') ||
    lowerSubject.includes('confirmation') ||
    lowerSubject.includes('order')
  ) {
    return 'transactional';
  }

  // Default to work
  return 'work';
}

export default router;
