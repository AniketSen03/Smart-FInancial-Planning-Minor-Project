import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { Card, StatCard, RangeInput, Badge, ImgBanner, ChartTooltip } from '../components/UI';
import { calcEMI, fmtK, fmt, IMGS } from '../utils';
const BASE = import.meta.env.VITE_API_BASE || 'https://smart-f-inancial-planning-minor-pro-chi.vercel.app/api';
export default function Debt() {
  const { T } = useTheme();
  const [loans, setLoans] = useState([
    { id: 1, name: 'Home Loan',     principal: 3000000, rate: 8.5,  months: 240 },
    { id: 2, name: 'Car Loan',      principal: 700000,  rate: 10.5, months: 60  },
    { id: 3, name: 'Personal Loan', principal: 200000,  rate: 16,   months: 36  },
  ]);
  const [strategy,   setStrategy]   = useState('avalanche');
  const [investRet,  setInvestRet]  = useState(12);
  const [extra,      setExtra]      = useState(5000);
useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${BASE}/loans`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()).then(data => {
      if (data.loans?.length) setLoans(data.loans.map(l => ({
        id: l._id, name: l.name,
        principal: l.principalAmount,
        rate: l.annualInterestRate,
        months: l.tenureMonths,
      })));
    }).catch(console.error);
  }, []);
  const sorted   = [...loans].sort((a, b) => strategy === 'avalanche' ? b.rate - a.rate : a.principal - b.principal);
  const totalEMI = loans.reduce((s, l) => s + calcEMI(l.principal, l.rate, l.months), 0);
  const totalInt = loans.reduce((s, l) => { const e = calcEMI(l.principal, l.rate, l.months); return s + (e * l.months - l.principal); }, 0);
  const maxRate  = Math.max(...loans.map(l => l.rate));

  const payoffData = sorted.map((l, i) => {
    const e = calcEMI(l.principal, l.rate, l.months);
    const bonus = i === 0 ? extra : 0;
    const newMonths = Math.round(l.months * l.principal / (l.principal + bonus * 12));
    return { name: l.name.slice(0, 10), Standard: l.months, Optimized: Math.max(6, newMonths) };
  });

  const updateLoan = (id, key, val) => setLoans(ls => ls.map(l => l.id === id ? { ...l, [key]: val } : l));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <ImgBanner src={IMGS.debt} title="Debt Snowball / Avalanche Optimizer" subtitle="AI-powered debt repayment strategy with intelligent decision engine" color={T.rose} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        <StatCard label="Monthly EMI Total" value={fmtK(totalEMI)}              icon="💳" color={T.rose}   light={T.roseLight}  sub="Total monthly outflow" />
        <StatCard label="Total Interest"    value={fmtK(Math.round(totalInt))}  icon="📉" color={T.amber}  light={T.amberLight} sub="Lifetime cost of debt"  />
        <StatCard label="Active Loans"      value={loans.length}                 icon="🏦" color={T.blue}   light={T.blueLight}  sub="Loan accounts"          />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '310px 1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <div style={{ fontWeight: 800, fontSize: 15, color: T.text, marginBottom: 16 }}>⚙️ Strategy Settings</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
              {['avalanche', 'snowball'].map(s => (
                <button key={s} onClick={() => setStrategy(s)}
                  style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: `2px solid ${strategy === s ? T.teal : T.border}`, background: strategy === s ? T.tealLight : 'transparent', color: strategy === s ? T.tealDark : T.textMuted, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                  {s === 'avalanche' ? '🏔 Avalanche' : '⛄ Snowball'}
                </button>
              ))}
            </div>
            <RangeInput label="Extra Monthly Payment" min={0}  max={50000} step={500} value={extra}     onChange={setExtra}     format={fmtK} />
            <RangeInput label="Investment Return %"   min={5}  max={25}    step={0.5} value={investRet} onChange={setInvestRet} format={v => `${v}%`} color={T.blue} />

            <div style={{ borderRadius: 14, padding: 16, background: maxRate > investRet ? T.roseLight : T.greenLight, border: `1.5px solid ${maxRate > investRet ? T.rose : T.green}44`, transition: 'background 0.3s' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, marginBottom: 8, letterSpacing: 0.5 }}>🤖 AI RECOMMENDATION</div>
              {maxRate > investRet
                ? <div style={{ color: T.rose, fontWeight: 700, fontSize: 14 }}>🔴 Pay Loans First<br /><span style={{ fontSize: 12, fontWeight: 500, color: T.textSub }}>Highest rate {maxRate}% &gt; returns {investRet}%</span></div>
                : <div style={{ color: T.green, fontWeight: 700, fontSize: 14 }}>🟢 Invest Surplus<br /><span style={{ fontSize: 12, fontWeight: 500, color: T.textSub }}>Returns {investRet}% &gt; highest rate {maxRate}%</span></div>}
            </div>
          </Card>

          <Card>
            <div style={{ fontWeight: 800, fontSize: 14, color: T.text, marginBottom: 14 }}>📊 Payoff Timeline (months)</div>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={payoffData}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Standard"  fill={T.border} name="Standard"  radius={[4, 4, 0, 0]} />
                <Bar dataKey="Optimized" fill={T.teal}   name="Optimized" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <button onClick={async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${BASE}/loans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: 'New Loan', principalAmount: 100000, annualInterestRate: 10, tenureMonths: 24 }),
    });
    const data = await res.json();
    const l = data.loan;
    setLoans(ls => [...ls, { id: l._id, name: l.name, principal: l.principalAmount, rate: l.annualInterestRate, months: l.tenureMonths }]);
  } catch { alert('Add loan failed'); }
}}
            style={{ background: 'transparent', border: `2px dashed ${T.border}`, borderRadius: 14, padding: 14, color: T.textMuted, cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', transition: 'border-color 0.2s' }}>
            + Add Another Loan
          </button>
        </div>

        {/* Loans List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: T.textSub, padding: '0 4px' }}>
            Repayment Order — {strategy === 'avalanche' ? 'Highest Rate First ↓' : 'Smallest Balance First ↑'}
          </div>
          {sorted.map((loan, idx) => {
            const e        = calcEMI(loan.principal, loan.rate, loan.months);
            const interest = e * loan.months - loan.principal;
            const c        = idx === 0 ? T.rose : idx === 1 ? T.amber : T.blue;
            return (
              <Card key={loan.id} hover style={{ position: 'relative', borderLeft: `4px solid ${c}` }}>
                <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ background: c + '18', color: c, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 800 }}>#{idx + 1} Priority</div>
                  <button onClick={async () => {
  try {
    const token = localStorage.getItem('token');
    await fetch(`${BASE}/loans/${loan.id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
    });
    setLoans(ls => ls.filter(l => l.id !== loan.id));
  } catch { alert('Delete failed'); }
}}

                    style={{ background: T.roseLight, border: 'none', color: T.rose, cursor: 'pointer', fontSize: 12, borderRadius: 8, padding: '4px 10px', fontWeight: 700, fontFamily: 'inherit' }}>✕</button>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <input value={loan.name} onChange={e => updateLoan(loan.id, 'name', e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: T.text, fontWeight: 800, fontSize: 18, outline: 'none', width: '55%', fontFamily: 'inherit' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10 }}>
                  {[
                    { l: 'Principal', v: fmtK(loan.principal) },
                    { l: 'Rate',      v: `${loan.rate}%`      },
                    { l: 'Tenure',    v: `${loan.months}m`    },
                    { l: 'EMI',       v: fmtK(e)              },
                    { l: 'Interest',  v: fmtK(Math.round(interest)) },
                    { l: 'Total',     v: fmtK(Math.round(e * loan.months)) },
                  ].map(({ l, v }) => (
                    <div key={l} style={{ background: T.bg, borderRadius: 10, padding: '10px 8px', border: `1px solid ${T.border}`, textAlign: 'center', transition: 'background 0.3s' }}>
                      <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 4, fontWeight: 600 }}>{l}</div>
                      <div style={{ fontSize: 12, color: T.text, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: T.textMuted }}>Interest rate:</span>
                  <div style={{ flex: 1, background: T.border, borderRadius: 6, height: 6 }}>
                    <div style={{ background: c, borderRadius: 6, height: 6, width: `${Math.min(loan.rate / 25 * 100, 100)}%`, transition: 'width 0.5s' }} />
                  </div>
                  <span style={{ fontSize: 12, color: c, fontWeight: 700 }}>{loan.rate}% p.a.</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}