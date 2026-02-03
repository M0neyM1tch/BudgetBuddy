import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { trackEvent, trackConversion, trackError } from '../../utils/analytics';
import './Auth.css';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
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
        // Track login attempt
        trackEvent(null, 'auth', {
          category: 'auth',
          action: 'login_attempt',
          label: 'password_login'
        });

        await login(email, password);
        
        // Success tracking happens in AuthContext
        console.log('✅ Login successful');
      } else {
        if (!name || name.trim().length < 2) {
          throw new Error('Please enter a valid name (at least 2 characters)');
        }
        
        // Track signup attempt
        trackEvent(null, 'auth', {
          category: 'auth',
          action: 'signup_attempt',
          label: 'email_signup'
        });
        
        await register(name, email, password);
        
        // Track signup success
        trackConversion('signup', '/login', {
          signup_method: 'email',
          requires_email_confirmation: true
        });
        
        setSuccessMessage(
          'Account created! Please check your email to confirm your account before logging in.'
        );
        
        console.log('🎉 Signup conversion tracked');
        
        setName('');
        setEmail('');
        setPassword('');
        
        setTimeout(() => {
          setIsLogin(true);
          setSuccessMessage('');
        }, 3000);
      }
    } catch (err) {
      let errorType = 'unknown';
      let errorMessage = err.message;

      if (err.message.includes('User already registered')) {
        errorType = 'duplicate_email';
        errorMessage = 'This email is already registered. Please login instead.';
      } else if (err.message.includes('Invalid login credentials')) {
        errorType = 'invalid_credentials';
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (err.message.includes('Email not confirmed')) {
        errorType = 'email_not_confirmed';
        errorMessage = 'Please confirm your email before logging in. Check your inbox.';
      } else if (err.message.includes('Password should')) {
        errorType = 'weak_password';
        errorMessage = 'Password does not meet security requirements.';
      }

      setError(errorMessage);

      // Track auth error
      trackError(
        `auth_${isLogin ? 'login' : 'signup'}_error`,
        errorType,
        err.stack || '',
        null,
        {
          error_type: errorType,
          auth_method: isLogin ? 'login' : 'signup'
        }
      );

      trackEvent(null, 'auth', {
        category: 'auth',
        action: isLogin ? 'login_failed' : 'signup_failed',
        label: errorType
      });
    } finally {
      setLoading(false);
    }
  };

const handleForgotPassword = async (e) => {
  e.preventDefault();
  setError('');
  setSuccessMessage('');
  setLoading(true);

  try {
    // Track forgot password request
    trackEvent(null, 'auth', {
      category: 'auth',
      action: 'forgot_password_request',
      label: 'email_reset'
    });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://budg.ca/reset-password'
    });

    if (error) throw error;

    setSuccessMessage('Password reset email sent! Check your inbox.');
    
    // Track success
    trackEvent(null, 'auth', {
      category: 'auth',
      action: 'forgot_password_success',
      label: 'email_sent'
    });

    setTimeout(() => {
      setShowForgotPassword(false);
      setSuccessMessage('');
    }, 3000);
  } catch (err) {
    setError(err.message);
    
    // Track error
    trackError('forgot_password_error', err.message, err.stack || '', null);
  } finally {
    setLoading(false);
  }
};

  // Track form toggle
  const handleFormToggle = () => {
    trackEvent(null, 'auth', {
      category: 'auth',
      action: 'form_toggle',
      label: isLogin ? 'switch_to_signup' : 'switch_to_login'
    });

    setIsLogin(!isLogin);
    setError('');
    setSuccessMessage('');
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


          {/* ADD THE FORGOT PASSWORD SECTION HERE */}
          {isLogin && (
            <button
              type="button"
              onClick={() => setShowForgotPassword(!showForgotPassword)}
              style={{
                background: 'none',
                border: 'none',
                color: '#10b981',
                cursor: 'pointer',
                fontSize: '14px',
                textDecoration: 'underline',
                marginTop: '-10px',
                marginBottom: '10px'
              }}
            >
              Forgot Password?
            </button>
          )}

          {showForgotPassword && isLogin && (
            <div style={{ marginBottom: '15px' }}>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '10px' }}>
                Enter your email to receive a password reset link
              </p>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={loading || !email}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
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
            onClick={handleFormToggle}
            className="auth-toggle-btn"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
