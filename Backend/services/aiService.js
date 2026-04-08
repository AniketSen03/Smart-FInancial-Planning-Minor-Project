const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';

class AIService {
  async predictStock(symbol, days = 30) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/predict/stock`, {
        symbol,
        days
      });
      return response.data;
    } catch (error) {
      console.error('AI Prediction error:', error.message);
      return null;
    }
  }

  async analyzeRisk(symbol, userRiskAppetite) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/analyze/risk`, {
        symbol,
        user_risk_appetite: userRiskAppetite
      });
      return response.data;
    } catch (error) {
      console.error('Risk analysis error:', error.message);
      return null;
    }
  }

  async getInvestmentSuggestions(riskAppetite, amount = 100000, horizon = 12) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/suggestions`, {
        risk_appetite: riskAppetite,
        amount,
        horizon
      });
      return response.data;
    } catch (error) {
      console.error('Investment suggestions error:', error.message);
      return null;
    }
  }

  async getSimilarFunds(symbol) {
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/similar-funds/${symbol}`);
      return response.data;
    } catch (error) {
      console.error('Similar funds error:', error.message);
      return null;
    }
  }
}

module.exports = new AIService();