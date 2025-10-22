# AI Service for Gmail Management Tool

🤖 Open-source AI service for intelligent email analysis using Python, Hugging Face Transformers, and FastAPI.

## Features

- 🧠 **Email Content Analysis** - Sentiment analysis and categorization
- 📊 **Sender Reputation Scoring** - Identify spam and low-value senders
- 🔍 **Pattern Detection** - Detect phishing, spam, and time patterns
- 🎯 **Smart Recommendations** - AI-powered cleanup suggestions
- ⚡ **Fast API** - RESTful API with async support
- 📦 **Lightweight Models** - Runs on CPU, no GPU required

## Models Used

### 1. Sentiment Analysis
- **Model**: `distilbert-base-uncased-finetuned-sst-2-english`
- **Purpose**: Analyze email sentiment (positive/negative/neutral)
- **Size**: ~250MB

### 2. Zero-Shot Classification
- **Model**: `facebook/bart-large-mnli`
- **Purpose**: Categorize emails without training
- **Size**: ~1.6GB

### 3. Sentence Embeddings (Optional)
- **Model**: `sentence-transformers/all-MiniLM-L6-v2`
- **Purpose**: Find similar senders and cluster emails
- **Size**: ~90MB

## Installation

### Prerequisites

- Python 3.8+
- pip
- 4GB+ RAM recommended
- 3GB disk space for models

### Setup

```bash
cd ai-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Mac/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Copy environment file
cp .env.example .env
```

### Configuration

Edit `.env` file:

```env
PORT=8000
HOST=0.0.0.0
MODEL_NAME=distilbert-base-uncased-finetuned-sst-2-english
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:5173
```

## Running the Service

### Development Mode

```bash
python main.py
```

The service will start on `http://localhost:8000`

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Endpoints

### Health Check

```bash
GET /health
```

Returns:
```json
{
  "status": "healthy"
}
```

### Root Status

```bash
GET /
```

Returns:
```json
{
  "service": "Gmail AI Analysis Service",
  "status": "running",
  "models_loaded": {
    "email_analyzer": true,
    "sender_classifier": true,
    "pattern_detector": true
  }
}
```

### Analyze Emails

```bash
POST /analyze
Content-Type: application/json
```

Request Body:
```json
{
  "emails": [
    {
      "id": "msg_123",
      "sender": "newsletter@company.com",
      "subject": "Special Offer - 50% Off!",
      "date": "2025-01-15",
      "snippet": "Don't miss this amazing deal..."
    }
  ],
  "senders": [
    {
      "sender": "newsletter@company.com",
      "count": 45,
      "emails": [...],
      "category": "promotional"
    }
  ]
}
```

Response:
```json
{
  "summary": {
    "total_emails": 150,
    "unique_senders": 45,
    "category_breakdown": {
      "promotional": 65,
      "social": 30,
      "work": 40,
      "transactional": 15
    },
    "sentiment_distribution": {
      "positive": 20,
      "negative": 10,
      "neutral": 120
    },
    "spam_likelihood": 0.45
  },
  "recommendations": [
    "⚠️ Block 3 high-spam senders to reduce clutter",
    "📧 Unsubscribe from promotional emails (65 found, 43% of inbox)",
    "🗑️ Consider deleting emails from 8 inactive senders (>90 days)"
  ],
  "sender_insights": [
    {
      "sender": "newsletter@company.com",
      "email_count": 45,
      "spam_score": 0.6,
      "engagement_score": 0.4,
      "recommended_action": "unsubscribe"
    }
  ],
  "patterns": {
    "spam_score": 0.45,
    "phishing_alerts": [],
    "time_patterns": {
      "night_emails": 45,
      "weekend_emails": 120
    },
    "volume_anomalies": []
  }
}
```

### Categorize Single Email

```bash
POST /categorize
Content-Type: application/json
```

Request:
```json
{
  "id": "msg_123",
  "sender": "team@company.com",
  "subject": "Q4 Report Ready",
  "date": "2025-01-15",
  "snippet": "The quarterly report is ready for review..."
}
```

