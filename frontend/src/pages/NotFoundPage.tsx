/**
 * 404 Not Found placeholder — Area A2 (card A2-4). NO design — structural only.
 */
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main>
      <h1>404 — Page not found</h1>
      {/* TODO(A2-4): friendly not-found view; no stack traces. */}
      <Link to="/">Back to home</Link>
    </main>
  );
}
