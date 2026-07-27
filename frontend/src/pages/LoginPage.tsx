/**
 * Login page — Area A1 / EP-04 UI (FR-4.1). A real email+password form posting
 * to the auth resource module (mock-backed in dev). On success it returns the
 * user to their intended destination; on failure it shows the API error inline.
 *
 * Real auth/RBAC is owned by Cybersecurity — we own this screen and its wiring.
 */
import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { env } from '../config/env';
import { isEmail, isNonEmpty } from '../lib/validation';
import { InlineMessage, TextField } from '../ui';

interface LocationState {
  from?: { pathname?: string };
}

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from?.pathname ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState<{ email?: string; password?: string }>({});
  const [submitError, setSubmitError] = useState<string | undefined>();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(undefined);

    const errors: typeof fieldError = {};
    if (!isEmail(email)) errors.email = 'Enter a valid email address.';
    if (!isNonEmpty(password)) errors.password = 'Enter your password.';
    setFieldError(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not sign in.');
    }
  }

  return (
    <main>
      <h1>Sign in to VIMS</h1>

      <form onSubmit={handleSubmit} noValidate>
        <TextField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          required
          error={fieldError.email}
        />
        <TextField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          required
          error={fieldError.password}
        />
        {submitError ? <InlineMessage tone="error">{submitError}</InlineMessage> : null}
        <button type="submit" disabled={isLoggingIn}>
          {isLoggingIn ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      {env.useMocks ? (
        <aside aria-label="Demo accounts">
          <p>
            <strong>Demo (mock auth):</strong> any password works. Try{' '}
            <code>eva.cameron@urbanconnect.org</code> (Admin),{' '}
            <code>mark.rivers@urbanconnect.org</code> (Coordinator), or{' '}
            <code>lena.frost@urbanconnect.org</code> (Viewer).
          </p>
        </aside>
      ) : null}
    </main>
  );
}
