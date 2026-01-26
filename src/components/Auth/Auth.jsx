import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { login, register } = useAuth();

  // Password strength checker
  const checkPasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[@$!%*?&#^()_+=[\]{}|:\";<>,./-]/.test(pwd)) strength++;
    
    return strength;
  };

  const getPasswordStrengthLabel = () => {
    const strength = checkPasswordStrength(password);
    if (strength === 0) return { label: '', color: '' };
    if (strength <= 2) return { label: 'Weak', color: '#ef4444' };
    if (strength <= 3) return { label: 'Fair', color: '#f59e0b' };
    if (strength <= 4) return { label: 'Good', color: '#10b981' };
    return { label: 'Strong', color: '#059669' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!name || name.trim().length < 2) {
          throw new Error('Please enter a valid name (at least 2 characters)');
        }
        
        await register(name, email, password);
        
        setSuccessMessage(
          'Account created! Please check your email to confirm your account before logging in.'
        );
        
        setName('');
        setEmail('');
        setPassword('');
        
        setTimeout(() => {
          setIsLogin(true);
          setSuccessMessage('');
        }, 3000);
      }
    } catch (err) {
      if (err.message.includes('User already registered')) {
        setError('This email is already registered. Please login instead.');
      } else if (err.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (err.message.includes('Email not confirmed')) {
        setError('Please confirm your email before logging in. Check your inbox.');
      } else if (err.message.includes('Password should')) {
        setError('Password does not meet security requirements.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrengthLabel();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img src="/BBLogo.jpg" alt="BudgetBuddy" className="auth-logo" />
          <h1>BudgetBuddy</h1>
          <p>{isLogin ? 'Welcome back!' : 'Create your account'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
            />
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <div className="password-field">
            <input
              type="password"
              placeholder="Password (min. 10 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={10}
            />
            {!isLogin && password.length > 0 && (
              <div className="password-strength">
                <div 
                  className="strength-bar"
                  style={{ 
                    width: `${(checkPasswordStrength(password) / 5) * 100}%`,
                    backgroundColor: passwordStrength.color 
                  }}
                />
                <span style={{ color: passwordStrength.color }}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
          </div>

          {!isLogin && (
            <p className="password-hint">
              Include uppercase, lowercase, numbers, and symbols
            </p>
          )}

          
            {/* Terms & Privacy Consent - Only show on signup */}
            {!isLogin && (
              <div className="consent-section">
                <label className="consent-checkbox">
                  <input type="checkbox" required />
                  <span>
                    I agree to the{' '}
                    <a href="/terms" target="_blank" rel="noopener noreferrer">
                      Terms of Service
                    </a>
                  </span>
                </label>
                <label className="consent-checkbox">
                  <input type="checkbox" required />
                  <span>
                    I have read the{' '}
                    <a href="/privacy" target="_blank" rel="noopener noreferrer">
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </div>
            )}

          {error && <p className="auth-error">{error}</p>}
          {successMessage && <p className="auth-success">{successMessage}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <div className="auth-toggle">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccessMessage('');
            }}
            className="auth-toggle-btn"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
