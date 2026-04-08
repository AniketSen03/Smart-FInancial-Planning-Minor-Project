#!/usr/bin/env python3
"""
Start the AI Prediction Service
Run: python run.py
"""

import uvicorn
import os
import sys

if __name__ == "__main__":
    # Add current directory to path
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    
    print("=" * 50)
    print("🤖 AI Investment Predictor Service")
    print("=" * 50)
    print("Starting server on http://localhost:8001")
    print("API Docs: http://localhost:8001/docs")
    print("=" * 50)
    
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )