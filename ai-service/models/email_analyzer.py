"""Email content analysis using transformers and NLP."""

from transformers import pipeline
from typing import List, Dict
import re
from collections import Counter

class EmailAnalyzer:
    def __init__(self):
        self.loaded = False
        self._load_models()
    
    def _load_models(self):
        """Load pre-trained models for analysis."""
        try:
            # Sentiment analysis model
            self.sentiment_analyzer = pipeline(
                "sentiment-analysis",
                model="distilbert-base-uncased-finetuned-sst-2-english"
            )
            
            # Zero-shot classification for categories
            self.classifier = pipeline(
                "zero-shot-classification",
                model="facebook/bart-large-mnli"
            )
            
            self.loaded = True
            print("✅ Email Analyzer models loaded")
        except Exception as e:
            print(f"⚠️ Email Analyzer failed to load: {e}")
            print("   Falling back to rule-based analysis")
            self.sentiment_analyzer = None
            self.classifier = None
    
    def is_loaded(self) -> bool:
        return self.loaded
    
    def analyze_batch(self, emails: List) -> Dict:
        """Analyze a batch of emails."""
        categories = []
        sentiments = []
        
        for email in emails:
            # Categorize
            category = self.categorize_single(email)
            categories.append(category)
            
            # Sentiment (on subject line)
            if email.subject:
                sentiment = self.analyze_sentiment(email.subject)
                sentiments.append(sentiment)
        
        return {
            "category_counts": dict(Counter(categories)),
            "sentiment_distribution": dict(Counter(sentiments)),
            "total_analyzed": len(emails)
        }
    
    def categorize_single(self, email) -> str:
        """Categorize a single email."""
        # Rule-based fallback
        text = f"{email.sender} {email.subject}".lower()
        
        # Promotional
        if any(word in text for word in ['sale', 'offer', 'discount', 'deal', 'promo', 'newsletter']):
            return "promotional"
        
        # Social
        if any(domain in email.sender.lower() for domain in ['facebook', 'twitter', 'linkedin', 'instagram']):
            return "social"
        
        # Transactional
        if any(word in text for word in ['receipt', 'order', 'shipping', 'delivery', 'confirmation']):
            return "transactional"
        
        # Security
        if any(word in text for word in ['security', 'verify', 'alert', 'password', 'suspicious']):
            return "security"
        
        # Billing
        if any(word in text for word in ['invoice', 'payment', 'billing', 'subscription']):
            return "billing"
        
        # If AI model is available, use it
        if self.classifier:
            try:
                result = self.classifier(
                    email.subject,
                    candidate_labels=["promotional", "social", "work", "transactional", "billing", "security"],
                    multi_label=False
                )
                return result['labels'][0]
            except:
                pass
        
        return "work"
    
    def analyze_sentiment(self, text: str) -> str:
        """Analyze sentiment of text."""
        if not text:
            return "neutral"
        
        if self.sentiment_analyzer:
            try:
                result = self.sentiment_analyzer(text[:512])[0]  # Limit text length
                return result['label'].lower()
            except:
                pass
        
        # Simple rule-based fallback
        positive_words = ['great', 'excellent', 'amazing', 'love', 'best', 'thank']
        negative_words = ['bad', 'terrible', 'worst', 'hate', 'spam', 'urgent']
        
        text_lower = text.lower()
        pos_count = sum(1 for word in positive_words if word in text_lower)
        neg_count = sum(1 for word in negative_words if word in text_lower)
        
        if pos_count > neg_count:
            return "positive"
        elif neg_count > pos_count:
            return "negative"
        return "neutral"
