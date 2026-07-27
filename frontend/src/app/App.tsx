/**
 * App root — composes the cross-cutting providers (A8) around the router.
 *  - ErrorBoundary (A8-3 skeleton)
 *  - React Query provider (A8-2: data fetching + caching layer)
 *  - AuthProvider (A1-2 placeholder)
 *  - RouterProvider (A2 router skeleton)
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { ErrorBoundary } from './ErrorBoundary';
import { AuthProvider } from '../auth/AuthContext';
import { router } from './router';

// Single shared query client. TODO(A8-2): tune defaults (retry, staleTime,
// global error handling) once conventions are agreed.
const queryClient = new QueryClient();

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
