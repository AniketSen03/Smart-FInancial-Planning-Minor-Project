from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Import custom models
from models.stock_predictor import StockPredictor
from models.risk_analyzer import RiskAnalyzer
from models.fund_recommender import FundRecommender

app = FastAPI(title="AI Investment Predictor", version="1.0.0")

# CORS for Node.js backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize models
stock_predictor = StockPredictor()
risk_analyzer = RiskAnalyzer()
fund_recommender = FundRecommender()

# Request/Response Models
class StockPredictionRequest(BaseModel):
    symbol: str
    days: int = 30

class StockPredictionResponse(BaseModel):
    symbol: str
    current_price: float
    predicted_price: float
    confidence: float
    recommendation: str
    risk_level: str

class RiskAnalysisRequest(BaseModel):
    symbol: str
    user_risk_appetite: str  # Low, Medium, High

class RiskAnalysisResponse(BaseModel):
    symbol: str
    stock_name: str
    risk_score: float
    risk_level: str
    volatility: float
    sharpe_ratio: float
    max_drawdown: float
    recommendation: str

class InvestmentSuggestionsRequest(BaseModel):
    risk_appetite: str
    amount: float = 100000
    horizon: int = 12  # months

# API Endpoints

@app.get("/")
async def root():
    return {"message": "AI Investment Predictor API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/predict/stock", response_model=StockPredictionResponse)
