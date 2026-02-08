
import React from 'react';
import './i18n';
import Meetings from './pages/shared/Meetings';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import LoginPage from './pages/Auth';
import ResetPasswordPage from './pages/auth/ResetPassword';
import RegisterPage from './pages/Register';
import HomePage from './pages/Home';
import JoinExpert from './pages/JoinExpert';
import ClientPortal from './pages/client/ClientDashboard';
import ClientRequests from './pages/client/ClientRequests';
import RequestReceived from './pages/client/RequestReceived';
import RequestInitiator from './pages/client/RequestInitiator';
import ClientPayments from './pages/client/ClientPayments';
import PaymentPage from './pages/client/PaymentPage';
import ClientSettings from './pages/client/ClientSettings';
import ClientServices from './pages/client/ClientServices';
import BrowseExperts from './pages/client/BrowseExperts';
import ExpertPortal from './pages/expert/ExpertDashboard';
import ExpertOnboarding from './pages/expert/ExpertOnboarding';
import ExpertTasks from './pages/expert/ExpertTasks';
import ExpertEarnings from './pages/expert/ExpertEarnings';
import ExpertProfile from './pages/expert/ExpertProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminClients from './pages/admin/AdminClients';
import AdminExperts from './pages/admin/AdminExperts';
import AdminRequests from './pages/admin/AdminRequests';
import AdminFinancials from './pages/admin/AdminFinancials';
import AdminSitePages from './pages/admin/AdminSitePages';
import AdminSettings from './pages/admin/AdminSettings'; // New
import AdminProfiles from './pages/admin/AdminProfiles';
import AdminServices from './pages/admin/AdminServices';
import Layout from './components/Layout';
import PublicLayout from './components/PublicLayout';
import WhatsAppButton from './components/WhatsAppButton';
import InstallAppButton from './components/InstallAppButton';
import UnifiedChat from './components/UnifiedChat';
import {
  ServicesPage, PricingPage, QAPage, AboutPage, CareersPage,
  ContactPage, PrivacyPage, TermsPage, CompliancePage
} from './pages/PublicPages';

const ProtectedRoute = ({ children, allowedRoles }: { children?: React.ReactNode, allowedRoles: string[] }) => {
  const { user, isRestoringSession } = useAppContext();

  if (isRestoringSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'CLIENT') return <Navigate to="/client" replace />;
    if (user.role === 'EXPERT') return <Navigate to="/expert" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    return <Navigate to="/login" replace />;
  }

  // Force Expert Onboarding
  if (user.role === 'EXPERT' && !allowedRoles.includes('ONBOARDING_ONLY')) {
    const isProfileComplete = user.mobileNumber && user.specializations && user.specializations.length > 0 && (user as any).hourlyRate > 0;
    if (!isProfileComplete) {
      return <Navigate to="/expert/onboarding" replace />;
    }
  }

  return <>{children}</>;
};

const VisibilityGuard = ({ children, pageKey, type = 'public' }: { children: React.ReactNode, pageKey: string, type?: 'public' | 'client' }) => {
  const { settings } = useAppContext();

  // If settings not loaded yet, maybe render nothing or children? 
  // Ideally children to avoid flicker, but redirect if strictly hidden.
  // Since update is async, let's assume default true if not set.
  if (!settings?.pageVisibility && pageKey !== 'careers' && pageKey !== 'experts' && pageKey !== 'services') return <>{children}</>;

  try {
    // Logic for Master Switches
    if (pageKey === 'careers' && settings?.careersEnabled === false) return <Navigate to="/" replace />;

    // Check Explicit Toggles from Admin Settings
    // NOTE: Commenting out strict check because DB might have false while user expects true.
    // Ideally this should sync with PublicLayout visibility.
    /*
    if (pageKey === 'experts' && settings?.showExpertsPage === false) {
       const redirect = type === 'client' ? '/client' : '/';
       return <Navigate to={redirect} replace />;
    }
    if (pageKey === 'services' && settings?.showServicesPage === false) {
       const redirect = type === 'client' ? '/client' : '/';
       return <Navigate to={redirect} replace />;
    }
    */

    const vis = settings?.pageVisibility ? JSON.parse(settings.pageVisibility) : {};
    const isVisible = vis[pageKey.toLowerCase()]?.[type] !== false;

    if (!isVisible) {
      // Redirect Client to Dashboard, Public to Home
      const redirect = type === 'client' ? '/client' : '/';
      return <Navigate to={redirect} replace />;
    }

    return <>{children}</>;
  } catch (e) {
    return <>{children}</>;
  }
};

