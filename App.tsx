
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import LoginPage from './pages/Auth';
import RegisterPage from './pages/Register';
import HomePage from './pages/Home';
import JoinExpert from './pages/JoinExpert';
import ClientPortal from './pages/client/ClientDashboard';
import ClientRequests from './pages/client/ClientRequests';
import ClientPayments from './pages/client/ClientPayments';
import PaymentPage from './pages/client/PaymentPage';
import ClientSettings from './pages/client/ClientSettings';
import ClientServices from './pages/client/ClientServices';
import BrowseExperts from './pages/client/BrowseExperts';
import ExpertPortal from './pages/expert/ExpertDashboard';
import ExpertTasks from './pages/expert/ExpertTasks';
import ExpertEarnings from './pages/expert/ExpertEarnings';
import ExpertProfile from './pages/expert/ExpertProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminClients from './pages/admin/AdminClients';
import AdminExperts from './pages/admin/AdminExperts';
import AdminRequests from './pages/admin/AdminRequests';
import AdminFinancials from './pages/admin/AdminFinancials';
import AdminProfiles from './pages/admin/AdminProfiles';
import AdminServices from './pages/admin/AdminServices';
import Layout from './components/Layout';
import PublicLayout from './components/PublicLayout';
import WhatsAppButton from './components/WhatsAppButton';
import UnifiedChat from './components/UnifiedChat';
import {
  ServicesPage, PricingPage, QAPage, AboutPage, CareersPage,
  ContactPage, PrivacyPage, TermsPage, CompliancePage
} from './pages/PublicPages';

const ProtectedRoute = ({ children, allowedRoles }: { children?: React.ReactNode, allowedRoles: string[] }) => {
  const { user } = useAppContext();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'CLIENT') return <Navigate to="/client" replace />;
    if (user.role === 'EXPERT') return <Navigate to="/expert" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  return (
    <>
      <Routes>
        {/* Public Routes Wrapped in PublicLayout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/join-expert" element={<JoinExpert />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/experts" element={<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"><BrowseExperts /></div>} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/qa" element={<QAPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/compliance" element={<CompliancePage />} />
        </Route>

        {/* Auth Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Client Routes */}
        <Route path="/client" element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <Layout title="Client Portal">
              <ClientPortal />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/client/experts" element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <Layout title="Browse Experts">
              <BrowseExperts />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/client/requests" element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <Layout title="My Requests">
              <ClientRequests />
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
            <Layout title="Services & Pricing">
              <ClientServices />
            </Layout>
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

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Layout title="Admin Overview">
              <AdminDashboard />
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Floating Action Buttons */}
      <UnifiedChat />
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
