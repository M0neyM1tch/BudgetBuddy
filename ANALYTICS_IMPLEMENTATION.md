# 📊 BudgetBuddy Analytics Implementation Guide

## Overview

This document outlines the complete analytics tracking system for BudgetBuddy, including database schema, tracking utilities, and implementation instructions.

---

## ✅ Database Setup Complete

The following tables have been created in Supabase:

### 1. **user_events**
Tracks all user interactions and events
- Page views
- Feature usage
- Button clicks
- Form submissions

### 2. **user_sessions**
Tracks user session data
- Session duration
- Entry/exit pages
- Device information
- Activity timestamps

### 3. **daily_stats**
Aggregated daily metrics
- Total/active users
- New signups
- Feature usage counts
- Conversion rates

### 4. **feature_usage**
Detailed feature usage tracking
- Feature name
- Action type
- Duration
- Custom metadata

### 5. **conversion_events**
Conversion funnel tracking
- Landing page views
- Signup clicks
- Upgrade clicks
- Affiliate clicks

### 6. **performance_metrics**
Technical performance monitoring
- Page load times
- API response times
- Device/browser breakdown

### 7. **error_logs**
Error tracking and debugging
- JavaScript errors
- Promise rejections
- Stack traces
- Context information

---

## 🔧 Analytics Utility Functions

The updated `src/utils/analytics.js` provides:

### Session Management
```javascript
import { initializeSession, endSession } from './utils/analytics';

// Start tracking on app mount
useEffect(() => {
  if (user) {
    initializeSession(user.id);
  }
  return () => {
    if (user) {
      endSession(user.id);
    }
  };
}, [user]);
```

### Event Tracking
```javascript
import { trackPageView, trackFeature, trackConversion } from './utils/analytics';

// Track page/tab changes
trackPageView(user.id, 'dashboard');

// Track feature usage
trackFeature(user.id, 'transactions', 'add', {
  category: 'Income',
  amount_range: '100-500'
});

// Track conversions
trackConversion('signup_click', 'landing_page');
```

### Performance Monitoring
```javascript
import { trackPageLoadPerformance, setupGlobalErrorTracking } from './utils/analytics';

// Track page load performance
trackPageLoadPerformance();

// Setup automatic error tracking
setupGlobalErrorTracking(user?.id);
```

---

## 📝 Implementation Checklist

### Phase 1: Core Tracking (Priority)
- [ ] Add session tracking to BudgetBuddy.jsx
- [ ] Track page/tab navigation
- [ ] Track transaction CRUD operations
- [ ] Track goal CRUD operations
- [ ] Track calculator usage
- [ ] Add performance monitoring
- [ ] Add error tracking

### Phase 2: Conversion Tracking
- [ ] Track landing page views
- [ ] Track signup button clicks
- [ ] Track upgrade modal interactions
- [ ] Track affiliate link clicks
- [ ] Track CSV import attempts/success

### Phase 3: Admin Dashboard
- [ ] Update AdminAnalytics.jsx with new metrics
- [ ] Add user growth charts
- [ ] Add feature usage breakdown
- [ ] Add session analytics
- [ ] Add conversion funnel
- [ ] Add performance metrics display
- [ ] Add error log viewer
- [ ] Add date range filtering
- [ ] Add CSV export functionality

---

## 🎯 Metrics to Track

### User Metrics
- Total registered users
- Daily/Weekly/Monthly Active Users (DAU/WAU/MAU)
- New signups per day/week/month
- User retention rate (7-day, 30-day)
- Average session duration
- Sessions per user

### Feature Usage
- Most used tabs (Dashboard, Transactions, Analytics, etc.)
- Transactions created (total, by category)
- Goals created vs completed
- Calculator uses (Freedom, Mortgage)
- CSV imports (attempted vs successful)
- Recurring transactions set up
- Time spent per feature

### Engagement Metrics
- Login frequency
- Last active date
- Feature adoption rate (% using each tab)
- Drop-off points
- Modal interactions

