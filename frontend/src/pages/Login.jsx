import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, LockKeyhole, Mail } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('admin@gaspredict.local');
  const [password, setPassword] = useState('admin123');
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    navigate('/admin');
  };

  return (
    <main className="auth-page">
      <Link to="/" className="back-link"><ArrowLeft size={18} /> Home</Link>
      <form className="auth-card glass-card" onSubmit={submit}>
        <p className="eyebrow">Optional Authentication</p>
        <h1>Admin Login</h1>
        <label><Mail size={18} /><input value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label><LockKeyhole size={18} /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <button className="btn primary wide">Sign In</button>
      </form>
    </main>
  );
}
