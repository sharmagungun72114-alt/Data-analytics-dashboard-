import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Lock, User as UserIcon, Mail, UserPlus, Chrome, AlertCircle, ArrowRight, CheckCircle2, Globe } from 'lucide-react';
import { User } from '../types.js';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  // Sign In State
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  
  // Sign Up State
  const [signupName, setSignupName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);

  // General State
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [showCustomGoogleForm, setShowCustomGoogleForm] = useState(false);

  const navigate = useNavigate();

  // User list for simulation
  const googleAccounts = [
    { name: 'Gungun Sharma', email: 'sharmagungun72114@gmail.com', avatar: 'GS' },
    { name: 'Admin User', email: 'admin@company.com', avatar: 'AU' }
  ];

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/login', { username, password });
      if (response.data.success) {
        onLoginSuccess(response.data.user);
        navigate('/');
      } else {
        setError(response.data.message || 'Invalid credentials.');
      }
    } catch (err: any) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Login failed.');
      } else {
        setError('Server is offline or unreachable.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/register', {
        name: signupName,
        username: signupUsername,
        email: signupEmail,
        password: signupPassword
      });

      if (response.data.success) {
        setSignupSuccess(true);
        // Automatically switch to sign-in and fill in details
        setUsername(signupUsername);
        setPassword(signupPassword);
        setTimeout(() => {
          setActiveTab('signin');
          setSignupSuccess(false);
          // Clear signup fields
          setSignupName('');
          setSignupUsername('');
          setSignupEmail('');
          setSignupPassword('');
        }, 2000);
      }
    } catch (err: any) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Registration failed.');
      } else {
        setError('Server is offline or unreachable.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (email: string, name: string) => {
    setError('');
    setLoading(true);
    setShowGoogleModal(false);

    try {
      const response = await axios.post('/api/google-login', { email, name });
      if (response.data.success) {
        onLoginSuccess(response.data.user);
        navigate('/');
      }
    } catch (err: any) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Google Sign-In failed.');
      } else {
        setError('Server is offline or unreachable.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" id="login-page">
      <div className="login-card" style={{ maxWidth: '440px' }}>
        <div className="login-header">
          <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', marginBottom: '16px' }}>
            <LayoutDashboard size={32} />
          </div>
          <h2 className="login-title">BI Analytics Pro</h2>
          <p className="login-subtitle">Access your multi-tenant business dashboards</p>
        </div>

        {/* Tab selection */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '24px' }}>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'signin' ? 'active' : ''}`}
            onClick={() => { setActiveTab('signin'); setError(''); }}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: 'none',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              color: activeTab === 'signin' ? 'var(--accent-blue)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'signin' ? '2px solid var(--accent-blue)' : '2px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => { setActiveTab('signup'); setError(''); }}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: 'none',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              color: activeTab === 'signup' ? 'var(--accent-blue)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'signup' ? '2px solid var(--accent-blue)' : '2px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="alert alert-error" id="login-error" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', padding: '12px', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: '13px' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {signupSuccess && (
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', padding: '12px', borderRadius: '8px', backgroundColor: '#dcfce7', color: '#15803d', fontSize: '13px' }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>Account created successfully! Switching to login...</span>
          </div>
        )}

        {activeTab === 'signin' ? (
          <form onSubmit={handleSignIn} id="login-form">
            <div className="form-group">
              <label className="form-label">Username or Email</label>
              <div className="search-input-wrapper">
                <UserIcon size={16} className="search-icon" />
                <input
                  type="text"
                  id="login-username"
                  className="form-control form-input-full search-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="admin or email@company.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="search-input-wrapper">
                <Lock size={16} className="search-icon" />
                <input
                  type="password"
                  id="login-password"
                  className="form-control form-input-full search-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              className="btn btn-primary login-btn"
              style={{ width: '100%', padding: '12px', justifyContent: 'center', fontWeight: 600 }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUp} id="signup-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="search-input-wrapper">
                <UserIcon size={16} className="search-icon" />
                <input
                  type="text"
                  className="form-control form-input-full search-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="Gungun Sharma"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Username</label>
              <div className="search-input-wrapper">
                <UserIcon size={16} className="search-icon" />
                <input
                  type="text"
                  className="form-control form-input-full search-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="gungun"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="search-input-wrapper">
                <Mail size={16} className="search-icon" />
                <input
                  type="email"
                  className="form-control form-input-full search-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="sharmagungun72114@gmail.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="search-input-wrapper">
                <Lock size={16} className="search-icon" />
                <input
                  type="password"
                  className="form-control form-input-full search-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="••••••••"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary login-btn"
              style={{ width: '100%', padding: '12px', justifyContent: 'center', fontWeight: 600 }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
          <span style={{ padding: '0 12px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase' }}>or continue with</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
        </div>

        {/* Google Login Trigger */}
        <button
          type="button"
          onClick={() => setShowGoogleModal(true)}
          className="btn"
          style={{ width: '100%', justifyContent: 'center', gap: '10px', padding: '11px', fontWeight: 500, backgroundColor: '#ffffff', color: '#1f2937', borderColor: '#d1d5db' }}
          disabled={loading}
        >
          <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google Account
        </button>

        {activeTab === 'signin' && (
          <div className="demo-credentials" style={{ marginTop: '20px' }}>
            <p style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--text-primary)' }}>Quick Demo Sign In:</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
              <div>Username: <strong style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => { setUsername('admin'); setPassword('admin123'); }}>admin</strong></div>
              <div>Password: <strong>admin123</strong></div>
            </div>
          </div>
        )}
      </div>

      {/* Google Account Selector Simulation Modal */}
      {showGoogleModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
            color: '#1f2937'
          }}>
            <div style={{ padding: '32px 32px 24px 32px', textAlign: 'center', borderBottom: '1px solid #f3f4f6' }}>
              {/* Google Colored Logo */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <svg style={{ width: '44px', height: '44px' }} viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', margin: '0 0 6px 0' }}>Sign in with Google</h3>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>to continue to <strong style={{ color: '#2563eb' }}>BI Analytics Pro</strong></p>
            </div>

            <div style={{ padding: '16px 24px 24px 24px' }}>
              {!showCustomGoogleForm ? (
                <>
                  <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: '#9ca3af', letterSpacing: '0.5px', marginBottom: '12px', paddingLeft: '8px' }}>Choose an account</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {googleAccounts.map((account) => (
                      <button
                        key={account.email}
                        type="button"
                        onClick={() => handleGoogleLogin(account.email, account.name)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          width: '100%',
                          padding: '12px',
                          borderRadius: '10px',
                          border: '1px solid #e5e7eb',
                          backgroundColor: '#ffffff',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f9fafb'; e.currentTarget.style.borderColor = '#d1d5db'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
                      >
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: '#eff6ff',
                          color: '#2563eb',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '13px',
                          border: '1px solid #dbeafe'
                        }}>
                          {account.avatar}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{account.name}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280', textOverflow: 'ellipsis', overflow: 'hidden' }}>{account.email}</div>
                        </div>
                        <ChevronRightIcon />
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => setShowCustomGoogleForm(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        width: '100%',
                        padding: '12px',
                        borderRadius: '10px',
                        border: '1px dashed #cbd5e1',
                        backgroundColor: '#f8fafc',
                        cursor: 'pointer',
                        textAlign: 'left',
                        color: '#475569',
                        fontSize: '13px',
                        fontWeight: 600,
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: '#cbd5e1',
                        color: '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        +
                      </div>
                      Use another account
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); handleGoogleLogin(customGoogleEmail, customGoogleName); }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: '#9ca3af', letterSpacing: '0.5px', marginBottom: '2px' }}>Enter Google Account details</p>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>EMAIL ADDRESS</label>
                    <input
                      type="email"
                      placeholder="e.g. user@gmail.com"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        fontSize: '13px',
                        color: '#1f2937'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>FULL NAME</label>
                    <input
                      type="text"
                      placeholder="e.g. Jane Doe"
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        fontSize: '13px',
                        color: '#1f2937'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setShowCustomGoogleForm(false)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        backgroundColor: '#ffffff',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#475569'
                      }}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #2563eb',
                        backgroundColor: '#2563eb',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#ffffff'
                      }}
                    >
                      Sign In
                    </button>
                  </div>
                </form>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', fontSize: '12px', color: '#6b7280' }}>
                <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Globe size={12} />
                  English (United States)
                </span>
                <button
                  type="button"
                  onClick={() => { setShowGoogleModal(false); setShowCustomGoogleForm(false); }}
                  style={{ border: 'none', background: 'none', color: '#4b5563', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChevronRightIcon() {
  return (
    <svg style={{ width: '16px', height: '16px', color: '#9ca3af' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
