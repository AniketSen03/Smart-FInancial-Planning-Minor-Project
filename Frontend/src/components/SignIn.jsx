import { useState, useEffect } from "react";
import "../Styles/SignIn.css";

export default function SignIn() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [focused, setFocused] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [particles, setParticles] = useState([]);
  const [showSignUpForm, setShowSignUpForm] = useState(false);


  useEffect(() => {
    const pts = Array.from({ length: 22 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 18 + 10,
      delay: Math.random() * 6,
      opacity: Math.random() * 0.4 + 0.1,
    }));
    setParticles(pts);
  }, []);

 const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
     const BASE = import.meta.env.VITE_API_BASE || 'https://smart-f-inancial-planning-minor-pro-chi.vercel.app/api';
      if (showSignUpForm) {
        if (password !== confirmPassword) {
          alert('Passwords do not match!');
          setLoading(false);
          return;
        }
        const res = await fetch(`${BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/';
      } else {
        const res = await fetch(`${BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/';
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };


  const showSignUp = () => {setShowSignUpForm(true)};  
   
  return (
    <div className="si-root">
      {/* Background layers */}
      <div className="si-bg-mesh" />
      <div className="si-grid" />
      <div
        className="si-accent-line"
        style={{ width: "60%", left: "20%", top: "30%" }}
      />

      {/* Floating particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="si-particle"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDuration: `${p.speed}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Card */}
      <div className="si-card">

        {/* Logo */}
        <div className="si-logo-wrap">
          <div className="si-logo-icon">⬡</div>
          <div className="si-logo-text">
            AI<span>Fintech</span>
          </div>
        </div>

        {/* Badge */}
        <div className="si-badge">
          <span className="si-badge-dot" />
          SECURE PORTAL
        </div>

        {!showSignUpForm && (<div className="sign-component">
        <h2 className="si-headline">Welcome back</h2>
        <p className="si-sub">Sign in to your AI-Fintech account</p>

        <form onSubmit={handleSubmit}>

          {/* Email */}
          <div className={`si-field${focused === "email" ? " active" : ""}`}>
            <label className="si-label">Email address</label>
            <div className="si-input-wrap">
              <span className="si-icon">✉</span>
              <input
                className="si-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className={`si-field${focused === "password" ? " active" : ""}`}>
            <label className="si-label">Password</label>
            <div className="si-input-wrap">
              <span className="si-icon">🔒</span>
              <input
                className="si-input"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                required
              />
              <button
                type="button"
                className="si-toggle"
                onClick={() => setShowPass((v) => !v)}
                tabIndex={-1}
              >
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {/* Remember me + Forgot password */}
          <div className="si-row">
            <label className="si-check-label">
              <input type="checkbox" className="si-checkbox" />
              Remember me
            </label>
            <a href="#" className="si-forgot">
              Forgot password?
            </a>
          </div>

          {/* Submit */}
          <button className="si-btn" type="submit" disabled={loading}>
            <div className="si-btn-shine" />
            {loading ? <span className="si-spinner" /> : "Sign In →"}
          </button>
        </form>


        {/* Footer */}
        <div className="si-footer">
          Don't have an account? <a href="#" onClick={showSignUp}>Sign up free</a>
        </div>
        </div>
        )}

    {showSignUpForm && (
      <div className="SignUp-component" >
        <h2 className="si-headline">Join AI-Fintech</h2>
        <p className="si-sub">Create your account to start your financial journey</p>
        
        
        <form onSubmit={handleSubmit}>

        {/* Name */}
          <div className={`si-field${focused === "name" ? " active" : ""}`}>
            <label className="si-label">Full Name</label>
            <div className="si-input-wrap">
              <span className="si-icon">✉</span>
              <input
                className="si-input"
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocused("name")}
                onBlur={() => setFocused(null)}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className={`si-field${focused === "email" ? " active" : ""}`}>
            <label className="si-label">Email address</label>
            <div className="si-input-wrap">
              <span className="si-icon">✉</span>
              <input
                className="si-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className={`si-field${focused === "password" ? " active" : ""}`}>
            <label className="si-label">Password</label>
            <div className="si-input-wrap">
              <span className="si-icon">🔒</span>
              <input
                className="si-input"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                required
              />
              <button
                type="button"
                className="si-toggle"
                onClick={() => setShowPass((v) => !v)}
                tabIndex={-1}
              >
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>

         {/* Confirm Password */}
          <div className={`si-field${focused === "confirmPassword" ? " active" : ""}`}>
            <label className="si-label">Confirm Password</label>
            <div className="si-input-wrap">
              <span className="si-icon">🔒</span>
              <input
                className="si-input"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setFocused("confirmPassword")}
                onBlur={() => setFocused(null)}
                required
              />
              <button
                type="button"
                className="si-toggle"
                onClick={() => setShowPass((v) => !v)}
                tabIndex={-1}
              >
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>
        

          {/* Submit */}
          <button className="si-btn" type="submit" disabled={loading}>
            <div className="si-btn-shine" />
            {loading ? <span className="si-spinner" /> : "Sign Up →"}
          </button>
        </form>
    
   
    
    
     {/* Footer */}
    <div className="si-footer">
     Already have an account? <a href="#" onClick={() => setShowSignUpForm(false)}>SignIn</a>
    </div>
    
     </div>
    
    )}
      </div>
    </div>
  );
}