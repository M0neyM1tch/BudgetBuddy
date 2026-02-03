import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import BudgetBuddy from './components/BudgetBuddy/BudgetBuddy';
import LandingPage from './components/LandingPage/LandingPage';
import Auth from './components/Auth/Auth';
import AdminAnalytics from './admin/AdminAnalytics';
import PrivacyPolicy from './components/Legal/PrivacyPolicy';
import TermsOfService from './components/Legal/TermsofService';
import CookieConsent from './components/Legal/CookieConsent';
import ResetPassword from './components/ResetPassword/ResetPassword';


function App() {
  const { user, loading } = useAuth();


  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        color: 'white',
        fontSize: '24px'
      }}>
        Loading...
      </div>
    );
  }


  return (
    <>
      <Routes>
        {/* Root route: Landing page for logged-out, Dashboard for logged-in */}
        <Route 
          path="/" 
          element={user ? <Navigate to="/dashboard" /> : <LandingPage />} 
        />
        
        {/* Dashboard route - requires authentication */}
        <Route 
          path="/dashboard" 
          element={user ? <BudgetBuddy /> : <Navigate to="/login" />} 
        />
        
        {/* Auth routes */}
        <Route path="/login" element={!user ? <Auth /> : <Navigate to="/dashboard" />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Admin route */}
        <Route path="/admin" element={user ? <AdminAnalytics /> : <Navigate to="/login" />} />
        
        {/* Legal Pages - Accessible to everyone */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
      </Routes>


      {/* Cookie Consent Banner - Shows on all pages */}
      <CookieConsent />
    </>
  );
}


export default App;
