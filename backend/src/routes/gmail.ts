import express, { Request, Response } from 'express';
import { google } from 'googleapis';
import { oauth2Client } from './auth';

const router = express.Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

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

    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      maxResults: maxResults,
      q: req.query.q as string || ''
    });

    const messages = listResponse.data.messages || [];

    if (messages.length === 0) {
      return res.json({ emails: [], count: 0 });
    }

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

      const emailMatch = from.match(/<(.+?)>/) || from.match(/([^\s]+@[^\s]+)/);
      const senderEmail = emailMatch ? emailMatch[1] : from;

      return {
        id: message.id,
        sender: senderEmail,
        senderFull: from,
        subject: subject,
        date: date,
        snippet: msg.data.snippet || '',
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

    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      maxResults: maxResults
    });

    const messages = listResponse.data.messages || [];

    if (messages.length === 0) {
      return res.json({ senders: [], count: 0 });
    }

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
 * POST /api/gmail/analyze-ai
 * Analyze inbox using AI service
 */
router.post('/analyze-ai', requireAuth, async (req: Request, res: Response) => {
  try {
    const { emails, senders } = req.body;

    if (!emails || emails.length === 0) {
      return res.status(400).json({ error: 'No emails provided for analysis' });
    }

    const response = await fetch(`${AI_SERVICE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emails, senders })
    });

    if (!response.ok) {
      throw new Error(`AI service returned ${response.status}`);
    }

    const analysis = await response.json();
    
    res.json(analysis);
  } catch (error: any) {
    console.error('AI analysis failed:', error);
    
    res.json({
      summary: {
        total_emails: req.body.emails?.length || 0,
        unique_senders: req.body.senders?.length || 0,
        category_breakdown: {},
        ai_service_status: 'unavailable'
      },
      recommendations: [
        '⚠️ AI service is currently unavailable',
        'Using basic analysis instead',
        'Start the AI service with: cd ai-service && python main.py'
      ],
      sender_insights: [],
      patterns: {}
    });
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

    for (const sender of senders) {
      const searchQuery = `from:${sender}`;
      const listResponse = await gmail.users.messages.list({
        userId: 'me',
        q: searchQuery,
        maxResults: 500
      });

      const messages = listResponse.data.messages || [];

      if (messages.length > 0) {
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

function categorizeSender(email: string, subject: string): string {
  const lowerEmail = email.toLowerCase();
  const lowerSubject = subject.toLowerCase();

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

  if (
    lowerEmail.includes('facebook') ||
    lowerEmail.includes('twitter') ||
    lowerEmail.includes('linkedin') ||
    lowerEmail.includes('instagram') ||
    lowerEmail.includes('notification')
  ) {
    return 'social';
  }

  if (
    lowerEmail.includes('billing') ||
    lowerEmail.includes('invoice') ||
    lowerEmail.includes('receipt') ||
    lowerSubject.includes('payment')
  ) {
    return 'billing';
  }

  if (
    lowerSubject.includes('security') ||
    lowerSubject.includes('alert') ||
    lowerSubject.includes('verify') ||
    lowerSubject.includes('suspicious')
  ) {
    return 'security';
  }

  if (
    lowerEmail.includes('no-reply') ||
    lowerEmail.includes('noreply') ||
    lowerSubject.includes('confirmation') ||
    lowerSubject.includes('order')
  ) {
    return 'transactional';
  }

  return 'work';
}

export default router;
