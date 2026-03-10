import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Card, Badge, ImgBanner } from '../components/UI';
import { calcHealth, fmtK, IMGS } from '../utils';
const BASE = import.meta.env.VITE_API_BASE || 'https://smart-f-inancial-planning-minor-pro-chi.vercel.app/api';
export default function Chatbot({ profile }) {
  const { T } = useTheme();
  const [msgs,    setMsgs]    = useState([
    { role: 'assistant', text: "👋 Hello! I'm your personal AI Financial Advisor.\n\nI've analyzed your financial profile — ask me anything about budgeting, SIPs, loan repayment, tax saving, or wealth building. I give personalized, actionable advice!" }
  ]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const score = calcHealth(profile);
  const scoreColor = score >= 75 ? T.teal : score >= 50 ? T.amber : T.rose;

  const sys = `You are an expert AI Financial Advisor for an Indian user. Be personalized, concise, and practical.

User Profile:
- Monthly Income: ₹${profile.income?.toLocaleString('en-IN') || 'Not set'}
- Monthly Expenses: ₹${profile.expenses?.toLocaleString('en-IN') || 'Not set'}
- Monthly Savings: ₹${profile.savings?.toLocaleString('en-IN') || 'Not set'}
- Monthly Investments: ₹${profile.investments?.toLocaleString('en-IN') || 'Not set'}
- Monthly EMI: ₹${profile.emi?.toLocaleString('en-IN') || 'Not set'}
- Emergency Fund: ₹${profile.emergency?.toLocaleString('en-IN') || 'Not set'}
- Financial Health Score: ${score}/100

Give sharp, personalized advice using Indian financial context (₹, RBI, SEBI, SIPs, PPF, ELSS, FD, NPS, etc.). Keep under 200 words. Use numbered points or bullets when listing items.`;

  const send = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', text: input };
    setMsgs(m => [...m, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const history = [...msgs, userMsg].map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.text }));
     const token = localStorage.getItem('token');
      const res = await fetch(`${BASE}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: input.trim() }),
      });
      const d = await res.json();
      const reply = d.reply || 'Sorry, could not process that.';
      setMsgs(m => [...m, { role: 'assistant', text: reply }]);
    } catch {
      setMsgs(m => [...m, { role: 'assistant', text: '⚠️ Connection error. Please try again.' }]);
    }
    setLoading(false);
  }, [input, loading, msgs, sys]);

  const suggestions = [
    'How can I improve my financial health score?',
    'Should I prepay my home loan or invest in SIP?',
    'How much corpus do I need for retirement?',
    'Best tax-saving investments under 80C for me?',
    'How to build a 6-month emergency fund fast?',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <ImgBanner src={IMGS.advisor} title="AI Financial Advisor" subtitle="Powered by Claude AI · Personalized to your complete financial profile" color={T.teal} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>
        <Card style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ padding: '18px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 14, background: T.bg, transition: 'background 0.3s' }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: `linear-gradient(135deg,${T.teal},${T.blue})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🤖</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: T.text }}>FinAI Advisor</div>
              <div style={{ fontSize: 12, color: T.green, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.green, animation: 'pulse 2s infinite' }} />
                Online · Ready to help
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}><Badge color={T.teal}>Score: {score}/100</Badge></div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 440, minHeight: 340 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 10 }}>
                {m.role === 'assistant' && (
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg,${T.teal},${T.blue})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0, marginTop: 4 }}>🤖</div>
                )}
                <div style={{
                  maxWidth: '76%', padding: '13px 18px',
                  borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: m.role === 'user' ? `linear-gradient(135deg,${T.teal},${T.blue})` : T.bg,
                  color: m.role === 'user' ? '#fff' : T.text,
                  fontSize: 14, lineHeight: 1.7,
                  border: m.role === 'assistant' ? `1px solid ${T.border}` : 'none',
                  boxShadow: T.shadow, whiteSpace: 'pre-wrap', transition: 'background 0.3s',
                }}>{m.text}</div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg,${T.teal},${T.blue})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>🤖</div>
                <div style={{ background: T.bg, borderRadius: 16, padding: '12px 18px', border: `1px solid ${T.border}`, display: 'flex', gap: 5, alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: T.teal, animation: `blink 1s ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '16px 20px', borderTop: `1px solid ${T.border}`, display: 'flex', gap: 10, background: T.bg, transition: 'background 0.3s' }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask about investments, loans, tax saving..."
              style={{ flex: 1, background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: '12px 16px', color: T.text, fontSize: 14, outline: 'none', fontFamily: 'inherit', transition: 'background 0.3s, border-color 0.3s' }} />
            <button onClick={send} disabled={loading}
              style={{ background: `linear-gradient(135deg,${T.teal},${T.blue})`, border: 'none', borderRadius: 12, padding: '12px 22px', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', opacity: loading ? 0.6 : 1, boxShadow: `0 4px 14px ${T.teal}44`, fontFamily: 'inherit' }}>
              Send ↗
            </button>
          </div>
        </Card>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card>
            <div style={{ fontWeight: 800, fontSize: 14, color: T.text, marginBottom: 14 }}>💡 Quick Questions</div>
            {suggestions.map(s => (
              <button key={s} onClick={() => setInput(s)}
                style={{ display: 'block', width: '100%', textAlign: 'left', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px', color: T.textSub, fontSize: 12, cursor: 'pointer', lineHeight: 1.5, marginBottom: 8, fontWeight: 500, fontFamily: 'inherit', transition: 'all 0.15s' }}>
                {s}
              </button>
            ))}
          </Card>
          <Card>
            <div style={{ fontWeight: 800, fontSize: 14, color: T.text, marginBottom: 14 }}>📊 Your Snapshot</div>
            {[
              { l: 'Income',       v: fmtK(profile.income),       c: T.teal   },
              { l: 'Savings Rate', v: `${profile.income ? Math.round(profile.savings / profile.income * 100) : 0}%`, c: T.blue   },
              { l: 'Health Score', v: `${score}/100`,              c: scoreColor },
              { l: 'Emergency',    v: fmtK(profile.emergency),    c: T.violet  },
            ].map(({ l, v, c }) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: `1px solid ${T.border}` }}>
                <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 500 }}>{l}</span>
                <span style={{ color: c, fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, fontSize: 13 }}>{v}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  );
}