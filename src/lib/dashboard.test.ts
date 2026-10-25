/// <reference types="node" />
import { describe, test } from 'node:test';
import { strict as assert } from 'node:assert';
import { dashboardMetrics, emptyDashboard } from './dashboard';

describe('dashboard metrics', () => {
  test('attendance counts event attendances, not unique beneficiaries', () => {
    const result = dashboardMetrics({ ...emptyDashboard, events: [
      { reportBack: { male: 4, female: 6 } },
      { report_back: JSON.stringify({ totalAttendees: 15, male: 5, female: 7 }) },
    ] });
    assert.equal(result.attendance, 25);
    assert.equal(result.genders.find(g => g.name === 'Unspecified')?.value, 3);
  });
  test('completion uses completed activities, not submitted event reports', () => {
    const result = dashboardMetrics({ ...emptyDashboard, activities: [{ status: 'Completed' }, { status: 'In Progress' }], events: [{ reportBack: { submittedAt: '2026-10-25' } }] });
    assert.equal(result.completion, 50);
  });
  test('organisation filtering matches exact names case-insensitively', () => {
    const result = dashboardMetrics({ ...emptyDashboard, activities: [
      { delivery_partner: 'DOH', status: 'Completed' }, { implementing_entity: 'DOH Research', status: 'Completed' },
    ], events: [{ deliveryPartners: ['doh'], reportBack: { female: 3 } }] }, 'DOH');
    assert.equal(result.activities.length, 1);
    assert.equal(result.attendance, 3);
  });
  test('only past events without submitted reports are due', () => {
    const result = dashboardMetrics({ ...emptyDashboard, events: [
      { meetingDateTo: '2026-10-24' }, { meetingDateTo: '2026-10-26' },
      { meetingDateTo: '2026-10-24', reportBack: { submittedAt: '2026-10-24' } },
    ] }, 'all', new Date('2026-10-25T10:54:00Z'));
    assert.equal(result.due, 1);
  });
  test('empty datasets have no fabricated completion percentage', () => {
    assert.equal(dashboardMetrics(emptyDashboard).completion, null);
  });
});