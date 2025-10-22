# AI Service Integration - Complete Guide

## 🎉 What's New

Your Gmail Management Tool now includes a **Python-based AI service** using open-source models for intelligent email analysis!

## 🏗️ Complete Architecture

```
gmail_management_tool/
├── frontend/          # React UI
├── backend/           # Node.js API (Gmail + Auth)
└── ai-service/        # NEW - Python AI service
    ├── main.py        # FastAPI server
    ├── models/        # AI models
    │   ├── email_analyzer.py      # Content analysis
    │   ├── sender_classifier.py   # Reputation scoring
    │   └── pattern_detector.py    # Pattern detection
    └── requirements.txt
```

## 🚀 Quick Start (3 Services)

You'll need **THREE terminal windows**:

### Terminal 1: AI Service (Python)
```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python main.py
```
**Runs on:** `http://localhost:8000`

### Terminal 2: Backend (Node.js)
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```
**Runs on:** `http://localhost:3001`

### Terminal 3: Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
**Runs on:** `http://localhost:5173`

## 🤖 AI Features

### 1. Email Content Analysis
- **Sentiment Analysis**: Positive/Negative/Neutral
- **Zero-Shot Categorization**: Automatic category detection
- **Content Understanding**: Extracts key information

**Model**: DistilBERT (250MB, runs on CPU)

### 2. Sender Reputation Scoring
- **Spam Detection**: 0-1 score based on patterns
- **Engagement Scoring**: How valuable is this sender
- **Behavior Analysis**: Frequency, patterns, domain reputation
- **Action Recommendations**: Keep, unsubscribe, block, review

### 3. Pattern Detection
- **Phishing Detection**: Identifies suspicious patterns
- **Time-based Patterns**: When do you get most emails
- **Volume Anomalies**: Unusually high-volume senders
- **Similar Sender Groups**: Finds related senders
- **Unsubscribe Opportunities**: Best candidates for cleanup

### 4. Smart Recommendations
- Personalized cleanup suggestions
- Priority-ranked action items
- Storage optimization tips
- Security alerts

## 📊 Example AI Analysis

**Request to `/api/gmail/analyze-ai`:**
```json
{
  "emails": [/* your emails */],
  "senders": [/* grouped senders */]
}
```

**Response:**
```json
{
  "summary": {
    "total_emails": 500,
    "unique_senders": 87,
    "category_breakdown": {
      "promotional": 234,
      "social": 98,
      "work": 120,
      "transactional": 48
    },
    "sentiment_distribution": {
      "positive": 45,
      "negative": 23,
      "neutral": 432
    },
    "spam_likelihood": 0.42
  },
  "recommendations": [
    "⚠️ Block 5 high-spam senders to reduce clutter",
    "📧 Unsubscribe from promotional emails (234 found, 47% of inbox)",
    "🗑️ Consider deleting emails from 12 inactive senders (>90 days)",
    "💾 Archive old emails to free up space (~25MB used)"
  ],
  "sender_insights": [
    {
      "sender": "newsletter@example.com",
      "email_count": 67,
      "spam_score": 0.75,
      "engagement_score": 0.25,
      "recommended_action": "unsubscribe",
      "frequency": "very_high"
    }
  ],
  "patterns": {
    "spam_score": 0.42,
    "phishing_alerts": [],
    "time_patterns": {
      "night_emails": 89,
      "weekend_emails": 156
    },
    "volume_anomalies": [
      {
        "sender": "notifications@social.com",
        "email_count": 245,
        "times_above_average": 5.2
      }
    ]
  }
}
```

## 🔧 Configuration

### AI Service (.env)
```env
PORT=8000
HOST=0.0.0.0
MODEL_NAME=distilbert-base-uncased-finetuned-sst-2-english
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
BATCH_SIZE=32
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:5173
```

### Backend (.env)
```env
# ... existing vars ...
AI_SERVICE_URL=http://localhost:8000
```

## 💻 Using the AI Features

### In the Frontend

The "Analyze Inbox" button now calls the real AI service:

