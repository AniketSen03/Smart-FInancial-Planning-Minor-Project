import numpy as np
import pandas as pd
from scipy import stats

class RiskAnalyzer:
    def __init__(self):
        self.risk_free_rate = 0.07  # 7% assumed
        
    def calculate_var(self, returns, confidence_level=0.95):
        """Calculate Value at Risk"""
        return np.percentile(returns, (1 - confidence_level) * 100)
    
    def calculate_cvar(self, returns, confidence_level=0.95):
        """Calculate Conditional Value at Risk (Expected Shortfall)"""
        var = self.calculate_var(returns, confidence_level)
        return returns[returns <= var].mean()
    
    def calculate_beta(self, stock_returns, market_returns):
        """Calculate Beta (market sensitivity)"""
        covariance = np.cov(stock_returns, market_returns)[0, 1]
        market_variance = np.var(market_returns)
        return covariance / market_variance if market_variance != 0 else 1
    
    def analyze_stock(self, hist_data, market_data=None):
        """Comprehensive risk analysis"""
        returns = hist_data['Close'].pct_change().dropna()
        
        # Basic metrics
        volatility = returns.std() * np.sqrt(252)
        avg_return = returns.mean() * 252
        
        # Risk metrics
        var_95 = self.calculate_var(returns)
        cvar_95 = self.calculate_cvar(returns)
        
        # Sharpe Ratio
        sharpe = (avg_return - self.risk_free_rate) / volatility if volatility > 0 else 0
        
        # Maximum Drawdown
        cumulative = (1 + returns).cumprod()
        running_max = cumulative.expanding().max()
        drawdown = (cumulative - running_max) / running_max
        max_drawdown = drawdown.min()
        
        # Skewness and Kurtosis
        skewness = returns.skew()
        kurtosis = returns.kurtosis()
        
        # Calculate Beta if market data provided
        beta = None
        if market_data is not None:
            market_returns = market_data['Close'].pct_change().dropna()
            beta = self.calculate_beta(returns, market_returns)
        
        # Overall risk score (0-10)
        risk_score = min(10, volatility * 15)
        
        # Risk level classification
        if risk_score <= 3.5:
            risk_level = "Low"
        elif risk_score <= 6.5:
            risk_level = "Medium"
        else:
            risk_level = "High"
        
        return {
            "volatility": round(volatility * 100, 2),
            "avgAnnualReturn": round(avg_return * 100, 2),
            "valueAtRisk_95": round(var_95 * 100, 2),
            "conditionalVaR_95": round(cvar_95 * 100, 2),
            "sharpeRatio": round(sharpe, 2),
            "maxDrawdown": round(max_drawdown * 100, 2),
            "skewness": round(skewness, 2),
            "kurtosis": round(kurtosis, 2),
            "beta": round(beta, 2) if beta else None,
            "riskScore": round(risk_score, 1),
            "riskLevel": risk_level
        }