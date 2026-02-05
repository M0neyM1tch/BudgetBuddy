import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AdminAnalytics.css';

function AdminAnalytics() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newSignups: 0,
    featureUsage: [],
    recentErrors: [],
    conversions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Authorization check
  useEffect(() => {
    if (!user) {
      alert('Please log in to access admin analytics');
      navigate('/login');
      return;
    }

    if (!isAdmin) {
      alert('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }
  }, [user, isAdmin, navigate]);

  // Load analytics data
  useEffect(() => {
    if (user && isAdmin) {
      loadAnalytics();
    }
  }, [user, isAdmin]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
      const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

      const newStats = { ...stats };

      // 1. Total Users (from profiles table)
      try {
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.warn('Error loading total users from profiles:', error);
          throw error;
        }
        newStats.totalUsers = count || 0;
      } catch (err) {
        console.warn('Failed to load total users:', err);
        // Fallback: count unique users from transactions
        try {
          const { data: userData } = await supabase
            .from('transactions')
            .select('user_id');
          
          if (userData && userData.length > 0) {
            newStats.totalUsers = new Set(userData.map(t => t.user_id)).size;
          }
        } catch (fallbackErr) {
          console.warn('Fallback failed:', fallbackErr);
        }
      }


      // 2. Active Users
      try {
        const { data: activeData } = await supabase
          .from('transactions')
          .select('user_id, created_at')
          .gte('created_at', thirtyDaysAgo);
        
        if (activeData && activeData.length > 0) {
          newStats.activeUsers = new Set(activeData.map(t => t.user_id)).size;
        }
      } catch (err) {
        console.warn('Failed to load active users:', err);
      }

      // 3. New Signups
      try {
        const { data: newSignupsData } = await supabase
          .from('conversion_events')
          .select('id')
          .eq('event_type', 'signup')
          .gte('created_at', sevenDaysAgo);
        newStats.newSignups = newSignupsData ? newSignupsData.length : 0;
      } catch (err) {
        console.warn('Failed to load new signups:', err);
      }

      // 4. Feature Usage
      try {
        const { data: featureData } = await supabase
          .from('feature_usage')
          .select('feature_name')
          .gte('created_at', thirtyDaysAgo)
          .limit(500);

        if (featureData && featureData.length > 0) {
          const featureCounts = featureData.reduce((acc, { feature_name }) => {
            if (feature_name) {
              acc[feature_name] = (acc[feature_name] || 0) + 1;
            }
            return acc;
          }, {});

          newStats.featureUsage = Object.entries(featureCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6);
        }
      } catch (err) {
        console.warn('Failed to load feature usage:', err);
      }

      // 5. Recent Errors
      try {
        const { data: recentErrors } = await supabase
          .from('error_logs')
          .select('error_type, error_message, page_path, created_at')
          .order('created_at', { ascending: false })
          .limit(5);
        newStats.recentErrors = recentErrors || [];
      } catch (err) {
        console.warn('Failed to load recent errors:', err);
      }

      // 6. Recent Conversions
      try {
        const { data: conversions } = await supabase
          .from('conversion_events')
          .select('event_type, source_page, created_at')
          .order('created_at', { ascending: false })
          .limit(8);
        newStats.conversions = conversions || [];
      } catch (err) {
        console.warn('Failed to load conversions:', err);
      }

      setStats(newStats);

    } catch (error) {
      console.error('Analytics load error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const timeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      const seconds = Math.floor((new Date() - date) / 1000);
      
      if (seconds < 60) return `${seconds}s ago`;
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch (err) {
      return 'Unknown';
    }
  };

  if (!isAdmin) {
    return (
      <div className="admin-analytics">
        <div className="access-denied">
          <h1>🚫 Access Denied</h1>
          <p>You do not have permission to view this page.</p>
          <button onClick={() => navigate('/')} className="btn-secondary">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-analytics">
        <div className="loading-state">
          <div className="spinner"></div>
          <h2>📊 Loading Analytics...</h2>
          <p>Gathering your app data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-analytics">
      {/* Header */}
      <div className="admin-header">
        <div className="header-left">
          <h1>📊 Analytics Dashboard</h1>
          <span className="admin-badge">ADMIN</span>
        </div>
        <button onClick={loadAnalytics} className="refresh-btn" disabled={loading}>
          <span className="refresh-icon">🔄</span>
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}
      
      {/* Main Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <span className="stat-label">Total Users</span>
            <span className="stat-value">{stats.totalUsers}</span>
            <span className="stat-sublabel">All time</span>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon">✨</div>
          <div className="stat-content">
            <span className="stat-label">Active Users</span>
            <span className="stat-value">{stats.activeUsers}</span>
            <span className="stat-sublabel">Last 30 days</span>
          </div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-icon">🎉</div>
          <div className="stat-content">
            <span className="stat-label">New Signups</span>
            <span className="stat-value">{stats.newSignups}</span>
            <span className="stat-sublabel">Last 7 days</span>
          </div>
        </div>
      </div>

      {/* Feature Usage */}
      <div className="section">
        <h2 className="section-title">🎯 Most Used Features</h2>
        <div className="feature-grid">
          {stats.featureUsage.length > 0 ? (
            stats.featureUsage.map((feature, idx) => (
              <div key={idx} className="feature-card">
                <div className="feature-header">
                  <span className="feature-name">{feature.name}</span>
                  <span className="feature-count">{feature.count}</span>
                </div>
                <div className="feature-bar">
                  <div 
                    className="feature-bar-fill" 
                    style={{ 
                      width: `${(feature.count / stats.featureUsage[0].count) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No feature usage data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Conversions */}
      {stats.conversions.length > 0 && (
        <div className="section">
          <h2 className="section-title">🎉 Recent User Activity</h2>
          <div className="activity-list">
            {stats.conversions.map((conversion, idx) => (
              <div key={idx} className="activity-item">
                <div className="activity-icon">
                  {conversion.event_type === 'signup' ? '✨' : 
                   conversion.event_type === 'login' ? '🔑' : 
                   conversion.event_type === 'signup_intent' ? '👀' : '📝'}
                </div>
                <div className="activity-content">
                  <div className="activity-main">
                    <strong>{conversion.event_type}</strong>
                    <span className="activity-meta">from {conversion.source_page || 'Unknown'}</span>
                  </div>
                  <span className="activity-time">{timeAgo(conversion.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Errors */}
      {stats.recentErrors.length > 0 && (
        <div className="section">
          <h2 className="section-title">⚠️ Recent Errors</h2>
          <div className="error-list">
            {stats.recentErrors.map((error, idx) => (
              <div key={idx} className="error-item">
                <div className="error-header">
                  <strong className="error-type">{error.error_type || 'Unknown Error'}</strong>
                  <span className="error-time">{timeAgo(error.created_at)}</span>
                </div>
                <div className="error-message">{error.error_message || 'No message'}</div>
                <div className="error-page">Page: {error.page_path || 'Unknown'}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAnalytics;