```typescript
const analyzeWithAI = async () => {
  setLoading(true);
  try {
    const response = await fetch(`${API_BASE}/api/gmail/analyze-ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ emails, senders: senderGroups })
    });
    
    const analysis = await response.json();
    // Display recommendations, insights, patterns
  } catch (error) {
    // Fallback to basic analysis
  }
};
```

## 🎯 Models Used

### Primary Models (Auto-downloaded on first run)

1. **DistilBERT for Sentiment**
   - Size: ~250MB
   - Speed: Fast (CPU)
   - Accuracy: Good

2. **BART for Classification**
   - Size: ~1.6GB
   - Speed: Medium (CPU)
   - Accuracy: Excellent

3. **MiniLM for Embeddings** (Optional)
   - Size: ~90MB
   - Speed: Very fast
   - Use: Finding similar senders

### Alternative Lightweight Models

For faster processing, edit `ai-service/models/email_analyzer.py`:

```python
# Use tiny model (50MB, much faster)
self.sentiment_analyzer = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased"
)
```

## 🐛 Troubleshooting

### Issue: AI service not connecting

```bash
# Check if AI service is running
curl http://localhost:8000/health

# Should return: {"status": "healthy"}
```

**Solution:**
- Make sure AI service is running on port 8000
- Check `AI_SERVICE_URL` in backend `.env`
- Check firewall isn't blocking port 8000

### Issue: Models not downloading

```bash
# Manually download models
python -c "from transformers import pipeline; pipeline('sentiment-analysis')"
```

### Issue: Out of memory

**Solution:**
```bash
# Use smaller batch size
export BATCH_SIZE=16

# Or use lighter models (see alternatives above)
```

### Issue: Slow first request

**Expected behavior**: First request takes 5-10 seconds (loading models)
Subsequent requests: 0.5-2 seconds

**To pre-load models:**
```bash
curl -X POST http://localhost:8000/categorize \
  -H "Content-Type: application/json" \
  -d '{"id":"test","sender":"test@test.com","subject":"test","date":"2025-01-01","snippet":""}'
```

## 🚀 Performance

### CPU Mode (Default)
- First request: 2-5 seconds
- Subsequent: 0.5-2 seconds per 100 emails
- Memory: ~1.5GB
- Works on any machine

### GPU Mode (Optional)
- 5-10x faster
- Requires CUDA GPU
- Install: `pip install torch --index-url https://download.pytorch.org/whl/cu118`

## 📈 Optimization Tips

### 1. Reduce Model Size
Use quantized models (4x smaller, 2x faster):
```python
from optimum.onnxruntime import ORTModelForSequenceClassification
```

### 2. Batch Processing
Process emails in batches of 50-100

### 3. Caching
Cache analysis results for repeated queries

### 4. Async Processing
The AI service uses FastAPI's async capabilities

## 🧪 Testing the AI Service

```bash
cd ai-service
python test_service.py
```

Expected output:
```
🧪 Starting AI Service Tests
🔍 Testing health check...
Status: 200
✅ All tests passed!
```

## 🌐 Deployment

### Docker (Recommended)

**ai-service/Dockerfile:**
```dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN python -m spacy download en_core_web_sm

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Build and run:**
```bash
docker build -t gmail-ai-service ./ai-service
docker run -p 8000:8000 gmail-ai-service
```

### Docker Compose (All Services)

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  ai-service:
    build: ./ai-service
    ports:
      - "8000:8000"
    environment:
      - PORT=8000
      
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - AI_SERVICE_URL=http://ai-service:8000
    depends_on:
      - ai-service
      
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend
```

Run all services:
```bash
docker-compose up
```

## 📚 API Documentation

Visit `http://localhost:8000/docs` when AI service is running for interactive API documentation (Swagger UI).

## 🔒 Security Notes

- All models run locally
- No data sent to external services
- Models are open-source and auditable
- Analysis happens in real-time, no storage

## 📝 Next Steps

1. **Test the Integration**
   - Start all three services
   - Click "Analyze Inbox"
   - Review AI recommendations

2. **Customize Models**
   - Try different models for your use case
   - Adjust batch sizes for performance
   - Fine-tune categorization rules

3. **Add Features**
   - Email preview
   - Auto-cleanup scheduling
   - Custom training data
   - Export analysis reports

## 🤝 Contributing

Want to improve the AI?
- Add new models
- Improve categorization accuracy
- Optimize performance
- Add new analysis features

See the models in `ai-service/models/` to get started!

---

**You now have a complete AI-powered Gmail management system! 🎉**
