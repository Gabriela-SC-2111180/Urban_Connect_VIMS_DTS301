/**
 * App shell — Area A2 (cards A2-2 shell, A2-3 role-aware nav). Styled with the
 * UrbanConnect design language (Area A7 tokens in ui/theme.css). Header (brand +
 * current user + logout) + role-filtered primary nav + content outlet.
 *
 * Role gating (FR-4.5) uses placeholder role names from src/api/types.ts; when
 * EP-04 locks the real role strings, only that list changes.
 */
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import type { Role } from '../api/types';

interface NavItem {
  to: string;
  label: string;
  /** Roles allowed to see this item; omit for "any signed-in user". */
  roles?: Role[];
}

// FR-4.5 demo matrix: Viewer is funder-relations (Dashboard only); Coordinator
// runs operations; Admin sees everything incl. user management.
const NAV: NavItem[] = [
  { to: '/volunteers', label: 'Volunteers', roles: ['ADMIN', 'COORDINATOR'] },
  { to: '/scheduling', label: 'Programmes & Events', roles: ['ADMIN', 'COORDINATOR'] },
  { to: '/notifications', label: 'Notifications', roles: ['ADMIN', 'COORDINATOR'] },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/admin/users', label: 'Admin', roles: ['ADMIN'] },
];

export default function AppShell() {
  const { user, hasRole, logout } = useAuth();
  const navigate = useNavigate();

  const visibleNav = NAV.filter((item) => !item.roles || item.roles.some((r) => hasRole(r)));

  return (
    <div className="app-shell">
      {/* TODO(a11y, A8): skip-to-content link + focus-on-route-change. */}
      <header className="app-header">
        <span className="brand">
          <img src="/urbanconnect-logo.png" alt="UrbanConnect" />
          <strong>VIMS</strong>
        </span>
        <span className="app-user">{user ? user.name : 'Not signed in'}</span>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          Log out
        </button>
      </header>

      <nav className="app-nav" aria-label="Primary">
        {visibleNav.map((item) => (
          <NavLink key={item.to} to={item.to}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
