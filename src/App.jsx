
import React from 'react';
import './lib/i18n'; // Import i18n config
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { HealthProvider } from '@/lib/HealthContext';
import { supabase } from '@/lib/supabase';
import Layout from './Layout';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Analyzing from './pages/Analyzing';
import Dashboard from './pages/Dashboard';
import UpdatePassword from './pages/UpdatePassword';
import PageNotFound from './lib/PageNotFound';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#B7323F] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AuthRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [checking, setChecking] = React.useState(true);
  const [profile, setProfile] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;

    const checkProfile = async () => {
      if (user) {
        try {
          // Add a small timeout to prevent indefinite hanging if DB is slow
          const { data, error } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', user.id)
            .single();

          if (mounted) {
            if (error) {
              console.warn("Profile check failed, assuming incomplete:", error);
              // If error (e.g. missing table), treat as new user
              setProfile(null);
            } else {
              setProfile(data);
            }
          }
        } catch (error) {
          console.error('Error checking profile:', error);
        }
      }
      if (mounted) setChecking(false);
    };

    if (!loading) {
      checkProfile();
    } else {
      // Safety timeout: if checking auth takes too long (e.g. 5s), stop loading
      const timer = setTimeout(() => setChecking(false), 5000);
      return () => clearTimeout(timer);
    }

    return () => { mounted = false; };
  }, [user, loading]);

  // Show loading spinner only while checking logic is active
  if (loading || (user && checking)) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#B7323F] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If logged in, redirect based on onboarding status
  if (user) {
    if (profile?.onboarding_completed) {
      return <Navigate to="/dashboard" replace />;
    } else {
      // Allow user to stay on /onboarding, but finding a way to not loop if they are already there is handled by the Router
      // This component wraps the Auth/Landing page, so if they are logged in and incomplete, go to onboarding
      return <Navigate to="/onboarding" replace />;
    }
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <HealthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <Layout>
              <Routes>
                {/* Auth as default */}
                <Route path="/" element={
                  <AuthRoute>
                    <Auth />
                  </AuthRoute>
                } />

                {/* Protected routes */}
                <Route path="/onboarding" element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                } />

                <Route path="/analyzing" element={
                  <ProtectedRoute>
                    <Analyzing />
                  </ProtectedRoute>
                } />

                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />

                <Route path="/update-password" element={
                  <ProtectedRoute>
                    <UpdatePassword />
                  </ProtectedRoute>
                } />

                {/* 404 */}
                <Route path="*" element={<PageNotFound />} />
              </Routes>
            </Layout>
          </Router>
          <Toaster />
        </QueryClientProvider>
      </HealthProvider>
    </AuthProvider>
  )
}

export default App
