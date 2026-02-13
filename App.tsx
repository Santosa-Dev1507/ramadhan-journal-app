import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import GoalSetup from './pages/GoalSetup';
import Journal from './pages/Journal';
import Progress from './pages/Progress';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import TeacherDashboard from './pages/TeacherDashboard';
import Navigation from './components/Navigation';

// SECURITY: Route Guard Component
const ProtectedRoute = ({ children, requireTeacher }: { children?: React.ReactNode, requireTeacher?: boolean }) => {
  const userString = localStorage.getItem('currentUser');
  const user = userString ? JSON.parse(userString) : null;

  // 1. Not logged in -> Redirect to Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Not a teacher but trying to access teacher page -> Redirect to Journal
  if (requireTeacher && user.id !== 'teacher') {
     return <Navigate to="/journal" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isGoalSetup = location.pathname === '/goal-setup';
  // Check if path starts with /teacher to hide nav
  const isTeacher = location.pathname.startsWith('/teacher');

  const showNav = !isLoginPage && !isGoalSetup && !isTeacher;

  return (
    <div className="min-h-screen w-full bg-background-light dark:bg-background-dark max-w-md mx-auto relative shadow-2xl overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/goal-setup" element={
            <ProtectedRoute>
                <GoalSetup />
            </ProtectedRoute>
          } />
          
          <Route path="/journal" element={
            <ProtectedRoute>
                <Journal />
            </ProtectedRoute>
          } />
          
          <Route path="/progress" element={
            <ProtectedRoute>
                <Progress />
            </ProtectedRoute>
          } />

          <Route path="/leaderboard" element={
            <ProtectedRoute>
                <Leaderboard />
            </ProtectedRoute>
          } />

           <Route path="/profile" element={
            <ProtectedRoute>
                <Profile />
            </ProtectedRoute>
          } />
          
          <Route path="/teacher" element={
            <ProtectedRoute requireTeacher={true}>
                <TeacherDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
      {showNav && <Navigation />}
    </div>
  );
};

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}