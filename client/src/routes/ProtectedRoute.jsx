/*
    Jim push korbe
*/

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading)
    return <p className="py-12 text-center text-slate-500">Loading...</p>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export function GuestRoute() {
  const { user, loading } = useAuth();
  if (loading)
    return <p className="py-12 text-center text-slate-500">Loading...</p>;
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
