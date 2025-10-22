# Gmail Management Tool

🚀 An **AI-powered** Gmail inbox manager with OAuth 2.0 authentication, bulk deletion, and **open-source ML models** for intelligent analysis.

![Gmail Manager](https://img.shields.io/badge/Gmail-API-red)
![React](https://img.shields.io/badge/React-18-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![Python](https://img.shields.io/badge/Python-AI-yellow)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## ✨ Features

- 🔐 **Secure OAuth 2.0 Authentication** - Google sign-in with minimal permissions
- 📊 **Smart Email Grouping** - Automatically groups emails by sender
- 🤖 **AI-Powered Analysis** - **Open-source models** for email categorization and sentiment analysis
- 🧠 **Sender Reputation Scoring** - Identifies spam and low-value senders using ML
- 🔍 **Pattern Detection** - Detects phishing, spam patterns, and time-based trends
- 🗑️ **Bulk Delete** - Delete all emails from specific senders with one click
- 🔍 **Search & Filter** - Find senders quickly with search and category filters
- 📈 **Inbox Analytics** - Get AI-powered insights about your email patterns
- 💻 **Modern UI** - Beautiful, responsive interface built with React and Tailwind CSS

## 🏗️ Architecture

```
gmail_management_tool/
├── frontend/          # React + TypeScript + Vite
├── backend/           # Node.js + Express + Gmail API
└── ai-service/        # Python + FastAPI + Transformers 🤖
    ├── models/
    │   ├── email_analyzer.py      # Sentiment & categorization
    │   ├── sender_classifier.py   # Reputation scoring  
    │   └── pattern_detector.py    # Spam & phishing detection
    └── main.py
```

## 🤖 AI Capabilities

### Open-Source Models (No API Keys Required!)

- **DistilBERT** - Sentiment analysis (250MB)
- **BART** - Zero-shot classification (1.6GB)
- **MiniLM** - Sender similarity detection (90MB)

### What the AI Does

1. **Email Content Analysis**
   - Sentiment: Positive/Negative/Neutral
   - Automatic categorization
   - Content understanding

2. **Sender Reputation**
   - Spam likelihood scoring (0-1)
   - Engagement analysis
   - Behavioral patterns
   - Action recommendations

3. **Pattern Detection**
   - Phishing attempt identification
   - Time-based email patterns
   - Volume anomaly detection
   - Similar sender clustering

4. **Smart Recommendations**
   - Personalized cleanup suggestions
   - Priority-ranked actions
   - Storage optimization tips
   - Security alerts

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.8+
- Google Cloud Project with Gmail API
- 4GB+ RAM for AI models

### 1. Clone Repository

```bash
git clone https://github.com/MarlinZH/gmail_management_tool.git
cd gmail_management_tool
```

### 2. Set Up Google Cloud (5-10 minutes)

Follow [SETUP_GUIDE.md](SETUP_GUIDE.md) to:
- Enable Gmail API
- Create OAuth credentials
- Configure consent screen

### 3. Start AI Service (Python)

```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
cp .env.example .env
python main.py
```

**Runs on:** `http://localhost:8000`

### 4. Start Backend (Node.js)

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Google OAuth credentials
npm run dev
```

**Runs on:** `http://localhost:3001`

### 5. Start Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

**Runs on:** `http://localhost:5173`

### 6. Open in Browser

Visit `http://localhost:5173` and sign in with Google!

## 📖 Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed setup instructions
- **[AI_INTEGRATION_GUIDE.md](AI_INTEGRATION_GUIDE.md)** - AI service documentation
- **[backend/README.md](backend/README.md)** - Backend API docs
- **[ai-service/README.md](ai-service/README.md)** - AI service API docs

## 🎯 What Makes This Different

### vs. Other Gmail Tools

- ✅ **Real AI** - Actual machine learning models, not rules
- ✅ **Open Source ML** - No API keys or cloud services required
- ✅ **Complete Solution** - Frontend + Backend + AI in one repo
- ✅ **Modern Stack** - React 18, TypeScript, FastAPI, Transformers
- ✅ **Production Ready** - Full error handling, security, documentation

### vs. inbox-reaper
- ✅ Fully implemented (not in development)
- ✅ AI-powered analysis included
- ✅ Complete UI with real-time updates

### vs. gmail-cleaner
- ✅ Modern web UI (not CLI)
- ✅ OAuth 2.0 (not IMAP)
- ✅ AI analysis included

## 📊 Example AI Analysis

```json
{
  "summary": {
    "total_emails": 500,
    "spam_likelihood": 0.42
  },
  "recommendations": [
    "⚠️ Block 5 high-spam senders",
    "📧 Unsubscribe from 234 promotional emails (47% of inbox)",
    "🗑️ Delete from 12 inactive senders"
  ],
  "sender_insights": [
    {
      "sender": "newsletter@example.com",
      "spam_score": 0.75,
      "recommended_action": "unsubscribe"
    }
  ]
}
```

## 🎨 Technologies

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
- Google APIs Client
- Express Session

### AI Service
- Python 3.8+
- FastAPI
- Hugging Face Transformers
- scikit-learn
- spaCy
- PyTorch

## 🐛 Troubleshooting

### AI Service Issues

```bash
# Check if AI service is running
curl http://localhost:8000/health

# Should return: {"status": "healthy"}
```

### Model Download Issues

Models auto-download on first run (may take 2-5 minutes).

**Manual download:**
```bash
python -c "from transformers import pipeline; pipeline('sentiment-analysis')"
```

### Out of Memory

```bash
# Use smaller batch size
export BATCH_SIZE=16

# Or use lightweight models (see AI docs)
```

See [SETUP_GUIDE.md](SETUP_GUIDE.md#common-issues) for more troubleshooting.

## 🚧 Roadmap

- [x] Gmail API integration with OAuth 2.0
- [x] Open-source AI models for analysis
- [x] Sender reputation scoring
- [x] Pattern and anomaly detection
- [ ] Email preview before deletion
- [ ] Undo deletion functionality
- [ ] Auto-cleanup scheduling
- [ ] Export analysis reports
- [ ] Custom AI model training
- [ ] Browser extension
- [ ] Mobile app

## 📝 License

MIT License - See [LICENSE](LICENSE) file

## 🤝 Contributing

Contributions welcome! Areas that need work:

1. **AI Improvements**
   - Better categorization models
   - Custom training pipelines
   - Performance optimizations

2. **Features**
   - Email preview
   - Scheduled cleanup
   - Advanced filters

3. **Infrastructure**
   - Comprehensive tests
   - CI/CD pipeline
   - Docker optimization

## ⚠️ Disclaimer

This tool permanently deletes emails. Always review selections carefully before deletion.

## 🌟 Star History

If you find this useful, please star the repo! ⭐

---

**Made with ❤️ using React, Node.js, Python, and Open-Source AI Models**

**No API keys required • Runs 100% locally • Your data stays yours**
