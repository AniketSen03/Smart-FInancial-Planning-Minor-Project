import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import { Card, Input, Badge, ImgBanner, ChartTooltip } from '../components/UI';
import { fmtK, fmt, IMGS } from '../utils';
const BASE = import.meta.env.VITE_API_BASE;
const GOAL_ICONS = { Home: '🏠', Retirement: '🏖️', Car: '🚗', Education: '🎓', Business: '💼', Emergency: '🛡️', Wedding: '💍', Travel: '✈️' };
const getIcon = name => Object.keys(GOAL_ICONS).find(k => name.includes(k)) ? GOAL_ICONS[Object.keys(GOAL_ICONS).find(k => name.includes(k))] : '🎯';

export default function Goals({ goals, setGoals, profile }) {
  const { T } = useTheme();
  const [form, setForm] = useState({ name: '', target: 500000, saved: 0, priority: 'Medium' });

 const addGoal = async () => {
    if (!form.name.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: form.name, targetAmount: form.target,
          savedAmount: form.saved, priority: form.priority.toLowerCase(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      const g = data.goal;
      setGoals(prev => [...prev, {
        id: g._id, name: g.name,
        target: g.targetAmount, saved: g.savedAmount,
        priority: g.priority.charAt(0).toUpperCase() + g.priority.slice(1),
      }]);
      setForm({ name: '', target: 500000, saved: 0, priority: 'Medium' });
    } catch (err) { alert(err.message); }
  };

  const barData = goals.map(g => ({
    name: g.name.slice(0, 10),
    Saved:     g.saved,
    Remaining: Math.max(0, g.target - g.saved),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <ImgBanner src={IMGS.goal} title="Goal-Based Financial Planner" subtitle="Define, simulate & systematically achieve your financial targets" color={T.teal} />

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>
        {/* Add Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <div style={{ fontWeight: 800, fontSize: 15, color: T.text, marginBottom: 18 }}>➕ Add New Goal</div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 600 }}>Goal Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Home, Retirement, Car..."
                style={{ width: '100%', background: T.inputBg, border: `1.5px solid ${T.border}`, borderRadius: 10, padding: '11px 14px', color: T.text, fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'background 0.3s, border-color 0.3s', fontFamily: 'inherit' }} />
            </div>
            <Input label="Target Amount (₹)" value={form.target} onChange={v => setForm(f => ({ ...f, target: v }))} />
            <Input label="Already Saved (₹)" value={form.saved}  onChange={v => setForm(f => ({ ...f, saved: v }))}  />
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 600 }}>Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                style={{ width: '100%', background: T.inputBg, border: `1.5px solid ${T.border}`, borderRadius: 10, padding: '11px 14px', color: T.text, fontSize: 14, outline: 'none', fontFamily: 'inherit', cursor: 'pointer', transition: 'background 0.3s' }}>
                <option>High</option><option>Medium</option><option>Low</option>
              </select>
            </div>

            <div style={{ background: T.tealLight, borderRadius: 14, padding: 16, marginBottom: 16, border: `1px solid ${T.teal}30`, transition: 'background 0.3s' }}>
              <div style={{ fontSize: 11, color: T.teal, fontWeight: 800, marginBottom: 4, letterSpacing: 0.5 }}>⏱ TIME TO ACHIEVE</div>
              <div style={{ fontSize: 28, color: T.teal, fontWeight: 900, fontFamily: "'JetBrains Mono',monospace" }}>
                {profile.savings > 0 ? `${Math.ceil((form.target - form.saved) / profile.savings)} mo` : 'Set savings first'}
              </div>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>at ₹{profile.savings.toLocaleString('en-IN')}/month savings</div>
            </div>

            <button onClick={addGoal}
              style={{ width: '100%', background: `linear-gradient(135deg,${T.teal},${T.blue})`, color: '#fff', border: 'none', borderRadius: 12, padding: '13px 0', fontWeight: 800, fontSize: 14, cursor: 'pointer', boxShadow: `0 4px 16px ${T.teal}44`, letterSpacing: 0.3, fontFamily: 'inherit' }}>
              + Add Goal
            </button>
          </Card>

          {goals.length > 0 && (
            <Card>
              <div style={{ fontWeight: 800, fontSize: 14, color: T.text, marginBottom: 14 }}>📊 Progress Overview</div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={barData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={T.border} />
                  <XAxis type="number" tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtK} />
                  <YAxis type="category" dataKey="name" tick={{ fill: T.textSub, fontSize: 11 }} axisLine={false} tickLine={false} width={72} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Saved"     fill={T.teal}   stackId="a" name="Saved"     />
                  <Bar dataKey="Remaining" fill={T.border} stackId="a" name="Remaining" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>

        {/* Goals List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {goals.length === 0 && (
            <Card style={{ textAlign: 'center', padding: 64 }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>🎯</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 8 }}>No Goals Yet</div>
              <div style={{ color: T.textMuted }}>Add your first financial goal to start tracking your progress</div>
            </Card>
          )}
          {goals.map(g => {
            const pct    = Math.min(100, Math.round(g.saved / g.target * 100));
            const months = profile.savings > 0 ? Math.ceil((g.target - g.saved) / profile.savings) : null;
            const c      = g.priority === 'High' ? T.rose : g.priority === 'Medium' ? T.amber : T.blue;
            return (
              <Card key={g.id} hover style={{ position: 'relative' }}>
                <button onClick={async () => {
  try {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:5000/api/goals/${g.id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
    });
    setGoals(gs => gs.filter(x => x.id !== g.id));
  } catch { alert('Delete failed'); }
}}
                  style={{ position: 'absolute', top: 16, right: 16, background: T.roseLight, border: 'none', color: T.rose, cursor: 'pointer', fontSize: 12, borderRadius: 8, padding: '4px 12px', fontWeight: 700, fontFamily: 'inherit' }}>
                  ✕ Remove
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: c + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>{getIcon(g.name)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: T.text, fontWeight: 800, fontSize: 18 }}>{g.name}</div>
                    <div style={{ color: T.textMuted, fontSize: 12, marginTop: 2 }}>Target: {fmt(g.target)} · Saved: {fmt(g.saved)}</div>
                  </div>
                  <Badge color={c}>{g.priority} Priority</Badge>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ flex: 1, background: T.border, borderRadius: 8, height: 10 }}>
                    <div style={{ background: `linear-gradient(90deg,${c},${c}88)`, borderRadius: 8, height: 10, width: `${pct}%`, transition: 'width 1s', boxShadow: `0 2px 8px ${c}44` }} />
                  </div>
                  <span style={{ fontSize: 16, color: c, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace", minWidth: 44 }}>{pct}%</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {[
                    { l: 'Remaining',    v: fmt(Math.max(0, g.target - g.saved))      },
                    { l: 'Time to Goal', v: months ? `${months} months` : '–'         },
                    { l: 'In Years',     v: months ? `${(months / 12).toFixed(1)} yr` : '–' },
                  ].map(({ l, v }) => (
                    <div key={l} style={{ background: T.bg, borderRadius: 10, padding: 10, border: `1px solid ${T.border}`, textAlign: 'center', transition: 'background 0.3s' }}>
                      <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 4, fontWeight: 600 }}>{l}</div>
                      <div style={{ color: T.text, fontWeight: 700, fontSize: 13, fontFamily: "'JetBrains Mono',monospace" }}>{v}</div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
