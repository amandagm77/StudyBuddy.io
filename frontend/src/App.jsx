import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SubjectNotes from './pages/SubjectNotes';
import SubjectQuizzes from './pages/SubjectQuizzes';
import Flashcards from './pages/Flashcards';
import Cheatsheets from './pages/Cheatsheets';
import CheatsheetEditor from './pages/CheatsheetEditor';
import Settings from './pages/Settings';
import Help from './pages/Help';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subjects/:subjectId/notes"
              element={
                <ProtectedRoute>
                  <SubjectNotes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subjects/:subjectId/quizzes"
              element={
                <ProtectedRoute>
                  <SubjectQuizzes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subjects/:subjectId/flashcards"
              element={
                <ProtectedRoute>
                  <Flashcards />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subjects/:subjectId/cheatsheets"
              element={
                <ProtectedRoute>
                  <Cheatsheets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cheatsheets/:cheatsheetId/edit"
              element={
                <ProtectedRoute>
                  <CheatsheetEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/help"
              element={
                <ProtectedRoute>
                  <Help />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}