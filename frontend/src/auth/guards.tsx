/**
 * Route-guard SKELETON (A1-3) wired into the router but backed by the
 * PLACEHOLDER auth context. Real enforcement is EP-04 (Cybersecurity).
 *
 * - RequireAuth: redirects to /login when not authenticated; waits for the
 *   auth check to resolve first so protected content never flashes.
 * - RequireRole: additionally checks the user holds one of the allowed roles,
 *   otherwise renders the 403 route.
 *
 * TODO(EP-04): role names here come from the NOT-YET-AGREED placeholder Role
 * type; reconcile with Cybersecurity's exact role strings (contracts doc §3).
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { Role } from '../api/types';
import { useAuth } from './AuthContext';

export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // TODO(design): replace with a real loading state once the design system exists.
    return <p>Loading…</p>;
  }

  if (!isAuthenticated) {
    // Preserve intended destination so login can return the user here.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function RequireRole({ allowed }: { allowed: Role[] }) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) return <p>Loading…</p>;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;

  const permitted = allowed.some((role) => hasRole(role));
  if (!permitted) return <Navigate to="/403" replace />;

  return <Outlet />;
}
