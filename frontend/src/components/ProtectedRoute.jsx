import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>; // avoid flashing a redirect before we know auth state
  if (!user) return <Navigate to="/login" replace />;

  return children;
}