### Technical Metrics
- Page load times
- API response times
- Error rates
- Browser/device breakdown
- Mobile vs desktop usage

### Conversion Metrics
- Landing page → Signup conversion
- Free → Premium upgrade rate
- Affiliate link clicks
- CTA button clicks

---

## 🔒 Security & Privacy

### Row Level Security (RLS)
All analytics tables have RLS policies:
- Only admin email (zzmitchellzz@outlook.com) can read analytics
- Users can only insert their own events
- Anonymous users can track conversions and performance

### Privacy Compliance
1. **No PII Storage**: Transaction amounts stored as ranges, not exact values
2. **IP Hashing**: IP addresses are hashed before storage
3. **Opt-out Support**: Users can disable tracking in settings (to be implemented)
4. **Data Retention**: Auto-delete data older than 2 years (to be implemented)

### Amount Ranges
Instead of storing exact amounts, we use ranges:
```javascript
import { getAmountRange } from './utils/analytics';

const range = getAmountRange(250); // Returns '100-500'
```

Ranges:
- 0-10
- 10-50
- 50-100
- 100-500
- 500-1000
- 1000+

---

## 📊 Query Examples for Admin Dashboard

### Total Users
```javascript
const { count: totalUsers } = await supabase
  .from('auth.users')
  .select('*', { count: 'exact', head: true });
```

### Active Users Today
```javascript
const today = new Date().toISOString().split('T')[0];
const { data: activeSessions } = await supabase
  .from('user_sessions')
  .select('user_id')
  .gte('session_start', today);

const activeToday = new Set(activeSessions?.map(s => s.user_id)).size;
```

### Feature Usage Breakdown
```javascript
const { data: featureData } = await supabase
  .from('feature_usage')
  .select('feature_name')
  .gte('created_at', weekAgo);

const featureCounts = featureData.reduce((acc, f) => {
  acc[f.feature_name] = (acc[f.feature_name] || 0) + 1;
  return acc;
}, {});
```

### Conversion Rate
```javascript
const { count: landingViews } = await supabase
  .from('conversion_events')
  .select('*', { count: 'exact', head: true })
  .eq('event_type', 'landing_view');

const { count: signupClicks } = await supabase
  .from('conversion_events')
  .select('*', { count: 'exact', head: true })
  .eq('event_type', 'signup_click');

const conversionRate = landingViews > 0 
  ? (signupClicks / landingViews * 100).toFixed(2) 
  : 0;
```

### Average Session Duration
```javascript
const { data: sessions } = await supabase
  .from('user_sessions')
  .select('session_start, session_end, last_activity')
  .not('session_end', 'is', null);

const avgDuration = sessions.reduce((sum, s) => {
  const start = new Date(s.session_start);
  const end = new Date(s.session_end || s.last_activity);
  return sum + (end - start);
}, 0) / sessions.length / 1000; // Convert to seconds
```

---

## 🚀 Next Steps

### 1. Integrate Tracking in Components

Update the following files:

#### **BudgetBuddy.jsx**
```javascript
import { 
  initializeSession, 
  endSession, 
  trackPageView,
  trackPageLoadPerformance,
  setupGlobalErrorTracking 
} from '../../utils/analytics';

// In component:
useEffect(() => {
  if (user) {
    initializeSession(user.id);
    setupGlobalErrorTracking(user.id);
  }
  trackPageLoadPerformance();
  
  return () => {
    if (user) endSession(user.id);
  };
}, [user]);

useEffect(() => {
  if (user) {
    trackPageView(user.id, activeTab);
  }
}, [activeTab, user]);
```

#### **Transactions.jsx**
```javascript
import { trackFeature, getAmountRange } from '../../utils/analytics';

const handleAddTransaction = async (formData) => {
  // ... existing code ...
  
  await trackFeature(user.id, 'transactions', 'add', {
    category: formData.category,
    is_recurring: formData.isRecurring || false,
    amount_range: getAmountRange(Math.abs(formData.amount))
  });
};

const handleDeleteTransaction = async (id) => {
  // ... existing code ...
  await trackFeature(user.id, 'transactions', 'delete');
};
```

