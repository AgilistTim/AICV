import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { CVProvider } from '@/context/CVContext';
import Layout from '@/components/Layout';
import LandingPage from '@/pages/LandingPage';
import CandidatePage from '@/pages/CandidatePage';
import RecruiterPage from '@/pages/RecruiterPage';
import ShareProfilePage from '@/pages/ShareProfilePage';
import LoginPage from '@/pages/LoginPage';
import PendingApprovalPage from '@/pages/PendingApprovalPage';
import AccessRequestPage from '@/pages/AccessRequestPage';
import ProtectedRoute from '@/components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="cv-theme">
      <AuthProvider>
        <CVProvider>
          <Layout>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/candidate"
                element={
                  <ProtectedRoute>
                    <CandidatePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter"
                element={
                  <ProtectedRoute>
                    <RecruiterPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/share/:profileId"
                element={
                  <ProtectedRoute>
                    <ShareProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pending-approval"
                element={
                  <ProtectedRoute>
                    <PendingApprovalPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/access-request/:candidateId"
                element={
                  <ProtectedRoute>
                    <AccessRequestPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Layout>
          <Toaster />
        </CVProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;