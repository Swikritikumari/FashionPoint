import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function AdminRoute() {
  const { currentUser } = useSelector((state) => state.user);

  if (!currentUser) return <Navigate to="/sign-in" replace />;
  return currentUser.isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}
