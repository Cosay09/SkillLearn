/*
    Jim push korbe
*/

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading)
    return <p className="py-12 text-center text-muted">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.emailVerifiedAt) return <Navigate to="/verify-email" replace />;
  return <Outlet />;
}

export function GuestRoute() {
  const { user, loading } = useAuth();
  if (loading)
    return <p className="py-12 text-center text-muted">Loading...</p>;
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
