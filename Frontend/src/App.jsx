import React, { useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Goals from './pages/Goals';
import Investment from './pages/Investment';
import Debt from './pages/Debt';
import WhatIf from './pages/WhatIf';
import Chatbot from './pages/Chatbot';
import { calcHealth } from './utils';


import { Routes, Route } from "react-router-dom";
import SignIn from './components/SignIn';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '⬡', emoji: '📊' },
  { id: 'profile', label: 'Financial Profile', icon: '◈', emoji: '👤' },
  { id: 'goals', label: 'Goal Planner', icon: '◎', emoji: '🎯' },
  { id: 'investment', label: 'Investments', icon: '◆', emoji: '📈' },
  { id: 'debt', label: 'Debt Optimizer', icon: '◉', emoji: '💳' },
  { id: 'whatif', label: 'What-If Simulator', icon: '⬟', emoji: '🔬' },
  { id: 'chatbot', label: 'AI Advisor', icon: '◇', emoji: '🤖' },
];

function ThemeToggle() {
  const { isDark, toggleTheme, T } = useTheme();
  return (
    <button onClick={toggleTheme}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: isDark ? '#1E2738' : '#F0F4FF',
        border: `1.5px solid ${T.border}`,
        borderRadius: 30, padding: '7px 14px',
        cursor: 'pointer', transition: 'all 0.3s', width: '100%',
        justifyContent: 'center',
      }}>
      <div style={{
        width: 32, height: 18, borderRadius: 9,
        background: isDark ? T.teal : T.border,
        position: 'relative', transition: 'background 0.3s', flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: 3, left: isDark ? 16 : 3,
          width: 12, height: 12, borderRadius: '50%',
          background: '#fff', transition: 'left 0.3s',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: T.textSub }}>
        {isDark ? '🌙 Dark' : '☀️ Light'}
      </span>
    </button>
  );
}

function AppInner() {
  const { T, isDark } = useTheme();
  const [page, setPage] = useState('dashboard');
  const [profile, setProfile] = useState({
    income: 80000, expenses: 35000, savings: 15000,
    emi: 12000, investments: 10000, emergency: 90000,
  });
  const [goals, setGoals] = useState([
    { id: 1, name: 'Emergency Fund', target: 210000, saved: 90000, priority: 'High' },
    { id: 2, name: 'Home Down Payment', target: 1500000, saved: 200000, priority: 'High' },
    { id: 3, name: 'Retirement Corpus', target: 10000000, saved: 500000, priority: 'Medium' },
  ]);

  const score = calcHealth(profile);
  const scoreColor = score >= 75 ? T.teal : score >= 50 ? T.amber : T.rose;

  const pages = {
    dashboard: <Dashboard profile={profile} goals={goals} />,
    profile: <Profile profile={profile} setProfile={setProfile} />,
    goals: <Goals goals={goals} setGoals={setGoals} profile={profile} />,
    investment: <Investment />,
    debt: <Debt />,
    whatif: <WhatIf profile={profile} />,
    chatbot: <Chatbot profile={profile} />,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif;
          background: ${T.bg};
          color: ${T.text};
          -webkit-font-smoothing: antialiased;
          transition: background 0.3s, color 0.3s;
        }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 10px; }
        input[type=range] {
          -webkit-appearance: none; height: 4px; border-radius: 4px;
          background: ${T.border}; outline: none; width: 100%;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 18px; height: 18px;
          border-radius: 50%; background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          cursor: pointer; border: 2.5px solid currentColor;
        }
        select option { background: ${T.surface}; color: ${T.text}; }
      `}</style>

      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        {/* ─── SIDEBAR ─── */}
        <div style={{
          width: 234, background: T.sidebarBg, borderRight: `1px solid ${T.border}`,
          display: 'flex', flexDirection: 'column',
          boxShadow: isDark ? '2px 0 20px rgba(0,0,0,0.3)' : '2px 0 20px rgba(60,80,160,0.06)',
          flexShrink: 0, transition: 'background 0.3s, border-color 0.3s',
        }}>
          {/* Logo */}
          <div style={{ padding: '24px 22px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 13, background: `linear-gradient(135deg,${T.teal},${T.blue})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21, boxShadow: `0 4px 14px ${T.teal}44`, flexShrink: 0 }}>💎</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: T.text, letterSpacing: -0.5 }}>AI-FinTech</div>
                <div style={{ fontSize: 9, color: T.textMuted, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>Health Planner</div>
              </div>
            </div>
          </div>

          {/* Score pill */}
          <div style={{ margin: '0 14px 16px', background: scoreColor + '15', borderRadius: 14, padding: '12px 16px', border: `1px solid ${scoreColor}30`, transition: 'background 0.3s' }}>
            <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 700, marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>Health Score</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: scoreColor, fontFamily: "'JetBrains Mono',monospace", lineHeight: 1 }}>{score}</div>
              <div style={{ flex: 1 }}>
                <div style={{ background: T.border, borderRadius: 4, height: 5 }}>
                  <div style={{ background: `linear-gradient(90deg,${scoreColor},${scoreColor}88)`, borderRadius: 4, height: 5, width: `${score}%`, transition: 'width 1s' }} />
                </div>
                <div style={{ fontSize: 10, color: T.textMuted, marginTop: 3 }}>out of 100</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '0 10px', overflowY: 'auto' }}>
            {NAV.map(({ id, label, emoji }) => {
              const active = page === id;
              return (
                <button key={id} onClick={() => setPage(id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 11, padding: '10px 14px',
                    width: '100%', background: active ? T.navActive : 'transparent',
                    border: 'none', borderRadius: 12,
                    borderLeft: `3px solid ${active ? T.teal : 'transparent'}`,
                    color: active ? T.teal : T.textMuted,
                    fontWeight: active ? 700 : 500, fontSize: 13.5,
                    cursor: 'pointer', marginBottom: 2,
                    transition: 'all 0.15s', textAlign: 'left',
                    fontFamily: 'inherit',
                  }}>
                  <span style={{ fontSize: 18, opacity: active ? 1 : 0.65 }}>{emoji}</span>
                  {label}
                  {active && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: T.teal }} />}
                </button>
              );
            })}
          </nav>

          {/* Theme Toggle + Footer */}
          <div style={{ padding: '14px 14px 18px', borderTop: `1px solid ${T.border}` }}>
            <ThemeToggle />
            <div style={{ textAlign: 'center', marginTop: 12, fontSize: 10, color: T.textMuted, fontWeight: 500 }}>
              AI-Driven FinTech Platform<br />
              <span style={{ color: T.teal, fontWeight: 600 }}>Powered by Ashish and Team's</span>
            </div>
          </div>
        </div>

        {/* ─── MAIN CONTENT ─── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', background: T.bg, transition: 'background 0.3s' }}>
          {pages[page]}
        </div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <>
      <ThemeProvider>
      <Routes>
        <Route
          path="/signin"
          element={
            <>
              <SignIn />
            </>
          }
        />

        <Route
          path="/"
          element={
            <AppInner />}
        />

      </Routes>
       </ThemeProvider>
    </>


  );
}
