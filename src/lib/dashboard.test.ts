import { describe, expect, test } from 'bun:test';
import { dashboardMetrics, emptyDashboard } from './dashboard';

describe('dashboard metrics', () => {
  test('attendance counts event attendances, not unique beneficiaries', () => {
    const result = dashboardMetrics({ ...emptyDashboard, events: [
      { reportBack: { male: 4, female: 6 } },
      { report_back: JSON.stringify({ totalAttendees: 15, male: 5, female: 7 }) },
    ] });
    expect(result.attendance).toBe(25);
    expect(result.genders.find(g => g.name === 'Unspecified')?.value).toBe(3);
  });
  test('completion uses completed activities, not submitted event reports', () => {
    const result = dashboardMetrics({ ...emptyDashboard, activities: [{ status: 'Completed' }, { status: 'In Progress' }], events: [{ reportBack: { submittedAt: '2026-10-25' } }] });
    expect(result.completion).toBe(50);
  });
  test('organisation filtering matches exact names case-insensitively', () => {
    const result = dashboardMetrics({ ...emptyDashboard, activities: [
      { delivery_partner: 'DOH', status: 'Completed' }, { implementing_entity: 'DOH Research', status: 'Completed' },
    ], events: [{ deliveryPartners: ['doh'], reportBack: { female: 3 } }] }, 'DOH');
    expect(result.activities.length).toBe(1);
    expect(result.attendance).toBe(3);
  });
  test('only past events without submitted reports are due', () => {
    const result = dashboardMetrics({ ...emptyDashboard, events: [
      { meetingDateTo: '2026-10-24' }, { meetingDateTo: '2026-10-26' },
      { meetingDateTo: '2026-10-24', reportBack: { submittedAt: '2026-10-24' } },
    ] }, 'all', new Date('2026-10-25T10:54:00Z'));
    expect(result.due).toBe(1);
  });
  test('empty datasets have no fabricated completion percentage', () => {
    expect(dashboardMetrics(emptyDashboard).completion).toBeNull();
  });
});