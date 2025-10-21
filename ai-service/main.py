from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import uvicorn
import os
from dotenv import load_dotenv

from models.email_analyzer import EmailAnalyzer
from models.sender_classifier import SenderClassifier
from models.pattern_detector import PatternDetector

load_dotenv()

app = FastAPI(
    title="Gmail AI Analysis Service",
    description="Open-source AI service for email analysis and categorization",
    version="1.0.0"
)

# CORS configuration
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3001").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI models
email_analyzer = EmailAnalyzer()
sender_classifier = SenderClassifier()
pattern_detector = PatternDetector()

# Request/Response Models
class Email(BaseModel):
    id: str
    sender: str
    subject: str
    date: str
    snippet: Optional[str] = ""

class SenderGroup(BaseModel):
    sender: str
    count: int
    emails: List[Email]
    category: Optional[str] = "unknown"

class AnalysisRequest(BaseModel):
    emails: List[Email]
    senders: Optional[List[SenderGroup]] = []

class AnalysisResponse(BaseModel):
    summary: Dict[str, any]
    recommendations: List[str]
    sender_insights: List[Dict[str, any]]
    patterns: Dict[str, any]

@app.get("/")
async def root():
    return {
        "service": "Gmail AI Analysis Service",
        "status": "running",
        "models_loaded": {
            "email_analyzer": email_analyzer.is_loaded(),
            "sender_classifier": sender_classifier.is_loaded(),
            "pattern_detector": pattern_detector.is_loaded()
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_emails(request: AnalysisRequest):
    """
    Comprehensive AI analysis of email inbox.
    
    Returns:
    - Summary statistics
    - AI-powered recommendations
    - Sender insights and reputation scores
    - Pattern detection (spam, phishing, time-based patterns)
    """
    try:
        emails = request.emails
        senders = request.senders
        
        if not emails:
            raise HTTPException(status_code=400, detail="No emails provided")
        
        # 1. Analyze email content
        email_analysis = email_analyzer.analyze_batch(emails)
        
        # 2. Classify and score senders
        sender_insights = sender_classifier.analyze_senders(senders, emails)
        
        # 3. Detect patterns
        patterns = pattern_detector.detect_patterns(emails, senders)
        
        # 4. Generate summary
        summary = {
            "total_emails": len(emails),
            "unique_senders": len(senders) if senders else len(set(e.sender for e in emails)),
            "category_breakdown": email_analysis.get("category_counts", {}),
            "sentiment_distribution": email_analysis.get("sentiment_distribution", {}),
            "spam_likelihood": patterns.get("spam_score", 0),
            "storage_used_estimate": f"{len(emails) * 0.05:.1f} MB"
        }
        
        # 5. Generate AI recommendations
        recommendations = _generate_recommendations(
            summary, sender_insights, patterns
        )
        
        return AnalysisResponse(
            summary=summary,
            recommendations=recommendations,
            sender_insights=sender_insights,
            patterns=patterns
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/categorize")
async def categorize_email(email: Email):
    """
    Categorize a single email using AI.
    """
    try:
        category = email_analyzer.categorize_single(email)
        sentiment = email_analyzer.analyze_sentiment(email.subject + " " + email.snippet)
        
        return {
            "category": category,
            "sentiment": sentiment,
            "confidence": 0.85  # Would be from model
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Categorization failed: {str(e)}")

@app.post("/sender-reputation")
async def get_sender_reputation(sender_group: SenderGroup):
    """
    Analyze sender reputation and behavior.
    """
    try:
        reputation = sender_classifier.calculate_reputation(sender_group)
        return reputation
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reputation analysis failed: {str(e)}")

def _generate_recommendations(
    summary: Dict, 
    sender_insights: List[Dict], 
    patterns: Dict
) -> List[str]:
    """
    Generate actionable recommendations based on analysis.
    """
    recommendations = []
    
    # Check for high spam senders
    spam_senders = [s for s in sender_insights if s.get("spam_score", 0) > 0.7]
    if spam_senders:
        recommendations.append(
            f"⚠️ Block {len(spam_senders)} high-spam senders to reduce clutter"
        )
    
    # Check for promotional overload
    promo_count = summary.get("category_breakdown", {}).get("promotional", 0)
    if promo_count > summary["total_emails"] * 0.3:
        recommendations.append(
            f"📧 Unsubscribe from promotional emails ({promo_count} found, {promo_count/summary['total_emails']*100:.0f}% of inbox)"
        )
    
    # Check for inactive senders
    old_senders = [s for s in sender_insights if s.get("days_since_last", 0) > 90]
    if old_senders:
        recommendations.append(
            f"🗑️ Consider deleting emails from {len(old_senders)} inactive senders (>90 days)"
        )
    
    # Check for similar senders (duplicates)
    if patterns.get("similar_sender_groups"):
        recommendations.append(
            "🔄 Merge or unsubscribe from similar newsletter senders"
        )
    
    # Storage recommendations
    if summary.get("total_emails", 0) > 1000:
        recommendations.append(
            f"💾 Archive old emails to free up space (~{summary.get('storage_used_estimate', 'unknown')} used)"
        )
    
    # Pattern-based recommendations
    if patterns.get("time_patterns", {}).get("night_emails", 0) > 50:
        recommendations.append(
            "🌙 Set up filters for night-time emails (likely automated notifications)"
        )
    
    return recommendations

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    print("🤖 Starting AI Service...")
    print(f"📍 Server will run on http://{host}:{port}")
    print("📚 Loading AI models...")
    
    uvicorn.run(app, host=host, port=port)
