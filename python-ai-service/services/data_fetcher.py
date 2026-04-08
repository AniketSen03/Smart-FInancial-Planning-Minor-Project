import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import requests

class DataFetcher:
    def __init__(self):
        self.nse_symbols = {
            'RELIANCE': 'RELIANCE.NS',
            'TCS': 'TCS.NS',
            'HDFCBANK': 'HDFCBANK.NS',
            'INFY': 'INFY.NS',
            'ICICIBANK': 'ICICIBANK.NS',
            'HINDUNILVR': 'HINDUNILVR.NS',
            'SBIN': 'SBIN.NS',
            'WIPRO': 'WIPRO.NS',
            'ITC': 'ITC.NS',
            'BHARTIARTL': 'BHARTIARTL.NS'
        }
    
    def get_stock_data(self, symbol, period='1y'):
        """Fetch stock data from Yahoo Finance"""
        ticker_symbol = self.nse_symbols.get(symbol, f"{symbol}.NS")
        ticker = yf.Ticker(ticker_symbol)
        
        hist = ticker.history(period=period)
        
        if hist.empty:
            return None
        
        return hist
    
    def get_multiple_stocks(self, symbols, period='1y'):
        """Fetch data for multiple stocks"""
        data = {}
        for symbol in symbols:
            stock_data = self.get_stock_data(symbol, period)
            if stock_data is not None:
                data[symbol] = stock_data
        return data
    
    def get_current_market_scenario(self):
        """Analyze current market scenario"""
        # Fetch Nifty data as market benchmark
        nifty = yf.Ticker("^NSEI")
        nifty_hist = nifty.history(period="3mo")
        
        if nifty_hist.empty:
            return "neutral"
        
        # Calculate market trend
        recent_returns = nifty_hist['Close'].pct_change(20).iloc[-1]
        
        if recent_returns > 0.05:
            return "bull"
        elif recent_returns < -0.05:
            return "bear"
        else:
            return "neutral"
    
    def get_top_gainers(self, limit=5):
        """Get top gaining stocks (mock implementation)"""
        # In production, you would fetch from NSE API
        symbols = list(self.nse_symbols.keys())
        gains = []
        
        for symbol in symbols:
            data = self.get_stock_data(symbol, period='1mo')
            if data is not None and len(data) > 1:
                gain = ((data['Close'].iloc[-1] - data['Close'].iloc[0]) / data['Close'].iloc[0]) * 100
                gains.append({'symbol': symbol, 'gain': gain})
        
        gains.sort(key=lambda x: x['gain'], reverse=True)
        return gains[:limit]