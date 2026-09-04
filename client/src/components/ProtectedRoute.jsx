import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return <div className="flex-center" >Loading…</div>;
  }
  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}
