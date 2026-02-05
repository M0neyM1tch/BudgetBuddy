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
    totalSessions: 0,
    featureUsage: [],
    deviceStats: { desktop: 0, mobile: 0, tablet: 0 },
    recentSessions: [],
    recentErrors: [],
    conversions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Authorization check - redirect if not admin
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

  // Load analytics data only if user is admin
  useEffect(() => {
    if (user && isAdmin) {
      loadAnalytics();
    }
  }, [user, isAdmin]);

  // Helper: Query with timeout protection
  const queryWithTimeout = async (queryFn, timeoutMs = 10000) => {
    return Promise.race([
      queryFn(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), timeoutMs)
      )
    ]);
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate date ranges
      const now = new Date();
      const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
      const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

      const newStats = { ...stats };

      // 1. Get total unique users from transactions table
      try {
        const { data: userData } = await supabase
          .from('transactions')
          .select('user_id');
        
        if (userData && userData.length > 0) {
          newStats.totalUsers = new Set(userData.map(t => t.user_id)).size;
        }
      } catch (err) {
        console.warn('Failed to load total users:', err);
      }

      // 2. Get active users (users who created/modified data in last 30 days)
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

      // 3. Get new signups (last 7 days)
      try {
        const { data: newSignupsData } = await queryWithTimeout(() =>
          supabase
            .from('conversion_events')
            .select('id')
            .eq('event_type', 'signup')
            .gte('created_at', sevenDaysAgo)
        );
        newStats.newSignups = newSignupsData ? newSignupsData.length : 0;
      } catch (err) {
        console.warn('Failed to load new signups:', err);
      }

      // 4. Get device stats from ALL sessions (last 30 days)
      try {
        const { data: sessions } = await queryWithTimeout(() =>
          supabase
            .from('user_sessions')
            .select('device_type, session_id')
            .gte('session_start', thirtyDaysAgo)
            .limit(500)
        );

        if (sessions && sessions.length > 0) {
          // Count device types
          const deviceStats = { desktop: 0, mobile: 0, tablet: 0 };
          sessions.forEach(s => {
            const device = (s.device_type || 'desktop').toLowerCase();
            if (device.includes('mobile') || device.includes('phone')) {
              deviceStats.mobile++;
            } else if (device.includes('tablet') || device.includes('ipad')) {
              deviceStats.tablet++;
            } else {
              deviceStats.desktop++;
            }
          });
          newStats.deviceStats = deviceStats;
          newStats.totalSessions = sessions.length;
        }
      } catch (err) {
        console.warn('Failed to load device stats:', err);
      }

      // 5. Get feature usage stats
      try {
        const { data: featureData } = await queryWithTimeout(() =>
          supabase
            .from('feature_usage')
            .select('feature_name')
            .gte('created_at', thirtyDaysAgo)
            .limit(500)
        );

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
            .slice(0, 5);
        }
      } catch (err) {
        console.warn('Failed to load feature usage:', err);
      }

      // 6. Get recent sessions with page view counts
      try {
        const { data: recentSessions } = await queryWithTimeout(async () => {
          // Get recent sessions
          const sessions = await supabase
            .from('user_sessions')
            .select('session_id, user_id, session_start, last_activity, device_type')
            .order('last_activity', { ascending: false })
            .limit(5);

          // For each session, count page views
          if (sessions.data && sessions.data.length > 0) {
            const sessionsWithCounts = await Promise.all(
              sessions.data.map(async (session) => {
                const { count } = await supabase
                  .from('user_events')
                  .select('*', { count: 'exact', head: true })
                  .eq('session_id', session.session_id)
                  .eq('event_type', 'page_view');
                
                return {
                  ...session,
                  pages_visited: count || 0
                };
              })
            );
            return { data: sessionsWithCounts };
          }
          return sessions;
        });
        
        newStats.recentSessions = recentSessions?.data || [];
      } catch (err) {
        console.warn('Failed to load recent sessions:', err);
      }

      // 7. Get recent errors
      try {
        const { data: recentErrors } = await queryWithTimeout(() =>
          supabase
            .from('error_logs')
            .select('error_type, error_message, page_path, created_at')
            .order('created_at', { ascending: false })
            .limit(5)
        );
        newStats.recentErrors = recentErrors || [];
      } catch (err) {
        console.warn('Failed to load recent errors:', err);
      }

      // 8. Get recent conversions
      try {
        const { data: conversions } = await queryWithTimeout(() =>
          supabase
            .from('conversion_events')
            .select('event_type, source_page, created_at')
            .order('created_at', { ascending: false })
            .limit(5)
        );
        newStats.conversions = conversions || [];
      } catch (err) {
        console.warn('Failed to load conversions:', err);
      }

      // Update state with all collected data
      setStats(newStats);

    } catch (error) {
      console.error('Analytics load error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Format time ago helper
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

  // Show access denied screen if not admin
  if (!isAdmin) {
    return (
      <div className="admin-analytics" style={{ 
        textAlign: 'center', 
        padding: '50px',
        minHeight: '100vh',
        background: '#111827',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>🚫 Access Denied</h1>
        <p style={{ fontSize: '18px', marginTop: '20px', color: '#9ca3af' }}>
          You do not have permission to view this page.
        </p>
        <button 
          onClick={() => navigate('/')} 
          style={{
            marginTop: '30px',
            padding: '12px 24px',
            fontSize: '16px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-analytics">
        <h1>📊 Analytics Dashboard</h1>
        <p>Loading analytics data...</p>
        <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '10px' }}>This may take a few seconds...</p>
      </div>
    );
  }

  return (
    <div className="admin-analytics">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h1 style={{ margin: 0 }}>📊 Analytics Dashboard</h1>
          <span style={{
            display: 'inline-block',
            background: '#22c55e',
            color: 'white',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: 'bold'
          }}>
            👨‍💼 ADMIN
          </span>
        </div>
        <button onClick={loadAnalytics} className="refresh-btn" disabled={loading}>
          🔄 Refresh Data
        </button>
      </div>

      {error && (
        <div style={{ background: '#7f1d1d', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}
      
      {/* Main Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-value">{stats.totalUsers}</p>
          <span className="stat-label">All time</span>
        </div>

        <div className="stat-card">
          <h3>Active Users</h3>
          <p className="stat-value">{stats.activeUsers}</p>
          <span className="stat-label">Last 30 days</span>
        </div>

        <div className="stat-card">
          <h3>New Signups</h3>
          <p className="stat-value">{stats.newSignups}</p>
          <span className="stat-label">Last 7 days</span>
        </div>

        <div className="stat-card">
          <h3>Total Sessions</h3>
          <p className="stat-value">{stats.totalSessions}</p>
          <span className="stat-label">Last 30 days</span>
        </div>
      </div>

      {/* Feature Usage Section */}
      <div style={{ marginTop: '40px' }}>
        <h2 style={{ marginBottom: '20px' }}>🎯 Feature Usage (Top 5)</h2>
        <div className="stats-grid">
          {stats.featureUsage.length > 0 ? (
            stats.featureUsage.map((feature, idx) => (
              <div key={idx} className="stat-card">
                <h3>{feature.name}</h3>
                <p className="stat-value">{feature.count}</p>
                <span className="stat-label">Uses</span>
              </div>
            ))
          ) : (
            <div className="stat-card">
              <p className="stat-label">No feature usage data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Device Stats */}
      <div style={{ marginTop: '40px' }}>
        <h2 style={{ marginBottom: '20px' }}>📱 Device Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>🖥️ Desktop</h3>
            <p className="stat-value">{stats.deviceStats.desktop}</p>
            <span className="stat-label">Sessions</span>
          </div>
          <div className="stat-card">
            <h3>📱 Mobile</h3>
            <p className="stat-value">{stats.deviceStats.mobile}</p>
            <span className="stat-label">Sessions</span>
          </div>
          <div className="stat-card">
            <h3>📲 Tablet</h3>
            <p className="stat-value">{stats.deviceStats.tablet}</p>
            <span className="stat-label">Sessions</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ marginTop: '40px' }}>
        <h2 style={{ marginBottom: '20px' }}>🔥 Recent Activity</h2>
        <div style={{ background: '#1f2937', padding: '20px', borderRadius: '12px' }}>
          {stats.recentSessions.length > 0 ? (
            stats.recentSessions.map((session, idx) => (
              <div key={idx} style={{ 
                padding: '15px', 
                borderBottom: idx < stats.recentSessions.length - 1 ? '1px solid #374151' : 'none'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{session.session_id ? session.session_id.substring(0, 20) + '...' : 'Unknown'}</strong>
                    <span style={{ marginLeft: '10px', color: '#9ca3af' }}>
                      | {session.device_type || 'Desktop'}
                    </span>
                  </div>
                  <span style={{ color: '#9ca3af' }}>{timeAgo(session.last_activity)}</span>
                </div>
                <div style={{ marginTop: '5px', color: '#9ca3af', fontSize: '14px' }}>
                  User: {session.user_id ? session.user_id.substring(0, 8) + '...' : 'Anonymous'} | Pages: {session.pages_visited || 0}
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#9ca3af' }}>No recent sessions</p>
          )}
        </div>
      </div>

      {/* Recent Errors */}
      {stats.recentErrors.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ marginBottom: '20px' }}>⚠️ Recent Errors</h2>
          <div style={{ background: '#1f2937', padding: '20px', borderRadius: '12px' }}>
            {stats.recentErrors.map((error, idx) => (
              <div key={idx} style={{ 
                padding: '15px', 
                borderBottom: idx < stats.recentErrors.length - 1 ? '1px solid #374151' : 'none'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: '#ef4444' }}>{error.error_type || 'Unknown Error'}</strong>
                    <div style={{ marginTop: '5px', color: '#9ca3af', fontSize: '14px' }}>
                      {error.error_message || 'No message'}
                    </div>
                    <div style={{ marginTop: '3px', color: '#6b7280', fontSize: '12px' }}>
                      Page: {error.page_path || 'Unknown'}
                    </div>
                  </div>
                  <span style={{ color: '#9ca3af', fontSize: '14px' }}>{timeAgo(error.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Conversions */}
      {stats.conversions.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ marginBottom: '20px' }}>🎉 Recent Conversions</h2>
          <div style={{ background: '#1f2937', padding: '20px', borderRadius: '12px' }}>
            {stats.conversions.map((conversion, idx) => (
              <div key={idx} style={{ 
                padding: '15px', 
                borderBottom: idx < stats.conversions.length - 1 ? '1px solid #374151' : 'none'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: '#22c55e' }}>{conversion.event_type || 'Unknown'}</strong>
                    <div style={{ marginTop: '5px', color: '#9ca3af', fontSize: '14px' }}>
                      Source: {conversion.source_page || 'Unknown'}
                    </div>
                  </div>
                  <span style={{ color: '#9ca3af', fontSize: '14px' }}>{timeAgo(conversion.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAnalytics;