async def predict_stock(request: StockPredictionRequest):
    """Predict stock price using LSTM model"""
    try:
        # Fetch real-time data
        ticker = yf.Ticker(request.symbol + ".NS")  # NSE stocks
        hist = ticker.history(period="1y")
        
        if hist.empty:
            raise HTTPException(status_code=404, detail=f"No data found for {request.symbol}")
        
        current_price = hist['Close'].iloc[-1]
        
        # Get prediction
        prediction = stock_predictor.predict(hist, request.days)
        
        # Calculate confidence based on model accuracy
        confidence = stock_predictor.get_confidence()
        
        # Generate recommendation
        percent_change = ((prediction - current_price) / current_price) * 100
        if percent_change > 5:
            recommendation = "Strong Buy"
        elif percent_change > 2:
            recommendation = "Buy"
        elif percent_change < -5:
            recommendation = "Strong Sell"
        elif percent_change < -2:
            recommendation = "Sell"
        else:
            recommendation = "Hold"
        
        # Risk level based on volatility
        volatility = hist['Close'].pct_change().std() * np.sqrt(252)
        if volatility < 0.2:
            risk_level = "Low"
        elif volatility < 0.4:
            risk_level = "Medium"
        else:
            risk_level = "High"
        
        return StockPredictionResponse(
            symbol=request.symbol,
            current_price=round(current_price, 2),
            predicted_price=round(prediction, 2),
            confidence=round(confidence, 2),
            recommendation=recommendation,
            risk_level=risk_level
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/risk", response_model=RiskAnalysisResponse)
async def analyze_risk(request: RiskAnalysisRequest):
    """Analyze stock risk vs return"""
    try:
        ticker = yf.Ticker(request.symbol + ".NS")
        hist = ticker.history(period="2y")
        
        if hist.empty:
            raise HTTPException(status_code=404, detail=f"No data found for {request.symbol}")
        
        # Get stock info
        info = ticker.info
        stock_name = info.get('longName', request.symbol)
        
        # Calculate metrics
        returns = hist['Close'].pct_change().dropna()
        
        # Risk score (0-10)
        volatility = returns.std() * np.sqrt(252)
        risk_score = min(10, volatility * 20)
        
        # Risk level
        if risk_score <= 3.5:
            risk_level = "Low"
        elif risk_score <= 6.5:
            risk_level = "Medium"
        else:
            risk_level = "High"
        
        # Sharpe Ratio (risk-adjusted return)
        risk_free_rate = 0.07  # 7% assumed
        excess_returns = returns.mean() * 252 - risk_free_rate
        sharpe_ratio = excess_returns / volatility if volatility > 0 else 0
        
        # Max Drawdown
        cumulative = (1 + returns).cumprod()
        running_max = cumulative.expanding().max()
        drawdown = (cumulative - running_max) / running_max
        max_drawdown = drawdown.min()
        
        # Recommendation based on user risk appetite
        user_risk_map = {"Low": 0, "Medium": 1, "High": 2}
        stock_risk_map = {"Low": 0, "Medium": 1, "High": 2}
        
        user_level = user_risk_map.get(request.user_risk_appetite, 1)
        stock_level = stock_risk_map.get(risk_level, 1)
        
        if abs(user_level - stock_level) <= 1:
            if sharpe_ratio > 1:
                recommendation = "✅ Suitable - Good risk-adjusted returns"
            else:
                recommendation = "⚠️ Suitable but low risk-adjusted returns"
        elif stock_level > user_level:
            recommendation = "⚠️ Too risky for your profile"
        else:
            recommendation = "✅ Conservative choice for your profile"
        
        return RiskAnalysisResponse(
            symbol=request.symbol,
            stock_name=stock_name,
            risk_score=round(risk_score, 1),
            risk_level=risk_level,
            volatility=round(volatility * 100, 2),
            sharpe_ratio=round(sharpe_ratio, 2),
            max_drawdown=round(max_drawdown * 100, 2),
            recommendation=recommendation
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/suggestions")
async def get_investment_suggestions(request: InvestmentSuggestionsRequest):
    """Get AI-powered investment suggestions based on risk appetite"""
    try:
        # List of NSE stocks to analyze
        symbols = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 
                   'HINDUNILVR', 'SBIN', 'BHARTIARTL', 'ITC', 'WIPRO']
        
        suggestions = []
        
        for symbol in symbols:
            ticker = yf.Ticker(symbol + ".NS")
            hist = ticker.history(period="6mo")
            
            if hist.empty:
                continue
            
            current_price = hist['Close'].iloc[-1]
            returns = hist['Close'].pct_change().dropna()
            volatility = returns.std() * np.sqrt(252)
            
            # Calculate risk score
            risk_score = min(10, volatility * 20)
            
            # Filter based on risk appetite
            if request.risk_appetite == "Low" and risk_score > 4:
                continue
            elif request.risk_appetite == "Medium" and (risk_score < 2.5 or risk_score > 7):
                continue
            elif request.risk_appetite == "High" and risk_score < 6:
                continue
            
            # Calculate expected return (momentum based)
            recent_return = hist['Close'].pct_change(5).iloc[-1] * 100
            expected_return = recent_return * 12  # Annualized
            
            # Get stock name
            info = ticker.info
            stock_name = info.get('longName', symbol)
            
            suggestions.append({
                "symbol": symbol,
                "name": stock_name,
                "currentValue": round(current_price, 2),
                "expectedReturn": round(expected_return, 2),
                "riskScore": round(risk_score, 1),
                "riskLevel": "Low" if risk_score <= 3.5 else ("Medium" if risk_score <= 6.5 else "High"),
                "recommendation": "Buy" if expected_return > 10 else ("Hold" if expected_return > 0 else "Sell")
            })
        
        # Sort by expected return
        suggestions.sort(key=lambda x: x['expectedReturn'], reverse=True)
        
        return {
            "success": True,
            "riskAppetite": request.risk_appetite,
            "suggestions": suggestions[:5],  # Top 5 suggestions
            "totalAnalyzed": len(suggestions)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/similar-funds/{symbol}")
async def get_similar_funds(symbol: str):
    """Find similar funds based on sector and performance correlation"""
    try:
        # Get similar stocks based on sector
        sector_map = {
            'RELIANCE': 'Energy',
            'TCS': 'IT',
            'INFY': 'IT',
            'WIPRO': 'IT',
            'HDFCBANK': 'Banking',
            'ICICIBANK': 'Banking',
            'SBIN': 'Banking',
            'HINDUNILVR': 'FMCG',
            'ITC': 'FMCG'
        }
        
        sector = sector_map.get(symbol, 'General')
        
        # Find stocks in same sector
        same_sector = [s for s, sec in sector_map.items() if sec == sector and s != symbol]
        
        similar = []
        for s in same_sector:
            ticker = yf.Ticker(s + ".NS")
            hist = ticker.history(period="3mo")
            
            if hist.empty:
                continue
            
            current_price = hist['Close'].iloc[-1]
            returns = hist['Close'].pct_change().dropna()
            
            similar.append({
                "symbol": s,
                "name": s,
                "value": round(current_price, 2),
                "growth": round(returns.mean() * 100, 2)
            })
        
        return {
            "success": True,
            "similar": similar[:3]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)