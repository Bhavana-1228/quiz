import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Languages } from './pages/Languages';
import { LanguageDetail } from './pages/LanguageDetail';
import { QuizSetup } from './pages/QuizSetup';
import { QuizPlay } from './pages/QuizPlay';
import { QuizResult } from './pages/QuizResult';
import { Progress } from './pages/Progress';
import { Settings } from './pages/Settings';
import { AdminReview } from './pages/AdminReview';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes inside App Shell */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/languages" element={<Languages />} />
              <Route path="/languages/:slug" element={<LanguageDetail />} />
              <Route path="/quiz/setup" element={<QuizSetup />} />
              <Route path="/quiz/:sessionId" element={<QuizPlay />} />
              <Route path="/results/:sessionId" element={<QuizResult />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin/review" element={<AdminReview />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
