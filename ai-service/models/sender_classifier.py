"""Sender reputation and classification."""

from typing import List, Dict
from collections import defaultdict
import re
from datetime import datetime, timedelta

class SenderClassifier:
    def __init__(self):
        self.loaded = True
        self.spam_indicators = [
            r'no-reply',
            r'noreply', 
            r'donotreply',
            r'\d{5,}',  # Long numbers
            r'[A-Z]{10,}',  # All caps long strings
        ]
        print("✅ Sender Classifier ready")
    
    def is_loaded(self) -> bool:
        return self.loaded
    
    def analyze_senders(self, senders: List, emails: List) -> List[Dict]:
        """Analyze all senders and provide insights."""
        insights = []
        
        for sender_group in senders:
            insight = self.calculate_reputation(sender_group)
            insights.append(insight)
        
        # Sort by spam score (highest first)
        insights.sort(key=lambda x: x.get('spam_score', 0), reverse=True)
        
        return insights[:20]  # Return top 20 for performance
    
    def calculate_reputation(self, sender_group) -> Dict:
        """Calculate reputation score for a sender."""
        sender = sender_group.sender
        count = sender_group.count
        emails = sender_group.emails
        
        # Calculate spam score
        spam_score = self._calculate_spam_score(sender, emails)
        
        # Calculate engagement score (inverse of spam)
        engagement_score = 1.0 - spam_score
        
        # Calculate frequency
        frequency = self._calculate_frequency(emails)
        
        # Calculate recommendation
        action = self._recommend_action(spam_score, count, frequency)
        
        return {
            "sender": sender,
            "email_count": count,
            "spam_score": round(spam_score, 2),
            "engagement_score": round(engagement_score, 2),
            "frequency": frequency,
            "recommended_action": action,
            "days_since_last": self._days_since_last_email(emails),
            "category": sender_group.category
        }
    
    def _calculate_spam_score(self, sender: str, emails: List) -> float:
        """Calculate spam likelihood score (0-1)."""
        score = 0.0
        
        # Check sender patterns
        for pattern in self.spam_indicators:
            if re.search(pattern, sender, re.IGNORECASE):
                score += 0.2
        
        # Check email subjects
        spam_subject_words = ['urgent', '!!!', 'winner', 'congratulations', 'click here', 'act now']
        for email in emails[:10]:  # Sample first 10
            subject_lower = email.subject.lower()
            if any(word in subject_lower for word in spam_subject_words):
                score += 0.1
        
        # High volume = likely automated
        if len(emails) > 50:
            score += 0.2
        elif len(emails) > 100:
            score += 0.3
        
        # Generic domains
        if any(domain in sender.lower() for domain in ['noreply', 'no-reply', 'donotreply']):
            score += 0.3
        
        return min(score, 1.0)
    
    def _calculate_frequency(self, emails: List) -> str:
        """Determine email frequency."""
        count = len(emails)
        
        if count > 100:
            return "very_high"
        elif count > 50:
            return "high"
        elif count > 20:
            return "medium"
        elif count > 5:
            return "low"
        else:
            return "very_low"
    
    def _recommend_action(self, spam_score: float, count: int, frequency: str) -> str:
        """Recommend action for this sender."""
        if spam_score > 0.7:
            return "block"
        elif spam_score > 0.5 and count > 20:
            return "unsubscribe"
        elif frequency in ["very_high", "high"] and spam_score > 0.3:
            return "review"
        elif count > 100:
            return "archive_old"
        else:
            return "keep"
    
    def _days_since_last_email(self, emails: List) -> int:
        """Calculate days since last email."""
        if not emails:
            return 999
        
        try:
            # Parse most recent email date
            latest = emails[0]
            # Simplified - in reality you'd parse the date string
            return 30  # Placeholder
        except:
            return 999
