import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/Layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';
import Unauthorized from './pages/Unauthorized';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              {/* Admin Routes */}
              <Route
                path="admin/*"
                element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <div>Admin routes coming soon...</div>
                  </ProtectedRoute>
                }
              />
              {/* Teacher Routes */}
              <Route
                path="teacher/*"
                element={
                  <ProtectedRoute requiredRoles={['teacher']}>
                    <div>Teacher routes coming soon...</div>
                  </ProtectedRoute>
                }
              />
              {/* Parent Routes */}
              <Route
                path="parent/*"
                element={
                  <ProtectedRoute requiredRoles={['parent']}>
                    <div>Parent routes coming soon...</div>
                  </ProtectedRoute>
                }
              />
              {/* Wallet Route */}
              <Route
                path="wallet"
                element={
                  <ProtectedRoute requiredRoles={['parent']}>
                    <Wallet />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;