Response:
```json
{
  "category": "work",
  "sentiment": "neutral",
  "confidence": 0.85
}
```

### Get Sender Reputation

```bash
POST /sender-reputation
Content-Type: application/json
```

Request:
```json
{
  "sender": "newsletter@company.com",
  "count": 45,
  "emails": [...],
  "category": "promotional"
}
```

Response:
```json
{
  "sender": "newsletter@company.com",
  "email_count": 45,
  "spam_score": 0.6,
  "engagement_score": 0.4,
  "frequency": "high",
  "recommended_action": "unsubscribe"
}
```

## Integration with Backend

Update your Node.js backend to call the AI service:

```javascript
// backend/src/routes/gmail.ts

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

router.post('/analyze-with-ai', requireAuth, async (req, res) => {
  try {
    const { emails, senders } = req.body;
    
    // Call AI service
    const response = await fetch(`${AI_SERVICE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails, senders })
    });
    
    const analysis = await response.json();
    res.json(analysis);
  } catch (error) {
    console.error('AI analysis failed:', error);
    res.status(500).json({ error: 'AI analysis failed' });
  }
});
```

## Performance

### CPU Mode (Default)
- First request: 2-5 seconds (model loading)
- Subsequent requests: 0.5-2 seconds per 100 emails
- Memory usage: ~1.5GB

### GPU Mode (Optional)
- 5-10x faster processing
- Requires CUDA-capable GPU
- Install: `pip install torch --index-url https://download.pytorch.org/whl/cu118`

## Optimization Tips

### 1. Use Smaller Models (Faster, Less Accurate)

Edit `main.py`:
```python
self.sentiment_analyzer = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased",  # Smaller model
    device=-1  # Force CPU
)
```

### 2. Batch Processing

Process emails in batches of 50-100 for optimal performance.

### 3. Caching

Implement Redis caching for repeated analyses:
```python
import redis
r = redis.Redis(host='localhost', port=6379)
```

### 4. Model Quantization

Reduce model size by 4x:
```python
from optimum.onnxruntime import ORTModelForSequenceClassification
```

## Alternative Models

### Lightweight Alternative (Faster)

```python
# Use lightweight model for production
self.sentiment_analyzer = pipeline(
    "sentiment-analysis",
    model="nlptown/bert-base-multilingual-uncased-sentiment"
)
```

### More Accurate Alternative (Slower)

```python
# Use larger model for better accuracy
self.classifier = pipeline(
    "zero-shot-classification",
    model="MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli"
)
```

## Troubleshooting

### Issue: Models not downloading

```bash
# Manually download models
from transformers import pipeline
pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
```

### Issue: Out of memory

```bash
# Reduce batch size in .env
BATCH_SIZE=16

# Or use smaller models
```

### Issue: Slow processing

```bash
# Enable GPU if available
export CUDA_VISIBLE_DEVICES=0

# Or use quantized models
```

## Deployment

### Docker

Create `Dockerfile`:
```dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t gmail-ai-service .
docker run -p 8000:8000 gmail-ai-service
```

### Cloud Deployment

**Heroku:**
```bash
heroku create gmail-ai-service
git push heroku main
```

**AWS Lambda (with container):**
- Use AWS Lambda with container support
- Max 10GB container size
- Cold start: 5-10 seconds

**Google Cloud Run:**
- Good for ML workloads
- Auto-scaling
- Pay per request

## Testing

### Manual Test

```bash
curl -X POST http://localhost:8000/categorize \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test",
    "sender": "test@example.com",
    "subject": "Test Email",
    "date": "2025-01-15",
    "snippet": "This is a test"
  }'
```

### Load Test

```bash
pip install locust
locust -f load_test.py
```

## License

MIT License - Models are subject to their respective licenses

## Credits

- Hugging Face Transformers
- FastAPI
- spaCy
- scikit-learn
