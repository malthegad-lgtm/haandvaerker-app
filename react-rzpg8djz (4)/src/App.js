import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import OnboardingPage from './pages/auth/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import JobsPage from './pages/JobsPage';
import CustomersPage from './pages/CustomersPage';
import EmployeesPage from './pages/EmployeesPage';
import InvoicesPage from './pages/InvoicesPage';
import QuotesPage from './pages/QuotesPage';
import CalendarPage from './pages/CalendarPage';
import SettingsPage from './pages/SettingsPage';

function Splash() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-3xl font-extrabold text-white mb-3">
          Håndværker<span className="text-blue-400">Pro</span>
        </div>
        <div className="flex justify-center gap-1">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function RequireAuth({ children }) {
  const { session, loading } = useAuth();
  if (loading) return <Splash />;
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

function RequireCompany({ children }) {
  const { profile, company, loading } = useAuth();
  if (loading) return <Splash />;
  // No company linked yet → create one
  if (profile && !profile.company_id) return <Navigate to="/onboarding" replace />;
  // Company exists but onboarding not completed → finish wizard
  if (company && company.onboarding_completed === false) return <Navigate to="/onboarding" replace />;
  return children;
}

function PublicOnly({ children }) {
  const { session, profile, company, loading } = useAuth();
  if (loading) return <Splash />;
  if (session) {
    if (!profile?.company_id) return <Navigate to="/onboarding" replace />;
    if (company && company.onboarding_completed === false) return <Navigate to="/onboarding" replace />;
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
      <Route path="/signup" element={<PublicOnly><SignupPage /></PublicOnly>} />
      <Route path="/onboarding" element={<RequireAuth><OnboardingPage /></RequireAuth>} />
      <Route path="/*" element={
        <RequireAuth>
          <RequireCompany>
            <Layout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/employees" element={<EmployeesPage />} />
                <Route path="/invoices" element={<InvoicesPage />} />
                <Route path="/quotes" element={<QuotesPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </RequireCompany>
        </RequireAuth>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
