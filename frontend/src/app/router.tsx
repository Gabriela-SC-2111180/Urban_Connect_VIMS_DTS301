/**
 * Router — Area A2 (A2-1 public/protected split) + FR-4.5 route-level role
 * gating via RequireRole. Mirrors the AppShell nav matrix so a role can never
 * deep-link to a feature its nav hides:
 *   - Volunteers / Scheduling / Notifications: ADMIN + COORDINATOR
 *   - Dashboard: any signed-in user (funder-relations Viewers included)
 *   - Admin user management: ADMIN only
 *
 * Public:   /login, /403
 * Always:   /404 (catch-all)
 */
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppShell from './AppShell';
import { RequireAuth, RequireRole } from '../auth/guards';
import { useAuth } from '../auth/AuthContext';
import LoginPage from '../pages/LoginPage';
import VolunteersPage from '../pages/VolunteersPage';
import SchedulingPage from '../pages/SchedulingPage';
import NotificationsPage from '../pages/NotificationsPage';
import DashboardPage from '../pages/DashboardPage';
import AdminUsersPage from '../pages/AdminUsersPage';
import ForbiddenPage from '../pages/ForbiddenPage';
import NotFoundPage from '../pages/NotFoundPage';

/** Role-appropriate landing: Viewers (funder-relations) start on the dashboard. */
function LandingRedirect() {
  const { hasRole } = useAuth();
  const canOperate = hasRole('ADMIN') || hasRole('COORDINATOR');
  return <Navigate to={canOperate ? '/volunteers' : '/dashboard'} replace />;
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/403', element: <ForbiddenPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <LandingRedirect /> },
          {
            element: <RequireRole allowed={['ADMIN', 'COORDINATOR']} />,
            children: [
              { path: 'volunteers', element: <VolunteersPage /> },
              { path: 'scheduling', element: <SchedulingPage /> },
              { path: 'notifications', element: <NotificationsPage /> },
            ],
          },
          { path: 'dashboard', element: <DashboardPage /> },
          {
            element: <RequireRole allowed={['ADMIN']} />,
            children: [{ path: 'admin/users', element: <AdminUsersPage /> }],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
