/**
 * 403 Forbidden placeholder — Area A2 (card A2-4) / A1 role gating. NO design.
 */
import { Link } from 'react-router-dom';

export default function ForbiddenPage() {
  return (
    <main>
      <h1>403 — Not allowed</h1>
      {/* TODO(A2-4): friendly "you don't have access" view; route back to a safe page. */}
      <Link to="/">Back to home</Link>
    </main>
  );
}
