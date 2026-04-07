import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';

const Register = () => {
  const [form, setForm]     = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.name.trim())    return setError('Full name is required');
    if (!form.email.trim())   return setError('Email is required');
    if (!/\S+@\S+\.\S+/.test(form.email)) return setError('Enter a valid email address');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');

    setLoading(true);
    try {
      await registerUser(form.name, form.email, form.password, form.role);
      setSuccess('Account created! Redirecting to login…');
      setTimeout(() => navigate('/'), 1600);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🎓</div>
          <div className="auth-logo-text">
            <h1>CampusDesk</h1>
            <span>Smart Campus Complaint System</span>
          </div>
        </div>

        <h2 className="auth-title">Create account</h2>
        <p className="auth-subtitle">Join your campus management portal</p>

        {error   && <div className="alert error">⚠️ {error}</div>}
        {success && <div className="alert success">✅ {success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text" name="name" className="form-input"
              placeholder="Jane Doe"
              value={form.name} onChange={handle}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email" name="email" className="form-input"
              placeholder="you@campus.edu"
              value={form.email} onChange={handle}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password" name="password" className="form-input"
              placeholder="Min. 6 characters"
              value={form.password} onChange={handle}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select name="role" className="form-select" value={form.role} onChange={handle}>
              <option value="student">Student</option>
            </select>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account →'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
