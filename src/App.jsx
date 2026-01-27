import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import BudgetBuddy from './components/BudgetBuddy/BudgetBuddy';
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
        <Route path="/" element={<BudgetBuddy />} />  {/* ⬅️ ONLY THIS LINE CHANGED */}
        <Route path="/login" element={!user ? <Auth /> : <Navigate to="/" />} />
        <Route path="/reset-password" element={<ResetPassword />} />
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
