/**
 * Impact Dashboard — Area A6 / EP-03 (INTEGRATE, not own). Must-level:
 *  - FR-3.3 present the dashboard with charts inside the app shell.
 *
 * The Data Analyst pathway owns the real numbers + chart choices; we own the
 * embed, the call, and the loading/empty/error states. Charts here are simple
 * accessible bar/list renderings (no chart lib pulled in for the scaffold) so
 * they swap cleanly for the agreed visualisation. Should items (FR-3.4 filters,
 * FR-3.6 export, FR-3.8 refresh) are OUT of this pass.
 *
 * Data shape is the PLACEHOLDER from docs/cross-pathway-api-contracts.md — NOT
 * yet locked with the Data Analyst.
 */
import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '../api/dashboard';
import { Async } from '../ui';
import type { ChartPoint } from '../api/types';

/** Accessible, dependency-free "bar" row — a labelled value with a text fallback. */
function BarRow({ point, max }: { point: ChartPoint; max: number }) {
  const pct = max > 0 ? Math.round((point.value / max) * 100) : 0;
  return (
    <li>
      <span>{point.label}</span>{' '}
      <progress max={max} value={point.value} aria-label={`${point.label}: ${point.value}`}>
        {point.value}
      </progress>{' '}
      <span>{point.value}</span> <span aria-hidden="true">({pct}%)</span>
    </li>
  );
}

export default function DashboardPage() {
  const dashboardQuery = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard });

  return (
    <main>
      <h1>Impact Dashboard</h1>
      <Async query={dashboardQuery} empty="No impact data available yet.">
        {(data) => {
          const maxHours = Math.max(1, ...data.hoursByProgramme.map((p) => p.value));
          const maxTrend = Math.max(1, ...data.attendanceTrend.map((p) => p.value));
          return (
            <div>
              <section aria-label="Headline">
                <h2>Total active volunteers</h2>
                <p>
                  <strong>{data.totalVolunteers}</strong>
                </p>
              </section>

              <section aria-label="Volunteer hours by programme">
                <h2>Volunteer hours by programme</h2>
                <ul>
                  {data.hoursByProgramme.map((p) => (
                    <BarRow key={p.label} point={p} max={maxHours} />
                  ))}
                </ul>
              </section>

              <section aria-label="Attendance trend">
                <h2>Attendance trend</h2>
                <ul>
                  {data.attendanceTrend.map((p) => (
                    <BarRow key={p.date} point={{ label: p.date, value: p.value }} max={maxTrend} />
                  ))}
                </ul>
              </section>
            </div>
          );
        }}
      </Async>
    </main>
  );
}
