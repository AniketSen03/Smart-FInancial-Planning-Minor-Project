# 💎 FinAI – AI-Driven Financial Health Planner

A full-featured React web application for intelligent financial planning, investment prediction, debt optimization, and AI-powered financial advice.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed ([download](https://nodejs.org))
- npm (comes with Node.js)

### Installation & Run

```bash
# 1. Navigate into the project folder
cd finai

# 2. Install dependencies
npm install

# 3. Start the development server
npm start
```

The app will open at **http://localhost:3000**

---

## 🌟 Features

| Module | Description |
|--------|-------------|
| 📊 **Dashboard** | Health score ring, 6-month cash flow chart, expense pie chart, health metrics, goal progress |
| 👤 **Financial Profile** | Enter income/expenses/EMI/savings — auto-calculates health score & priority hierarchy |
| 🎯 **Goal Planner** | Add goals, track progress with animated bars, simulate time-to-achieve |
| 📈 **Investment Predictor** | SIP + lump sum calculator with growth charts, fund comparison, wealth multiplier |
| 💳 **Debt Optimizer** | Snowball vs Avalanche strategy, AI recommendation engine, payoff timeline chart |
| 🔬 **What-If Simulator** | Real-time sliders — model expense cuts, income boosts, loan refinancing |
| 🤖 **AI Advisor** | Claude AI-powered chatbot, personalized to your financial profile |

---

## 🎨 Theme Toggle

Click the **☀️ Light / 🌙 Dark** toggle in the bottom-left sidebar to switch themes instantly. Your preference is saved in `localStorage`.

---

## 🛠 Tech Stack

- **React 18** — UI framework
- **Recharts** — All charts (Area, Bar, Pie, Radial)
- **Claude API** — AI Advisor chatbot (claude-sonnet-4-20250514)
- **Google Fonts** — Plus Jakarta Sans + JetBrains Mono
- **Unsplash** — High-quality finance photography
- **Pure inline styles** — No CSS framework needed

---

## 📁 Project Structure

```
finai/
├── public/
│   └── index.html
├── src/
│   ├── context/
│   │   └── ThemeContext.js     ← Light/Dark theme with toggle
│   ├── components/
│   │   └── UI.js              ← Shared: Card, Input, Badge, ScoreRing, etc.
│   ├── pages/
│   │   ├── Dashboard.js
│   │   ├── Profile.js
│   │   ├── Goals.js
│   │   ├── Investment.js
│   │   ├── Debt.js
│   │   ├── WhatIf.js
│   │   └── Chatbot.js
│   ├── utils.js               ← Financial math + constants
│   └── App.js                 ← Main shell with sidebar & routing
├── package.json
└── README.md
```

---

## 📝 Notes

- The **AI Advisor** uses the Anthropic Claude API. It works out of the box in this app (API key is handled by the platform). If running standalone, you may need to configure a backend proxy.
- All financial data is stored in React state (in-memory) — no backend or database needed.
- Sample data is pre-loaded so you can explore all features immediately.

---

Built with ❤️ — AI-Driven FinTech Minor Project
