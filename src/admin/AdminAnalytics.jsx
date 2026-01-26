import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AdminAnalytics.css';

function AdminAnalytics() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSessions: 0,
    conversionRate: 0,
    popularFeature: '',
    todayViews: 0,
    signupClicks: 0
  });
  const [loading, setLoading] = useState(true);

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

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Get all analytics data
      const { data: allEvents, error } = await supabase
        .from('public_demo_analytics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!allEvents || allEvents.length === 0) {
        setStats({
          totalSessions: 0,
          conversionRate: 0,
          popularFeature: 'No data yet',
          todayViews: 0,
          signupClicks: 0
        });
        setLoading(false);
        return;
      }

      // Calculate unique sessions
      const uniqueSessions = new Set(allEvents.map(e => e.session_id)).size;

      // Count signup clicks
      const signupClicks = allEvents.filter(e => e.action_type === 'signup_click').length;

      // Calculate conversion rate
      const conversionRate = uniqueSessions > 0 
        ? ((signupClicks / uniqueSessions) * 100).toFixed(2)
        : 0;

      // Find most popular feature
      const featureCounts = allEvents
        .filter(e => e.action_type === 'view')
        .reduce((acc, { feature_used }) => {
          acc[feature_used] = (acc[feature_used] || 0) + 1;
          return acc;
        }, {});

      const popularFeature = Object.keys(featureCounts).length > 0
        ? Object.keys(featureCounts).sort((a, b) => featureCounts[b] - featureCounts[a])[0]
        : 'No data yet';

      // Count today's views
      const today = new Date().toISOString().split('T')[0];
      const todayViews = allEvents.filter(e => 
        e.created_at.startsWith(today) && e.action_type === 'view'
      ).length;

      setStats({
        totalSessions: uniqueSessions,
        conversionRate,
        popularFeature,
        todayViews,
        signupClicks
      });
    } catch (error) {
      console.error('Analytics load error:', error);
      alert('Failed to load analytics: ' + error.message);
    } finally {
      setLoading(false);
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
        <h1>📊 Public Demo Analytics</h1>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="admin-analytics">
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <h1 style={{ margin: 0 }}>📊 Public Demo Analytics</h1>
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
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Sessions</h3>
          <p className="stat-value">{stats.totalSessions}</p>
          <span className="stat-label">Unique visitors</span>
        </div>

        <div className="stat-card">
          <h3>Conversion Rate</h3>
          <p className="stat-value">{stats.conversionRate}%</p>
          <span className="stat-label">Demo → Signup clicks</span>
        </div>

        <div className="stat-card">
          <h3>Most Popular</h3>
          <p className="stat-value-feature">{stats.popularFeature}</p>
          <span className="stat-label">Top demo feature</span>
        </div>

        <div className="stat-card">
          <h3>Today's Views</h3>
          <p className="stat-value">{stats.todayViews}</p>
          <span className="stat-label">Feature views today</span>
        </div>

        <div className="stat-card">
          <h3>Signup Intent</h3>
          <p className="stat-value">{stats.signupClicks}</p>
          <span className="stat-label">Total signup clicks</span>
        </div>
      </div>

      <button onClick={loadAnalytics} className="refresh-btn">
        🔄 Refresh Data
      </button>
    </div>
  );
}

export default AdminAnalytics;
