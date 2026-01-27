import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import '../Auth/Auth.css';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');

      if (type === 'recovery' && tokenHash) {
        // Verify the OTP token
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery'
        });

        if (error) {
          console.error('Token verification error:', error);
          setIsRecoveryMode(false);
        } else {
          setIsRecoveryMode(true);
        }
      } else {
        setIsRecoveryMode(false);
      }
      setVerifying(false);
    };

    verifyToken();
  }, [searchParams]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (password.length < 10) {
      setError('Password must be at least 10 characters');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setError('Error updating password: ' + error.message);
      setLoading(false);
    } else {
      alert('✅ Password updated successfully!');
      navigate('/');
    }
  };

  if (verifying) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <img src="/BBLogo.jpg" alt="BudgetBuddy" className="auth-logo" />
            <h2>Verifying...</h2>
          </div>
          <p style={{ color: '#6b7280' }}>Please wait while we verify your reset link.</p>
        </div>
      </div>
    );
  }

  if (!isRecoveryMode) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <img src="/BBLogo.jpg" alt="BudgetBuddy" className="auth-logo" />
            <h2>Invalid or Expired Link</h2>
          </div>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            This password reset link is invalid or has expired.
          </p>
          <button onClick={() => navigate('/')} style={{ width: '100%' }}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img src="/BBLogo.jpg" alt="BudgetBuddy" className="auth-logo" />
          <h1>Reset Your Password</h1>
          <p style={{ marginBottom: '20px', color: '#6b7280' }}>
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="auth-form">
          <input
            type="password"
            placeholder="New Password (min. 10 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={10}
          />

          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={10}
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