#### **Goals.jsx**
```javascript
import { trackFeature, getAmountRange } from '../../utils/analytics';

const handleAddGoal = async (goalData) => {
  // ... existing code ...
  await trackFeature(user.id, 'goals', 'create', {
    target_amount_range: getAmountRange(goalData.targetamount),
    has_deadline: !!goalData.deadline
  });
};
```

#### **Calculator.jsx**
```javascript
import { trackFeature, getAmountRange } from '../../utils/analytics';

const handleCalculate = (calculatorType, params) => {
  trackFeature(user?.id, 'calculator', calculatorType, params);
};
```

### 2. Update Admin Dashboard

Replace the current AdminAnalytics.jsx with comprehensive metrics:
- User growth chart (daily/weekly/monthly)
- Feature usage pie chart
- Session analytics table
- Conversion funnel visualization
- Performance metrics (avg load time, errors)
- Recent activity log
- Device/browser breakdown

### 3. Add AuthContext Admin Check

Update `src/contexts/AuthContext.jsx`:
```javascript
const [isAdmin, setIsAdmin] = useState(false);

useEffect(() => {
  if (user?.email === 'zzmitchellzz@outlook.com') {
    setIsAdmin(true);
  } else {
    setIsAdmin(false);
  }
}, [user]);

return (
  <AuthContext.Provider value={{ user, isAdmin, login, logout }}>
    {children}
  </AuthContext.Provider>
);
```

### 4. Protect Admin Route

In `App.jsx`:
```javascript
import { useAuth } from './contexts/AuthContext';
import AdminAnalytics from './admin/AdminAnalytics';

function App() {
  const { user, isAdmin } = useAuth();
  
  return (
    <Routes>
      <Route 
        path="/admin" 
        element={
          user && isAdmin 
            ? <AdminAnalytics /> 
            : <Navigate to="/" replace />
        } 
      />
    </Routes>
  );
}
```

---

## 🧪 Testing

### Test Scenarios

1. **Session Tracking**
   - Login → Check user_sessions table
   - Navigate between tabs → Verify last_activity updates
   - Logout → Verify session_end is set

2. **Event Tracking**
   - Add transaction → Check user_events and feature_usage
   - Create goal → Verify event logged
   - Use calculator → Verify tracking

3. **Performance Tracking**
   - Load page → Check performance_metrics for load time
   - Trigger error → Check error_logs

4. **Admin Dashboard**
   - Login as admin → Access /admin
   - Verify all metrics display
   - Test date range filtering
   - Export data to CSV

5. **Security**
   - Login as non-admin → Try accessing /admin (should redirect)
   - Check RLS policies in Supabase

---

## 📚 Additional Resources

- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Web Performance APIs](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [GDPR Compliance](https://gdpr.eu/compliance/)

---

## 🐛 Troubleshooting

### Events Not Logging
- Check browser console for errors
- Verify Supabase connection
- Check RLS policies allow insertion
- Ensure user is authenticated (for user_events)

### Admin Dashboard Not Loading
- Verify admin email in AuthContext
- Check RLS policy allows admin reads
- Verify admin route protection in App.jsx

### Performance Impact
- Analytics runs asynchronously (non-blocking)
- Failed tracking attempts are caught and logged
- Session updates are debounced (5 seconds)

---

## ✅ Completion Checklist

- [x] Database schema created
- [x] Analytics utility implemented
- [x] Documentation written
- [ ] Tracking integrated in components
- [ ] Admin dashboard updated
- [ ] Admin authentication added
- [ ] Route protection implemented
- [ ] Testing completed
- [ ] Deployed to production

---

**Last Updated:** February 3, 2026  
**Version:** 1.0.0  
**Maintainer:** Mitchell (zzmitchellzz@outlook.com)
