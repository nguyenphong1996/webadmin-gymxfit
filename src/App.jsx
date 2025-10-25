import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

// Import pages
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ClassesListPage from './pages/Classes/ClassesListPage';
import ClassDetailPage from './pages/Classes/ClassDetailPage';
import ClassCreatePage from './pages/Classes/ClassCreatePage';
import ClassEditPage from './pages/Classes/ClassEditPage';
import StaffListPage from './pages/Staff/StaffListPage';
import StaffDetailPage from './pages/Staff/StaffDetailPage';
import StaffCreatePage from './pages/Staff/StaffCreatePage';
import EnrollmentsListPage from './pages/Enrollments/EnrollmentsListPage';
import EnrollmentDetailPage from './pages/Enrollments/EnrollmentDetailPage';
import VideoManagementPage from './pages/Videos/VideoManagementPage';
import UsersListPage from './pages/Users/UsersListPage';
import UserDetailPage from './pages/Users/UserDetailPage';

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />

                {/* Protected Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }>
                  {/* Default redirect */}
                  <Route index element={<Navigate to="/dashboard" replace />} />

                  {/* Dashboard */}
                  <Route path="dashboard" element={<DashboardPage />} />

                  {/* Classes Routes */}
                  <Route path="classes" element={<ClassesListPage />} />
                  <Route path="classes/create" element={<ClassCreatePage />} />
                  <Route path="classes/:id" element={<ClassDetailPage />} />
                  <Route path="classes/:id/edit" element={<ClassEditPage />} />

                  {/* Staff Routes */}
                  <Route path="staff" element={<StaffListPage />} />
                  <Route path="staff/create" element={<StaffCreatePage />} />
                  <Route path="staff/:staffId" element={<StaffDetailPage />} />

                  {/* Enrollments Routes */}
                  <Route path="enrollments" element={<EnrollmentsListPage />} />
                  <Route path="enrollments/:enrollmentId" element={<EnrollmentDetailPage />} />

                  {/* Placeholder routes - to be implemented */}

                  <Route path="videos" element={<VideoManagementPage />} />

                  {/* Users Routes */}
                  <Route path="users" element={<UsersListPage />} />
                  <Route path="users/:userId" element={<UserDetailPage />} />

                  <Route path="settings" element={
                    <div className="p-6">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
                      <p className="mt-2 text-gray-600 dark:text-gray-400">Settings coming soon...</p>
                    </div>
                  } />
                </Route>

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </AuthProvider>
        </Router>
      </ThemeProvider>
      {/* React Query Devtools - only in development */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;
