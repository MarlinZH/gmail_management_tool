# Gmail Management Tool

🚀 An AI-powered Gmail inbox manager with OAuth 2.0 authentication, bulk deletion, and smart email categorization.

![Gmail Manager](https://img.shields.io/badge/Gmail-API-red)
![React](https://img.shields.io/badge/React-18-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## ✨ Features

- 🔐 **Secure OAuth 2.0 Authentication** - Google sign-in with minimal permissions
- 📊 **Smart Email Grouping** - Automatically groups emails by sender
- 🤖 **AI-Powered Analysis** - Categorizes emails (promotional, social, billing, etc.)
- 🗑️ **Bulk Delete** - Delete all emails from specific senders with one click
- 🔍 **Search & Filter** - Find senders quickly with search and category filters
- 📈 **Inbox Analytics** - Get insights about your email patterns
- 💻 **Modern UI** - Beautiful, responsive interface built with React and Tailwind CSS

## 🏗️ Architecture

```
gmail_management_tool/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── App.tsx   # Main application component
│   │   ├── main.tsx  # Entry point
│   │   └── index.css # Tailwind styles
│   └── package.json
├── backend/           # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── index.ts      # Server entry point
│   │   ├── routes/
│   │   │   ├── auth.ts   # OAuth authentication
│   │   │   └── gmail.ts  # Gmail API operations
│   │   └── types/
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Google Cloud Project with Gmail API enabled
- OAuth 2.0 credentials from Google Cloud Console

### 1. Clone the Repository

```bash
git clone https://github.com/MarlinZH/gmail_management_tool.git
cd gmail_management_tool
```

### 2. Set Up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click "Enable"

4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URI: `http://localhost:3001/auth/google/callback`
   - Download the credentials

📖 **Need detailed setup instructions?** See [SETUP_GUIDE.md](SETUP_GUIDE.md)

### 3. Backend Setup

```bash
cd backend
npm install

# Create environment file
cp .env.example .env
```

Edit `backend/.env` with your credentials:

```env
PORT=3001
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
SESSION_SECRET=generate_a_random_secret_here
```

**Start the backend:**

```bash
npm run dev
```

### 4. Frontend Setup

```bash
cd frontend
npm install

# Start the development server
npm run dev
```

### 5. Access the Application

Open your browser and navigate to: `http://localhost:5173`

## 📖 Usage Guide

### Authentication

1. Click "Sign in with Google" on the login screen
2. Authorize the application to access your Gmail
3. You'll be redirected back to the app

### Managing Your Inbox

1. **View Senders**: All emails are automatically grouped by sender
2. **Search**: Use the search bar to find specific senders
3. **Filter**: Filter by category (promotional, social, work, etc.)
4. **Select**: Click checkboxes to select senders
5. **Delete**: Click "Delete Selected" to remove all emails from selected senders
6. **Analyze**: Click "Analyze Inbox" for AI-powered insights

## 🔐 Security & Privacy

- ✅ OAuth 2.0 authentication - no password storage
- ✅ Minimal Gmail API scopes (readonly + modify)
- ✅ Session-based authentication
- ✅ No permanent data storage
- ✅ All operations happen in real-time

## 🎨 Technologies Used

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React

### Backend
- Node.js
- Express.js
- TypeScript
- Google APIs Client Library
- Express Session

## 🐛 Troubleshooting

See [SETUP_GUIDE.md](SETUP_GUIDE.md#common-issues) for detailed troubleshooting steps.

## 🚧 Roadmap

- [ ] Real AI analysis using Claude API
- [ ] Email preview before deletion
- [ ] Undo deletion functionality
- [ ] Export email lists
- [ ] Scheduled cleanup
- [ ] Custom filters and rules

## 📝 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ⚠️ Disclaimer

This tool permanently deletes emails. Always review your selections carefully before clicking delete.

---

**Made with ❤️ using React, Node.js, and the Gmail API**
