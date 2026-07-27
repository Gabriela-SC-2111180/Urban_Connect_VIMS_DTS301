/**
 * Smoke test — proves the toolchain renders a real, data-backed page (now that
 * pages use React Query + the resource/mock layer). Feature-specific suites are
 * owned by their kanban cards; the pure logic is covered in the sibling tests.
 */
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import VolunteersPage from '../pages/VolunteersPage';

describe('frontend smoke test', () => {
  it('renders the Volunteers page heading within providers', () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <VolunteersPage />
      </QueryClientProvider>,
    );
    expect(screen.getByRole('heading', { name: 'Volunteers' })).toBeInTheDocument();
  });
});
