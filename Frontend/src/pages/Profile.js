import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Card, Input, ScoreRing, Badge, ImgBanner } from '../components/UI';
import { calcHealth, fmtK, fmt, IMGS } from '../utils';

export default function Profile({ profile, setProfile }) {
  const { T } = useTheme();
  const score   = calcHealth(profile);
  const surplus = Math.max(0, profile.income - profile.expenses - profile.emi);

  const priorities = [
    { label: 'Emergency Fund',    need: profile.expenses * 6,      priority: 'High',   color: T.rose,   icon: '🛡️' },
    { label: 'Health Insurance',  need: profile.income   * 0.04,   priority: 'High',   color: T.rose,   icon: '❤️' },
    { label: 'EMI / Debt Repay',  need: profile.emi,               priority: 'High',   color: T.amber,  icon: '💳' },
    { label: 'Mutual Funds/SIP',  need: Math.max(0, surplus * 0.5),priority: 'Medium', color: T.amber,  icon: '📊' },
    { label: 'Home Loan',         need: Math.max(0, surplus * 0.3),priority: 'Medium', color: T.blue,   icon: '🏠' },
    { label: 'Lifestyle Goals',   need: Math.max(0, surplus * 0.2),priority: 'Low',    color: T.teal,   icon: '✨' },
  ];

  const update = key => val => setProfile(p => ({ ...p, [key]: val }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <ImgBanner src={IMGS.profile} title="Financial Profile" subtitle="Build your Digital Financial Identity" color={T.blue} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Card>
          <div style={{ fontWeight: 800, fontSize: 16, color: T.text, marginBottom: 20 }}>💼 Your Numbers</div>
          <Input label="Monthly Income (₹)"       value={profile.income}      onChange={update('income')}      />
          <Input label="Monthly Expenses (₹)"     value={profile.expenses}    onChange={update('expenses')}    />
          <Input label="Monthly EMI / Loans (₹)"  value={profile.emi}         onChange={update('emi')}         />
          <Input label="Monthly Savings (₹)"      value={profile.savings}     onChange={update('savings')}     />
          <Input label="Monthly Investments (₹)"  value={profile.investments} onChange={update('investments')} />
          <Input label="Emergency Fund Total (₹)" value={profile.emergency}   onChange={update('emergency')}   />
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card style={{ textAlign: 'center', padding: 28 }}>
            <ScoreRing score={score} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 18 }}>
              {[
                { l: 'Savings Rate',   v: profile.income ? `${Math.round(profile.savings / profile.income * 100)}%`      : '0%',     c: T.teal   },
                { l: 'DTI Ratio',      v: profile.income ? `${Math.round(profile.emi     / profile.income * 100)}%`      : '0%',     c: T.rose   },
                { l: 'Monthly Surplus',v: fmtK(surplus),                                                                              c: T.blue   },
                { l: 'Invest Rate',    v: profile.income ? `${Math.round(profile.investments / profile.income * 100)}%` : '0%',      c: T.violet },
              ].map(({ l, v, c }) => (
                <div key={l} style={{ background: T.bg, borderRadius: 12, padding: 12, border: `1px solid ${T.border}`, transition: 'background 0.3s' }}>
                  <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4, fontWeight: 600 }}>{l}</div>
                  <div style={{ color: c, fontWeight: 800, fontSize: 18, fontFamily: "'JetBrains Mono',monospace" }}>{v}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div style={{ fontWeight: 800, fontSize: 14, color: T.text, marginBottom: 14 }}>📋 Priority Hierarchy</div>
            {priorities.map(p => (
              <div key={p.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: T.bg, borderRadius: 10, border: `1px solid ${T.border}`, marginBottom: 8, transition: 'background 0.3s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{p.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{p.label}</div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>{fmtK(Math.round(p.need))}/mo</div>
                  </div>
                </div>
                <Badge color={p.color}>{p.priority}</Badge>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
