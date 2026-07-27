/**
 * Admin · User Management — Area A1 / FR-4.6 (admin-only, role-gated by router).
 * Must-level: list users, create a user, change role, activate/deactivate.
 *
 * Real user CRUD + the authoritative role list are EP-04 (Cybersecurity); this
 * screen is the front-end for those actions, mock-backed in dev. Role names are
 * the placeholder set from src/api/types.ts pending the EP-04 lock.
 */
import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createUser, listUsers, updateUser } from '../api/auth';
import type { ManagedUserInput } from '../api/domain';
import type { Role } from '../api/types';
import { isEmail, isNonEmpty } from '../lib/validation';
import { Async, DataTable, InlineMessage, SelectField, StatusBadge, TextField } from '../ui';

const ROLES: Role[] = ['ADMIN', 'COORDINATOR', 'VIEWER'];
const ROLE_OPTIONS = ROLES.map((r) => ({ value: r, label: r }));

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const usersQuery = useQuery({ queryKey: ['users'], queryFn: listUsers });

  const [form, setForm] = useState<ManagedUserInput>({ name: '', email: '', role: 'VIEWER' });
  const [error, setError] = useState<string | undefined>();

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      setForm({ name: '', email: '', role: 'VIEWER' });
      setError(undefined);
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Could not create user.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...patch }: { id: string; role?: Role; active?: boolean }) => updateUser(id, patch),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isNonEmpty(form.name)) return setError('Name is required.');
    if (!isEmail(form.email)) return setError('Enter a valid email address.');
    createMutation.mutate(form);
  }

  return (
    <main>
      <h1>Admin · User Management</h1>

      <Async query={usersQuery} empty="No users yet.">
        {(rows) => (
          <DataTable
            columns={[
              { header: 'Name', cell: (u) => u.name },
              { header: 'Email', cell: (u) => u.email },
              {
                header: 'Role',
                cell: (u) => (
                  <select
                    aria-label={`Role for ${u.name}`}
                    value={u.role}
                    onChange={(e) => updateMutation.mutate({ id: u.id, role: e.target.value as Role })}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                ),
              },
              { header: 'Status', cell: (u) => <StatusBadge label={u.active ? 'Active' : 'Deactivated'} tone={u.active ? 'success' : 'warn'} /> },
              {
                header: 'Actions',
                cell: (u) => (
                  <button type="button" onClick={() => updateMutation.mutate({ id: u.id, active: !u.active })}>
                    {u.active ? 'Deactivate' : 'Reactivate'}
                  </button>
                ),
              },
            ]}
            rows={rows}
            getRowKey={(u) => u.id}
            caption="Users"
          />
        )}
      </Async>

      <form onSubmit={handleSubmit} noValidate>
        <h2>New user</h2>
        <TextField id="user-name" label="Name" value={form.name} required
          onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
        <TextField id="user-email" label="Email" type="email" value={form.email} required
          onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
        <SelectField id="user-role" label="Role" value={form.role} options={ROLE_OPTIONS}
          onChange={(v) => setForm((f) => ({ ...f, role: v as Role }))} />
        {error ? <InlineMessage tone="error">{error}</InlineMessage> : null}
        <button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Creating…' : 'Create user'}
        </button>
      </form>
    </main>
  );
}
