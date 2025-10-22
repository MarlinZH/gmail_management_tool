#!/usr/bin/env python3
"""Test script for AI service."""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health check endpoint."""
    print("\n🔍 Testing health check...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 200

def test_root():
    """Test root endpoint."""
    print("\n🔍 Testing root endpoint...")
    response = requests.get(f"{BASE_URL}/")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200

def test_categorize():
    """Test single email categorization."""
    print("\n🔍 Testing email categorization...")
    
    email = {
        "id": "test_123",
        "sender": "newsletter@shopping.com",
        "subject": "Flash Sale - 50% Off Everything!",
        "date": "2025-01-15",
        "snippet": "Don't miss our amazing sale ending tonight!"
    }
    
    response = requests.post(
        f"{BASE_URL}/categorize",
        json=email
    )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200

def test_analyze():
    """Test full inbox analysis."""
    print("\n🔍 Testing full inbox analysis...")
    
    data = {
        "emails": [
            {
                "id": "1",
                "sender": "newsletter@shopping.com",
                "subject": "Flash Sale - 50% Off!",
                "date": "2025-01-15",
                "snippet": "Amazing deals"
            },
            {
                "id": "2",
                "sender": "notifications@facebook.com",
                "subject": "You have 5 notifications",
                "date": "2025-01-14",
                "snippet": "Check your notifications"
            },
            {
                "id": "3",
                "sender": "team@work.com",
                "subject": "Q4 Report Ready",
                "date": "2025-01-14",
                "snippet": "Please review"
            }
        ],
        "senders": [
            {
                "sender": "newsletter@shopping.com",
                "count": 45,
                "emails": [
                    {
                        "id": "1",
                        "subject": "Flash Sale",
                        "date": "2025-01-15"
                    }
                ],
                "category": "promotional"
            },
            {
                "sender": "notifications@facebook.com",
                "count": 120,
                "emails": [
                    {
                        "id": "2",
                        "subject": "Notifications",
                        "date": "2025-01-14"
                    }
                ],
                "category": "social"
            }
        ]
    }
    
    response = requests.post(
        f"{BASE_URL}/analyze",
        json=data
    )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    
    result = response.json()
    assert "summary" in result
    assert "recommendations" in result
    assert "sender_insights" in result
    assert "patterns" in result

if __name__ == "__main__":
    print("🧪 Starting AI Service Tests")
    print(f"📡 Testing against: {BASE_URL}")
    print("\nMake sure the service is running: python main.py")
    
    try:
        test_health()
        test_root()
        test_categorize()
        test_analyze()
        
        print("\n✅ All tests passed!")
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        raise
