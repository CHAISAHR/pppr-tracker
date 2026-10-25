export type DashboardRecord = Record<string, any>;
export interface DashboardData {
  activities: DashboardRecord[];
  indicators: DashboardRecord[];
  events: DashboardRecord[];
  risks: DashboardRecord[];
  organisations: DashboardRecord[];
}
export const emptyDashboard: DashboardData = { activities: [], indicators: [], events: [], risks: [], organisations: [] };

function list(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(list);
  if (typeof value !== 'string') return [];
  try { const parsed = JSON.parse(value); if (Array.isArray(parsed)) return parsed.flatMap(list); } catch { /* Plain text organisation. */ }
  return value.split(/[;,]/).map(v => v.trim()).filter(Boolean);
}
export function recordOrgs(r: DashboardRecord): string[] {
  return [...new Set(list([r.implementing_entity, r.implementingEntity, r.implementingEntities, r.organisation, r.organization, r.delivery_partner, r.deliveryPartner, r.deliveryPartners]))];
}
export function matchesOrganisation(r: DashboardRecord, org: string) {
  return org === 'all' || recordOrgs(r).some(n => n.toLowerCase() === org.toLowerCase());
}
export function reportBack(r: DashboardRecord): DashboardRecord {
  const raw = r.reportBack ?? r.report_back;
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw;
  try { const parsed = JSON.parse(raw); return parsed && typeof parsed === 'object' ? parsed : {}; } catch { return {}; }
}
const count = (v: unknown) => Math.max(0, Number(v) || 0);
export function eventAttendance(r: DashboardRecord) {
  const b = reportBack(r);
  return count(b.totalAttendees ?? (count(b.female) + count(b.male) + count(b.other)));
}
export const isCompleted = (r: DashboardRecord) => String(r.status || '').trim().toLowerCase() === 'completed';
export function dashboardMetrics(data: DashboardData, organisation = 'all', now = new Date()) {
  const activities = data.activities.filter(r => matchesOrganisation(r, organisation));
  const events = data.events.filter(r => matchesOrganisation(r, organisation));
  const indicators = data.indicators.filter(r => matchesOrganisation(r, organisation));
  const risks = data.risks.filter(r => matchesOrganisation(r, organisation));
  const completed = activities.filter(isCompleted).length;
  const genders = [
    { name: 'Male', key: 'male', color: 'hsl(var(--chart-blue))' },
    { name: 'Female', key: 'female', color: 'hsl(var(--chart-pink))' },
    { name: 'Other', key: 'other', color: 'hsl(var(--chart-gold))' },
  ].map(g => ({ ...g, value: events.reduce((sum, e) => sum + count(reportBack(e)[g.key]), 0) }));
  const attendance = events.reduce((sum, e) => sum + eventAttendance(e), 0);
  const genderTotal = genders.reduce((sum, g) => sum + g.value, 0);
  if (attendance > genderTotal) genders.push({ name: 'Unspecified', key: 'unspecified', color: 'hsl(var(--muted-foreground))', value: attendance - genderTotal });
  const due = events.filter(e => {
    const b = reportBack(e);
    const end = e.meetingDateTo || e.meeting_date_to || e.meetingDateFrom || e.meeting_date_from || e.meetingDate;
    return !b.submittedAt && !b.reviewed && end && new Date(end) <= now;
  }).length;
  const submitted = events.filter(e => reportBack(e).submittedAt || reportBack(e).reviewed).length;
  const orgNames = [...new Set([...data.organisations.map(o => o.name).filter(Boolean), ...data.activities.flatMap(recordOrgs), ...data.events.flatMap(recordOrgs), ...data.indicators.flatMap(recordOrgs)])].sort();
  const performance = (organisation === 'all' ? orgNames : [organisation]).map(name => {
    const a = activities.filter(r => matchesOrganisation(r, name));
    const ev = events.filter(r => matchesOrganisation(r, name));
    const complete = a.filter(isCompleted).length;
    return { name, activities: a.length, completed: complete, events: ev.length, attendees: ev.reduce((s, r) => s + eventAttendance(r), 0), completion: a.length ? complete / a.length * 100 : null };
  });
  const rating = (v: unknown) => { const n = Number(v); return n >= 1 && n <= 5 ? n : null; };
  const eventRows = events.map(e => {
    const b = reportBack(e);
    const date = e.meetingDateFrom || e.meeting_date_from || e.meetingDate || e.meetingDateTo || e.meeting_date_to || '';
    const end = e.meetingDateTo || e.meeting_date_to || date;
    const status = b.reviewed ? 'Reviewed' : b.submittedAt ? 'Submitted' : end && new Date(end) <= now ? 'Due' : 'Upcoming';
    return { id: e.id, name: e.focusArea || e.focus_area || e.title || 'Event', date, orgs: recordOrgs(e).join(', '), attendees: eventAttendance(e), engagement: rating(b.engagement), trainer: rating(b.trainerPerformance), status };
  });
  const avg = (vals: (number | null)[]) => { const v = vals.filter((x): x is number => x !== null); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null; };
  const avgEngagement = avg(eventRows.map(r => r.engagement));
  const avgTrainer = avg(eventRows.map(r => r.trainer));
  return { activities, events, indicators, risks, attendance, genders, completed, due, submitted, orgNames, performance, eventRows, avgEngagement, avgTrainer, completion: activities.length ? completed / activities.length * 100 : null };
}