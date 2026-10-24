import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './context/AuthContext.jsx';
import { Navbar } from './components/Navbar.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { InstitutionDashboard } from './pages/InstitutionDashboard.jsx';
import { UploadFDR } from './pages/UploadFDR.jsx';
import { BankDashboard } from './pages/BankDashboard.jsx';
import { AdminDashboard } from './pages/AdminDashboard.jsx';
import { FdrDetails } from './pages/FdrDetails.jsx';
import { NotFound } from './pages/NotFound.jsx';
import { LandingPage } from './pages/LandingPage.jsx';

function HomeRedirect() {
  const { currentUser, loading } = useAuthContext();

  if (loading) return null;

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role === 'institution') {
    return <Navigate to="/institution" replace />;
  }

  if (currentUser.role === 'bank') {
    return <Navigate to="/bank" replace />;
  }

  if (currentUser.role === 'aicte_admin') {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/institution" replace />;
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans">
          <Navbar />
          <main className="flex-1 pb-16">
            <Routes>
              {/* Landing Page as primary home view */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/landing" element={<LandingPage />} />

              {/* Direct role redirect shortcut */}
              <Route path="/dashboard" element={<HomeRedirect />} />

              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Institution Routes */}
              <Route
                path="/institution"
                element={
                  <ProtectedRoute allowedRoles={['institution']}>
                    <InstitutionDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/upload-fdr"
                element={
                  <ProtectedRoute allowedRoles={['institution']}>
                    <UploadFDR />
                  </ProtectedRoute>
                }
              />

              {/* Bank Route */}
              <Route
                path="/bank"
                element={
                  <ProtectedRoute allowedRoles={['bank']}>
                    <BankDashboard />
                  </ProtectedRoute>
                }
              />

              {/* AICTE Admin Route */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['aicte_admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Detailed FDR View & Audit Trail (All authenticated roles) */}
              <Route
                path="/fdrs/:id"
                element={
                  <ProtectedRoute>
                    <FdrDetails />
                  </ProtectedRoute>
                }
              />

              {/* 404 Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          
          <footer className="border-t border-slate-200 bg-white py-6 px-4 text-center text-sm text-slate-500">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">TrackTitans</span>
                <span>·</span>
                <span className="text-slate-600 font-medium">Smart India Hackathon SIH26265</span>
              </div>
              <p className="text-slate-500">Secure Institutional Security Deposit & Fixed Deposit Receipt (FDR) Lifecycle Digitization Platform</p>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
