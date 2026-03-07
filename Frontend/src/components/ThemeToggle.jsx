import {useTheme} from '../context/ThemeContext';

export default function ThemeToggle() {
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