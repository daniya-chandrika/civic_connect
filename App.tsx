import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { IssueProvider } from './context/IssueContext';

import HomePage from './pages/HomePage';
import SignInPage from './pages/SignInPage';
import CitizenDashboard from './pages/CitizenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import ReportIssuePage from './pages/ReportIssuePage';
import IssueDetailPage from './pages/IssueDetailPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminSelectionPage from './pages/AdminSelectionPage';
import DeputyCommissionerDashboard from './pages/DeputyCommissionerDashboard';
import MunicipalCommissionerDashboard from './pages/MunicipalCommissionerDashboard';

const AppRoutes: React.FC = () => {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login/admin-selection" element={<AdminSelectionPage />} />
        <Route path="/login/:type" element={<SignInPage />} />
        
        {/* Citizen Routes */}
        <Route 
          path="/citizen" 
          element={<ProtectedRoute allowedRole="citizen"><CitizenDashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/citizen/report" 
          element={<ProtectedRoute allowedRole="citizen"><ReportIssuePage /></ProtectedRoute>} 
        />
        <Route 
          path="/citizen/issue/:id" 
          element={<ProtectedRoute allowedRole="citizen"><IssueDetailPage /></ProtectedRoute>} 
        />
        <Route 
          path="/citizen/profile" 
          element={<ProtectedRoute allowedRole="citizen"><ProfilePage /></ProtectedRoute>} 
        />

        {/* Worker Routes */}
        <Route 
          path="/worker" 
          element={<ProtectedRoute allowedRole="worker"><WorkerDashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/worker/issue/:id" 
          element={<ProtectedRoute allowedRole="worker"><IssueDetailPage /></ProtectedRoute>} 
        />
         <Route 
          path="/worker/profile" 
          element={<ProtectedRoute allowedRole="worker"><ProfilePage /></ProtectedRoute>} 
        />

        {/* Admin Routes - Sanitation Officer */}
        <Route 
          path="/sanitation-officer" 
          element={<ProtectedRoute allowedRole="sanitation-officer"><AdminDashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/sanitation-officer/issue/:id" 
          element={<ProtectedRoute allowedRole="sanitation-officer"><IssueDetailPage /></ProtectedRoute>} 
        />
         <Route 
          path="/sanitation-officer/profile" 
          element={<ProtectedRoute allowedRole="sanitation-officer"><ProfilePage /></ProtectedRoute>} 
        />

        {/* Admin Routes - City Engineer */}
        <Route 
          path="/city-engineer" 
          element={<ProtectedRoute allowedRole="city-engineer"><AdminDashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/city-engineer/issue/:id" 
          element={<ProtectedRoute allowedRole="city-engineer"><IssueDetailPage /></ProtectedRoute>} 
        />
         <Route 
          path="/city-engineer/profile" 
          element={<ProtectedRoute allowedRole="city-engineer"><ProfilePage /></ProtectedRoute>} 
        />
        
        {/* Admin Routes - Deputy Commissioner */}
        <Route 
          path="/deputy-commissioner" 
          element={<ProtectedRoute allowedRole="deputy-commissioner"><DeputyCommissionerDashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/deputy-commissioner/issue/:id" 
          element={<ProtectedRoute allowedRole="deputy-commissioner"><IssueDetailPage /></ProtectedRoute>} 
        />
         <Route 
          path="/deputy-commissioner/profile" 
          element={<ProtectedRoute allowedRole="deputy-commissioner"><ProfilePage /></ProtectedRoute>} 
        />
        
        {/* Admin Routes - Municipal Commissioner */}
        <Route 
          path="/municipal-commissioner" 
          element={<ProtectedRoute allowedRole="municipal-commissioner"><MunicipalCommissionerDashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/municipal-commissioner/issue/:id" 
          element={<ProtectedRoute allowedRole="municipal-commissioner"><IssueDetailPage /></ProtectedRoute>} 
        />
         <Route 
          path="/municipal-commissioner/profile" 
          element={<ProtectedRoute allowedRole="municipal-commissioner"><ProfilePage /></ProtectedRoute>} 
        />


        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <IssueProvider>
          <AppRoutes />
        </IssueProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;