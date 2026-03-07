import React from 'react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { Card, StatCard, Badge, ImgBanner, ScoreRing, ChartTooltip } from '../components/UI';
import { calcHealth, fmtK, fmt, clamp, PIE_COLORS, IMGS } from '../utils';

export default function Dashboard({ profile, goals }) {
  const { T } = useTheme();
  const score   = calcHealth(profile);
  const surplus = Math.max(0, profile.income - profile.expenses - profile.emi);
  const savePct = profile.income ? Math.round(profile.savings / profile.income * 100) : 0;
  const scoreColor = score >= 75 ? T.teal : score >= 50 ? T.amber : T.rose;

  const expData = [
    { name: 'Housing',  value: Math.round(profile.expenses * 0.38) },
    { name: 'EMI',      value: profile.emi },
    { name: 'Savings',  value: profile.savings },
    { name: 'Invest',   value: profile.investments },
    { name: 'Food',     value: Math.round(profile.expenses * 0.15) },
    { name: 'Other',    value: Math.max(0, profile.income - profile.expenses - profile.emi - profile.savings - profile.investments) },
  ].filter(d => d.value > 0);

  const flowData = ['Oct','Nov','Dec','Jan','Feb','Mar'].map(m => ({
    month: m,
    Income:   Math.round(profile.income   * (0.97 + Math.random() * 0.06)),
    Expenses: Math.round(profile.expenses * (0.92 + Math.random() * 0.14)),
    Savings:  Math.round(profile.savings  * (0.85 + Math.random() * 0.3)),
  }));

  const radData = [
    { name: 'Savings',   value: Math.min(savePct, 20) / 20 * 100,                                                    fill: T.teal   },
    { name: 'Invest',    value: Math.min(profile.income ? profile.investments / profile.income * 100 : 0, 15) / 15 * 100, fill: T.blue   },
    { name: 'Emergency', value: Math.min(profile.expenses ? profile.emergency / (profile.expenses * 6) * 100 : 0, 100), fill: T.violet },
    { name: 'Low DTI',   value: Math.max(0, profile.income ? (1 - profile.emi / profile.income) * 100 : 0),           fill: T.amber  },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Hero */}
      <div style={{ borderRadius: 24, overflow: 'hidden', position: 'relative', height: 200, boxShadow: `0 8px 40px ${T.teal}28` }}>
        <img src={IMGS.hero} alt="Finance" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(110deg,${T.teal}ee 0%,${T.blue}bb 55%,transparent 100%)` }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 36px', gap: 32 }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>Good Morning 👋</div>
            <div style={{ color: '#fff', fontSize: 34, fontWeight: 900, letterSpacing: -1, marginTop: 4, lineHeight: 1.1 }}>Your Financial<br /><span style={{ fontWeight: 400 }}>Health Dashboard</span></div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 32, alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: 600 }}>Health Score</div>
              <div style={{ color: '#fff', fontSize: 52, fontWeight: 900, fontFamily: "'JetBrains Mono',monospace", lineHeight: 1 }}>{score}</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>out of 100</div>
            </div>
            <div style={{ width: 1, height: 80, background: 'rgba(255,255,255,0.25)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: 600 }}>Monthly Surplus</div>
              <div style={{ color: '#fff', fontSize: 30, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.2 }}>{fmtK(surplus)}</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>available to invest</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        <StatCard label="Monthly Income"   value={fmtK(profile.income)}      sub={`${savePct}% savings rate`}                                                                     icon="💰" color={T.teal}   light={T.tealLight}  />
        <StatCard label="Total Outflow"    value={fmtK(profile.expenses+profile.emi)} sub="Expenses + EMI"                                                                        icon="📊" color={T.blue}   light={T.blueLight}  />
        <StatCard label="Investments/mo"   value={fmtK(profile.investments)}  sub="Wealth building"                                                                              icon="📈" color={T.violet}  light={T.mode==='dark'?'#1A1040':'#F3F0FF'} />
        <StatCard label="Emergency Fund"   value={fmtK(profile.emergency)}    sub={`${profile.expenses ? Math.round(profile.emergency/profile.expenses) : 0} months cover`}      icon="🛡️" color={T.green} light={T.greenLight}  />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: 20 }}>
        <Card>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: T.text }}>6-Month Cash Flow</div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>Income · Expenses · Savings trend</div>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={flowData}>
              <defs>
                {[[T.teal,'gI'],[T.rose,'gE'],[T.blue,'gS']].map(([c,id]) => (
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={c} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={c} stopOpacity={0}    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: T.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtK} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: T.textSub }} />
              <Area type="monotone" dataKey="Income"   stroke={T.teal} fill="url(#gI)" strokeWidth={2.5} name="Income"   />
              <Area type="monotone" dataKey="Expenses" stroke={T.rose} fill="url(#gE)" strokeWidth={2}   name="Expenses" />
              <Area type="monotone" dataKey="Savings"  stroke={T.blue} fill="url(#gS)" strokeWidth={2}   name="Savings" strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: T.text }}>Expense Split</div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>Where your money goes</div>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie data={expData} cx="50%" cy="50%" innerRadius={48} outerRadius={82} paddingAngle={3} dataKey="value" strokeWidth={0}>
                {expData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {expData.map((d, i) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: T.textSub }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                {d.name}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: T.text }}>Health Metrics</div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>4-dimension analysis</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ScoreRing score={score} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
            {radData.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: d.fill, flexShrink: 0 }} />
                <span style={{ color: T.textSub, flex: 1 }}>{d.name}</span>
                <div style={{ flex: 2, background: T.border, borderRadius: 4, height: 5 }}>
                  <div style={{ background: d.fill, borderRadius: 4, height: 5, width: `${Math.round(d.value)}%`, transition: 'width 1s' }} />
                </div>
                <span style={{ color: d.fill, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", minWidth: 32, textAlign: 'right' }}>{Math.round(d.value)}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Goals */}
      {goals.length > 0 && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: T.text }}>Active Financial Goals</div>
              <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>Progress toward your targets</div>
            </div>
            <Badge color={T.teal}>{goals.length} Active Goals</Badge>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 14 }}>
            {goals.map(g => {
              const pct = Math.min(100, Math.round(g.saved / g.target * 100));
              const c = g.priority === 'High' ? T.rose : g.priority === 'Medium' ? T.amber : T.blue;
              return (
                <div key={g.id} style={{ background: T.bg, borderRadius: 14, padding: 16, border: `1px solid ${T.border}`, transition: 'background 0.3s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ color: T.text, fontWeight: 700, fontSize: 14 }}>{g.name}</span>
                    <Badge color={c}>{pct}%</Badge>
                  </div>
                  <div style={{ background: T.border, borderRadius: 6, height: 7, marginBottom: 8 }}>
                    <div style={{ background: `linear-gradient(90deg,${c},${c}99)`, borderRadius: 6, height: 7, width: `${pct}%`, transition: 'width 1s', boxShadow: `0 2px 6px ${c}44` }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: T.textMuted }}>
                    <span>{fmtK(g.saved)}</span><span>{fmtK(g.target)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