const AppContent = () => {
  // Handle LinkedIn Callback Redirect (Browser URL -> Hash URL)
  React.useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code && state?.startsWith('linkedin_auth')) {
      // Redirect to Hash URL so HashRouter can handle it
      // Construct: /#/login?code=...&state=...
      const newUrl = `${window.location.origin}/#/login${window.location.search}`;
      window.location.replace(newUrl);
    }
  }, []);

  return (
    <>
      <Routes>
        {/* Public Routes Wrapped in PublicLayout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/join-expert" element={<JoinExpert />} />
          <Route path="/services" element={<VisibilityGuard pageKey="services"><ServicesPage /></VisibilityGuard>} />
          <Route path="/experts" element={<VisibilityGuard pageKey="experts"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"><BrowseExperts /></div></VisibilityGuard>} />
          <Route path="/pricing" element={<VisibilityGuard pageKey="pricing"><PricingPage /></VisibilityGuard>} />
          <Route path="/qa" element={<QAPage />} />
          <Route path="/about" element={<VisibilityGuard pageKey="about"><AboutPage /></VisibilityGuard>} />
          <Route path="/careers" element={<VisibilityGuard pageKey="careers"><CareersPage /></VisibilityGuard>} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/compliance" element={<CompliancePage />} />
        </Route>

        {/* Auth Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Client Routes */}
        <Route path="/client" element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <Layout title="Client Portal">
              <ClientPortal />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/client/meetings" element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <Layout title="Meetings">
              <Meetings />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/client/experts" element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <VisibilityGuard pageKey="experts" type="client">
              <Layout title="Browse Experts">
                <BrowseExperts />
              </Layout>
            </VisibilityGuard>
          </ProtectedRoute>
        } />
        <Route path="/client/requests" element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <Layout title="My Requests">
              <ClientRequests />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/client/request-received/:id" element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <Layout title="Request Received">
              <RequestReceived />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/client/initiate-request" element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <Layout title="Processing Request...">
              <RequestInitiator />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/client/payments" element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <Layout title="Payments & Invoices">
              <ClientPayments />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/client/checkout" element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <Layout title="Secure Checkout">
              <PaymentPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/client/settings" element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <Layout title="Settings">
              <ClientSettings />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/client/services" element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <VisibilityGuard pageKey="services" type="client">
              <Layout title="Services & Pricing">
                <ClientServices />
              </Layout>
            </VisibilityGuard>
          </ProtectedRoute>
        } />

        {/* Expert Routes */}
        <Route path="/expert" element={
          <ProtectedRoute allowedRoles={['EXPERT']}>
            <Layout title="Expert Portal">
              <ExpertPortal />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/expert/meetings" element={
          <ProtectedRoute allowedRoles={['EXPERT']}>
            <Layout title="Meetings">
              <Meetings />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/expert/tasks" element={
          <ProtectedRoute allowedRoles={['EXPERT']}>
            <Layout title="My Tasks">
              <ExpertTasks />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/expert/earnings" element={
          <ProtectedRoute allowedRoles={['EXPERT']}>
            <Layout title="Earnings">
              <ExpertEarnings />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/expert/profile" element={
          <ProtectedRoute allowedRoles={['EXPERT']}>
            <Layout title="Profile">
              <ExpertProfile />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/expert/onboarding" element={
          <ProtectedRoute allowedRoles={['EXPERT', 'ONBOARDING_ONLY']}>
            <ExpertOnboarding />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout title="Admin Overview">
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/calendar" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout title="Global Calendar">
              <Meetings />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/clients" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout title="Manage Clients">
              <AdminClients />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/experts" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout title="Manage Experts">
              <AdminExperts />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/requests" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout title="All Requests">
              <AdminRequests />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/services" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout title="Services & Pricing">
              <AdminServices />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/pages" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout title="Site Pages Manager">
              <AdminSitePages />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/financials" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout title="Financial Reports">
              <AdminFinancials />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/profiles" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout title="Admin Profiles">
              <AdminProfiles />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout title="Admin Settings">
              <AdminSettings />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Floating Action Buttons */}
      <UnifiedChat />
      <InstallAppButton />
      <WhatsAppButton />
    </>
  );
};

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </HashRouter>
  );
}
