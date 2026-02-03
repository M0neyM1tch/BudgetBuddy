-- ==========================================
-- BudgetBuddy Analytics Database Schema
-- Run this in Supabase SQL Editor
-- ==========================================

-- TABLE 1: User Events (Granular Tracking)
-- ==========================================
CREATE TABLE IF NOT EXISTS user_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_category TEXT,
  event_action TEXT,
  event_label TEXT,
  event_value NUMERIC,
  page_path TEXT,
  referrer TEXT,
  metadata JSONB,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  screen_resolution TEXT,
  ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_events_user_id ON user_events(user_id);
CREATE INDEX idx_user_events_event_type ON user_events(event_type);
CREATE INDEX idx_user_events_session_id ON user_events(session_id);
CREATE INDEX idx_user_events_created_at ON user_events(created_at);

ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read access" ON user_events
  FOR SELECT USING (
    auth.jwt() ->> 'email' = 'zzmitchellzz@outlook.com'
  );

CREATE POLICY "Users can insert own events" ON user_events
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );


-- ==========================================
-- TABLE 2: User Sessions
-- ==========================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT UNIQUE NOT NULL,
  session_start TIMESTAMPTZ NOT NULL,
  session_end TIMESTAMPTZ,
  last_activity TIMESTAMPTZ,
  pages_visited INT DEFAULT 0,
  features_used TEXT[] DEFAULT '{}',
  entry_page TEXT,
  exit_page TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_start ON user_sessions(session_start);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read sessions" ON user_sessions
  FOR SELECT USING (
    auth.jwt() ->> 'email' = 'zzmitchellzz@outlook.com'
  );

CREATE POLICY "Users insert own sessions" ON user_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own sessions" ON user_sessions
  FOR UPDATE USING (auth.uid() = user_id);


-- ==========================================
-- TABLE 3: Daily Aggregated Stats
-- ==========================================
CREATE TABLE IF NOT EXISTS daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  total_users INT DEFAULT 0,
  active_users INT DEFAULT 0,
  new_signups INT DEFAULT 0,
  returning_users INT DEFAULT 0,
  total_sessions INT DEFAULT 0,
  avg_session_duration_seconds INT DEFAULT 0,
  total_transactions_created INT DEFAULT 0,
  total_goals_created INT DEFAULT 0,
  total_goals_completed INT DEFAULT 0,
  calculator_uses INT DEFAULT 0,
  csv_imports_attempted INT DEFAULT 0,
  csv_imports_successful INT DEFAULT 0,
  landing_page_views INT DEFAULT 0,
  signup_conversions INT DEFAULT 0,
  conversion_rate NUMERIC(5,2) DEFAULT 0,
  bounce_rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_daily_stats_date ON daily_stats(date);

ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read daily_stats" ON daily_stats
  FOR ALL USING (
    auth.jwt() ->> 'email' = 'zzmitchellzz@outlook.com'
  );


-- ==========================================
-- TABLE 4: Feature Usage Stats
-- ==========================================
CREATE TABLE IF NOT EXISTS feature_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_name TEXT NOT NULL,
  action_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  duration_seconds INT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feature_usage_feature ON feature_usage(feature_name);
CREATE INDEX idx_feature_usage_user ON feature_usage(user_id);
CREATE INDEX idx_feature_usage_created ON feature_usage(created_at);

ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read feature_usage" ON feature_usage
  FOR SELECT USING (
    auth.jwt() ->> 'email' = 'zzmitchellzz@outlook.com'
  );

CREATE POLICY "Users insert feature_usage" ON feature_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ==========================================
-- TABLE 5: Conversion Events
-- ==========================================
CREATE TABLE IF NOT EXISTS conversion_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  source_page TEXT,
  conversion_value NUMERIC,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversion_events_type ON conversion_events(event_type);
CREATE INDEX idx_conversion_events_session ON conversion_events(session_id);
CREATE INDEX idx_conversion_events_created ON conversion_events(created_at);

ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read conversions" ON conversion_events
  FOR ALL USING (
    auth.jwt() ->> 'email' = 'zzmitchellzz@outlook.com'
  );

CREATE POLICY "Anyone can insert conversions" ON conversion_events
  FOR INSERT WITH CHECK (true);


-- ==========================================
-- TABLE 6: Performance Metrics
-- ==========================================
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  page_path TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  browser TEXT,
  device_type TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_performance_page ON performance_metrics(page_path);
CREATE INDEX idx_performance_type ON performance_metrics(metric_type);
CREATE INDEX idx_performance_created ON performance_metrics(created_at);

ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read performance" ON performance_metrics
  FOR ALL USING (
    auth.jwt() ->> 'email' = 'zzmitchellzz@outlook.com'
  );

CREATE POLICY "Anyone insert performance" ON performance_metrics
  FOR INSERT WITH CHECK (true);


-- ==========================================
-- TABLE 7: Error Logs
-- ==========================================
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  error_type TEXT NOT NULL,
  error_message TEXT,
  stack_trace TEXT,
  page_path TEXT,
  browser TEXT,
  device_type TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_error_logs_type ON error_logs(error_type);
CREATE INDEX idx_error_logs_created ON error_logs(created_at);

ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read errors" ON error_logs
  FOR ALL USING (
    auth.jwt() ->> 'email' = 'zzmitchellzz@outlook.com'
  );

CREATE POLICY "Anyone insert errors" ON error_logs
  FOR INSERT WITH CHECK (true);


-- ==========================================
-- HELPFUL QUERIES FOR TESTING
-- ==========================================

-- View all tables
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%event%' OR table_name LIKE '%session%' OR table_name LIKE '%stats%';

-- Count records in each table
-- SELECT 'user_events' as table_name, COUNT(*) as count FROM user_events
-- UNION ALL
-- SELECT 'user_sessions', COUNT(*) FROM user_sessions
-- UNION ALL
-- SELECT 'feature_usage', COUNT(*) FROM feature_usage
-- UNION ALL
-- SELECT 'conversion_events', COUNT(*) FROM conversion_events
-- UNION ALL
-- SELECT 'performance_metrics', COUNT(*) FROM performance_metrics
-- UNION ALL
-- SELECT 'error_logs', COUNT(*) FROM error_logs;

-- View recent events
-- SELECT * FROM user_events ORDER BY created_at DESC LIMIT 10;

-- View active sessions
-- SELECT * FROM user_sessions WHERE session_end IS NULL ORDER BY last_activity DESC;
