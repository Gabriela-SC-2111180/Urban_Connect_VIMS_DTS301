/**
 * Minimal global error boundary skeleton — Area A8 (card A8-3).
 * Prevents a white screen on render errors. NO design — the full graceful
 * failure UI / standard error states are owned by the A8 card + design team.
 */
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // TODO(A8): route to a real logging sink; never leak internals to users (NFR-6).
    console.error('[ErrorBoundary]', error, info);
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      // TODO(design + A8-3): replace with the standard friendly fallback UI.
      return (
        <main>
          <h1>Something went wrong</h1>
          <p>Please reload the page.</p>
        </main>
      );
    }
    return this.props.children;
  }
}
