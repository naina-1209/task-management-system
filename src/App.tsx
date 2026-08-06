import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { TaskListPage } from '@/pages/TaskListPage';
import { TaskCreatePage } from '@/pages/TaskCreatePage';
import { TaskEditPage } from '@/pages/TaskEditPage';
import { TaskDetailsPage } from '@/pages/TaskDetailsPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

function AppRoutes() {
  const { session, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if (typing) return;

      if (e.key === '/' ) {
        e.preventDefault();
        const search = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement | null;
        search?.focus();
      }
      if (e.key === 'n' && session) {
        e.preventDefault();
        navigate('/tasks/new');
      }
      if (e.key === 'Escape') {
        const closeBtn = document.querySelector('[aria-label="Close"]') as HTMLButtonElement | null;
        closeBtn?.click();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [session, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={session ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout searchQuery={searchQuery} onSearchChange={setSearchQuery} />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tasks" element={<TaskListPage searchQuery={searchQuery} />} />
        <Route path="/tasks/new" element={<TaskCreatePage />} />
        <Route path="/tasks/:id/edit" element={<TaskEditPage />} />
        <Route path="/tasks/:id" element={<TaskDetailsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="/" element={<Navigate to={session ? '/dashboard' : '/login'} replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
