import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';

// Layout Components
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import Home from './pages/public/Home';
import NotFound from './pages/public/NotFound';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard';
import Analytics from './pages/dashboard/Analytics';

// Profile Pages
import Profile from './pages/profile/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import UrlManagement from './pages/admin/UrlManagement';

// Constants
import { ROUTES } from './utils/constants';

function App() {
  return (
    <div className='h-screen w-screen overflow-x-hidden text-black'>
    <AuthProvider>
      <Router>
        <div className="App">
          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            containerClassName=""
            containerStyle={{}}
            toastOptions={{
              // Define default options
              className: '',
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              // Default options for specific types
              success: {
                duration: 3000,
                style: {
                  background: '#10B981',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#10B981',
                },
              },
              error: {
                duration: 4000,
                style: {
                  background: '#EF4444',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#EF4444',
                },
              },
              loading: {
                duration: Infinity,
              },
            }}
          />

          {/* Application Routes */}
          <Routes>
            {/* Public Routes */}
            <Route path={ROUTES.HOME} element={<Home />} />
            
            {/* Authentication Routes */}
            <Route path={ROUTES.LOGIN} element={<Login />} />
            <Route path={ROUTES.REGISTER} element={<Register />} />
            
            {/* Protected User Routes */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard Routes */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="profile" element={<Profile />} />
              
              {/* Redirect /app to dashboard */}
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>
            
            {/* Legacy route redirects for backward compatibility */}
            <Route 
              path={ROUTES.DASHBOARD} 
              element={<Navigate to="/app/dashboard" replace />} 
            />
            <Route 
              path={ROUTES.ANALYTICS} 
              element={<Navigate to="/app/analytics" replace />} 
            />
            <Route 
              path={ROUTES.PROFILE} 
              element={<Navigate to="/app/profile" replace />} 
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="urls" element={<UrlManagement />} />
              
              {/* Redirect /admin to admin dashboard */}
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Legacy admin route redirects */}
            <Route 
              path={ROUTES.ADMIN.DASHBOARD} 
              element={<Navigate to="/admin/dashboard" replace />} 
            />
            <Route 
              path={ROUTES.ADMIN.USERS} 
              element={<Navigate to="/admin/users" replace />} 
            />
            <Route 
              path={ROUTES.ADMIN.URLS} 
              element={<Navigate to="/admin/urls" replace />} 
            />

            {/* 404 - Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
    </div>
  );
}

export default App;