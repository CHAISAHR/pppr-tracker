import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, ClipboardList, CheckCircle2, AlertTriangle, RefreshCw, ArrowUpRight, CalendarDays, Target, ClipboardCheck, ArrowDownUp, Building2 } from 'lucide-react';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DashboardPanel } from '@/components/dashboard/DashboardPanel';
import { dashboardMetrics, DashboardData, DashboardRecord, emptyDashboard, reportBack } from '@/lib/dashboard';
import { parseYearly, achievement } from '@/components/performance/yearlyPerformance';

const format = (n: number) => n.toLocaleString();
const percent = (n: number | null) => n === null ? '—' : `${n.toFixed(1)}%`;
const dateLabel = (raw: unknown) => {
  const date = new Date(String(raw || ''));
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};
const chartColors = ['hsl(var(--chart-green))', 'hsl(var(--chart-pink))', 'hsl(var(--chart-gold))', 'hsl(var(--chart-blue))', 'hsl(var(--chart-violet))'];
const tooltipStyle = { backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--popover-foreground))', borderRadius: 6 };
function Empty({ text = 'No records yet' }: { text?: string }) { return <div className="flex min-h-40 items-center justify-center text-center text-sm text-muted-foreground">{text}</div>; }

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const admin = isAdmin();
  const [organisation, setOrganisation] = useState('all');
  const [year, setYear] = useState('1');
  const [sort, setSort] = useState<{ key: string; desc: boolean }>({ key: 'date', desc: true });
  const query = useQuery({
    queryKey: ['programme-dashboard', user?.id, admin],
    queryFn: async () => {
      const names: (keyof DashboardData)[] = ['activities', 'indicators', 'events', 'risks', 'organisations'];
      const results = await Promise.allSettled([api.getProjects(), api.getIndicators(), api.getMeetings(), api.getRisks(), api.getOrganisations()]);
      const data: DashboardData = { ...emptyDashboard };
      const errors: string[] = [];
      results.forEach((result, i) => { if (result.status === 'fulfilled') data[names[i]] = result.value; else errors.push(names[i]); });
      return { data, errors };
    },
  });
  const quarterly = useQuery({
    queryKey: ['dashboard-quarterly', user?.id, admin, user?.organization],
    queryFn: async () => {
      const reports = (await api.getQuarterlyReports(admin)).filter(r => r.status === 'Published');
      return Promise.all(reports.map(async r => ({ ...r, responses: await api.getQuarterlyResponses(r.id, admin, user?.organization) })));
    },
  });
  const metrics = useMemo(() => dashboardMetrics(query.data?.data || emptyDashboard, organisation), [query.data, organisation]);
  const failed = (key: string) => query.data?.errors.includes(key) || false;
  const rows = [...metrics.eventRows].sort((a, b) => {
    const av = a[sort.key as keyof typeof a], bv = b[sort.key as keyof typeof b];
    const result = sort.key === 'date' ? new Date(String(av || 0)).getTime() - new Date(String(bv || 0)).getTime() : typeof av === 'string' ? av.localeCompare(String(bv)) : Number(av || 0) - Number(bv || 0);
    return sort.desc ? -result : result;
  });
  const bars = [...metrics.performance].filter(r => r.attendees > 0).sort((a, b) => b.attendees - a.attendees).slice(0, 5);
  const recent = [
    ...metrics.activities.map(r => ({ title: r.activity_description || r.activityDescription || r.name || r.activity_id || 'Activity', type: 'Activity', date: r.modified_date || r.modifiedDate || r.updated_at || r.created_at, route: '/activity-tracker' })),
    ...metrics.events.filter(r => reportBack(r).submittedAt).map(r => ({ title: r.eventTitle || r.title || 'Event report back', type: 'Report back', date: reportBack(r).submittedAt, route: '/meetings' })),
    ...metrics.indicators.map(r => ({ title: r.name || 'Indicator', type: 'Indicator', date: r.updated_at || r.created_at, route: '/performance' })),
  ].filter(r => r.date && !Number.isNaN(new Date(r.date).getTime())).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  const kpis = [
    { title: 'Total Attendances', value: failed('events') ? '—' : format(metrics.attendance), detail: 'Across event report backs', icon: Users, tone: 'green' },
    { title: 'Report Backs Submitted', value: failed('events') ? '—' : format(metrics.submitted), detail: `Of ${format(metrics.events.length)} scheduled events`, icon: ClipboardList, tone: 'blue' },
    { title: 'Activity Completion', value: failed('activities') ? '—' : percent(metrics.completion), detail: `${format(metrics.completed)} / ${format(metrics.activities.length)} activities completed`, icon: CheckCircle2, tone: 'gold' },
    { title: 'Report Backs Due', value: failed('events') ? '—' : format(metrics.due), detail: 'Ended events awaiting a report', icon: AlertTriangle, tone: 'pink' },
  ];
  const tones: Record<string, string> = {
    green: 'bg-secondary border-card-border/60 text-secondary-foreground',
    blue: 'bg-[hsl(var(--chart-blue)/0.08)] border-[hsl(var(--chart-blue)/0.16)] text-[hsl(var(--chart-blue))]',
    gold: 'bg-accent/10 border-accent/20 text-foreground',
    pink: 'bg-[hsl(var(--chart-pink)/0.07)] border-[hsl(var(--chart-pink)/0.16)] text-[hsl(var(--chart-pink))]',
  };
  const refresh = () => { void query.refetch(); void quarterly.refetch(); };
  const open = (route: string) => <Button variant="ghost" size="sm" onClick={() => navigate(route)} className="h-7 px-1 text-primary">View all <ArrowUpRight className="h-3.5 w-3.5" /></Button>;
  const sortHeader = (key: string, label: string) => <TableHead><Button variant="ghost" size="sm" className="h-7 px-0 text-xs text-table-header-foreground" onClick={() => setSort({ key, desc: sort.key === key ? !sort.desc : false })}>{label}<ArrowDownUp className="h-3 w-3" /></Button></TableHead>;
  return <div className="min-h-full bg-background">
    <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><div className="mb-1 text-xs font-medium uppercase tracking-normal text-primary">M&E Reporting Tool</div><h1 className="text-2xl font-bold sm:text-3xl">Programme Overview</h1><p className="mt-1 text-sm text-muted-foreground">Activities, partner delivery, and reporting performance</p></div>
        <div className="flex max-w-full flex-wrap items-center gap-2">
          <div className="flex h-10 items-center gap-2 rounded-md border border-border bg-card px-3 text-xs text-muted-foreground"><CalendarDays className="h-4 w-4 text-primary" />{dateLabel(new Date())}</div>
          <Select value={organisation} onValueChange={setOrganisation}><SelectTrigger aria-label="Filter by organisation" className="w-52 max-w-full bg-card"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All organisations</SelectItem>{metrics.orgNames.filter(n => n !== 'all').map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent></Select>
          <Button variant="outline" size="icon" title="Refresh dashboard" aria-label="Refresh dashboard" onClick={refresh} disabled={query.isFetching || quarterly.isFetching}><RefreshCw className={query.isFetching ? 'animate-spin' : ''} /></Button>
        </div>
      </div>
      {query.isLoading ? <div role="status" className="flex min-h-72 items-center justify-center gap-3 text-muted-foreground"><RefreshCw className="h-5 w-5 animate-spin" />Loading dashboard…</div> : <>
        {!!query.data?.errors.length && <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">Could not load {query.data.errors.join(', ')}. Some figures are unavailable. <Button variant="link" onClick={refresh}>Retry</Button></div>}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{kpis.map(k => <div key={k.title} className={`flex min-w-0 items-start gap-4 rounded-lg border p-5 ${tones[k.tone]}`}><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-card/70"><k.icon className="h-6 w-6" /></div><div className="min-w-0"><h2 className="text-xs font-semibold">{k.title}</h2><p className="mt-1 text-3xl font-bold text-foreground">{k.value}</p><p className="mt-1.5 text-xs text-muted-foreground">{k.detail}</p></div></div>)}</div>
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          <DashboardPanel title="Attendance by Gender">
            {failed('events') ? <Empty text="Attendance unavailable" /> : metrics.genders.some(g => g.value > 0) ? <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="relative h-48 w-48 shrink-0"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={metrics.genders.filter(g => g.value > 0)} dataKey="value" innerRadius={58} outerRadius={86} paddingAngle={2} stroke="none" isAnimationActive={false}>{metrics.genders.map(g => g.value > 0 && <Cell key={g.name} fill={g.color} />)}</Pie><Tooltip contentStyle={tooltipStyle} /></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><span className="text-2xl font-bold">{format(metrics.attendance)}</span><span className="text-xs text-muted-foreground">Attendances</span></div></div>
              <div className="space-y-3">{metrics.genders.map(g => <div key={g.key} className="flex items-start gap-2"><span className={`mt-1 h-2.5 w-2.5 rounded-full dashboard-gender-${g.key}`} /><div className="text-xs"><span className="font-semibold">{g.name}</span><p className="mt-0.5 text-muted-foreground">{format(g.value)} ({percent(metrics.attendance ? g.value / metrics.attendance * 100 : null)})</p></div></div>)}</div>
            </div> : <Empty text="No attendance reported yet" />}
          </DashboardPanel>
          <DashboardPanel title="Attendance by Organisation">
            {failed('events') ? <Empty text="Attendance unavailable" /> : bars.length ? <><div className="h-56"><ResponsiveContainer width="100%" height="100%"><BarChart data={bars} margin={{ top: 8, right: 6, left: -20, bottom: 8 }}><CartesianGrid vertical={false} stroke="hsl(var(--border))" /><XAxis dataKey="name" tickFormatter={v => v.length > 16 ? `${v.slice(0, 15)}…` : v} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} interval={0} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--muted))' }} /><Bar dataKey="attendees" name="Attendances" radius={[3, 3, 0, 0]} maxBarSize={45} isAnimationActive={false}>{bars.map((r, i) => <Cell key={r.name} fill={chartColors[i % chartColors.length]} />)}</Bar></BarChart></ResponsiveContainer></div><p className="text-[11px] text-muted-foreground">Top five organisations · Shared events appear for each partner.</p></> : <Empty text="No organisation attendance yet" />}
          </DashboardPanel>
          <DashboardPanel title="Recent Updates" action={open('/activity-tracker')} className="lg:col-span-2 xl:col-span-1">
            {recent.length ? <Table><TableHeader><TableRow><TableHead className="h-9 px-2 text-xs">Date</TableHead><TableHead className="h-9 px-2 text-xs">Record</TableHead><TableHead className="h-9 px-2 text-xs">Type</TableHead></TableRow></TableHeader><TableBody>{recent.map((r, i) => <TableRow key={i}><TableCell className="whitespace-nowrap px-2 py-3 text-[11px]">{dateLabel(r.date)}</TableCell><TableCell className="px-2 py-3"><Button variant="link" className="h-auto max-w-44 whitespace-normal p-0 text-left text-xs" onClick={() => navigate(r.route)}><span className="line-clamp-2 break-words">{r.title}</span></Button></TableCell><TableCell className="px-2 py-3 text-[11px] text-muted-foreground">{r.type}</TableCell></TableRow>)}</TableBody></Table> : <Empty text="No dated updates yet" />}
          </DashboardPanel>
        </div>
        <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
          <DashboardPanel title="Trainings and Workshop Key Stats" action={<span className="text-xs text-muted-foreground">Avg engagement {metrics.avgEngagement?.toFixed(1) ?? '—'}/5 · Avg trainer {metrics.avgTrainer?.toFixed(1) ?? '—'}/5</span>}>
            {failed('events') ? <Empty text="Events unavailable" /> : rows.length ? <div className="max-h-80 overflow-auto"><Table className="min-w-[640px]"><TableHeader><TableRow>{sortHeader('name', 'Event')}{sortHeader('date', 'Date')}{sortHeader('attendees', 'Attendances')}{sortHeader('engagement', 'Engagement')}{sortHeader('trainer', 'Trainer')}{sortHeader('status', 'Report')}</TableRow></TableHeader><TableBody>{rows.map((r, i) => <TableRow key={r.id || i} className="cursor-pointer" onClick={() => navigate('/meetings')}><TableCell className="max-w-60 break-words py-3 text-xs"><span className="font-medium">{r.name}</span>{r.orgs && <p className="mt-0.5 text-[11px] text-muted-foreground">{r.orgs}</p>}</TableCell><TableCell className="whitespace-nowrap py-3 text-xs">{dateLabel(r.date)}</TableCell><TableCell className="py-3 text-xs">{format(r.attendees)}</TableCell><TableCell className="py-3 text-xs">{r.engagement ? `${r.engagement}/5` : '—'}</TableCell><TableCell className="py-3 text-xs">{r.trainer ? `${r.trainer}/5` : '—'}</TableCell><TableCell className={`py-3 text-xs font-medium ${r.status === 'Due' ? 'text-destructive' : r.status === 'Upcoming' ? 'text-muted-foreground' : 'text-primary'}`}>{r.status}</TableCell></TableRow>)}</TableBody></Table></div> : <Empty text="No events yet" />}
          </DashboardPanel>
          <DashboardPanel title="Quick Actions">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{[
              { title: 'Activity Tracker', sub: `${metrics.activities.length} activities`, icon: ClipboardList, route: '/activity-tracker' },
              { title: 'Indicator Tracker', sub: `${metrics.indicators.length} indicators`, icon: Target, route: '/performance' },
              { title: 'Event Schedule', sub: `${metrics.events.length} events`, icon: CalendarDays, route: '/meetings' },
              { title: 'Risk Register', sub: `${metrics.risks.length} risks`, icon: AlertTriangle, route: '/risk-register' },
            ].map(a => <Button key={a.route} variant="outline" className="h-auto min-h-20 justify-start whitespace-normal border-card-border/50 bg-card px-4 py-3 text-left hover:bg-secondary hover:text-secondary-foreground" onClick={() => navigate(a.route)}><a.icon className="mr-1 h-6 w-6 text-primary" /><span className="min-w-0"><span className="block text-xs font-semibold">{a.title}</span><span className="mt-1 block text-[11px] font-normal text-muted-foreground">{a.sub}</span></span></Button>)}</div>
          </DashboardPanel>
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          <DashboardPanel title="Indicator Performance" action={<Select value={year} onValueChange={setYear}><SelectTrigger aria-label="Indicator target year" className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger><SelectContent>{[1, 2, 3, 4, 5, 6].map(y => <SelectItem key={y} value={String(y)}>Year {y}</SelectItem>)}</SelectContent></Select>}>
            {failed('indicators') ? <Empty text="Indicators unavailable" /> : metrics.indicators.length ? <div className="max-h-72 overflow-auto"><Table><TableHeader><TableRow><TableHead className="text-xs">Indicator</TableHead><TableHead className="text-xs">Target</TableHead><TableHead className="text-xs">Annual Actual</TableHead><TableHead className="text-xs">Achievement</TableHead></TableRow></TableHeader><TableBody>{metrics.indicators.map((r: DashboardRecord, i) => { const annual = parseYearly(r.yearly_performance)[year]?.annual; const target = r[`target_year_${year}`]; return <TableRow key={r.id || i}><TableCell className="max-w-64 break-words py-3 text-xs">{r.name || 'Unnamed indicator'}</TableCell><TableCell className="max-w-36 break-words py-3 text-xs">{target || '—'}</TableCell><TableCell className="py-3 text-xs">{annual || '—'}</TableCell><TableCell className="py-3 text-xs font-semibold text-primary">{achievement(target, annual) || '—'}</TableCell></TableRow>; })}</TableBody></Table></div> : <Empty text="No indicators yet" />}
          </DashboardPanel>
          <DashboardPanel title={admin ? 'Quarterly Report Submissions' : 'Your Quarterly Reports'} action={quarterly.data?.length ? open('/quarterly-report') : undefined}>
            {quarterly.isPending ? <Empty text="Loading reports…" /> : quarterly.isError ? <Empty text="Quarterly reports unavailable" /> : !quarterly.data?.length ? <Empty text="No published quarterly reports" /> : <div className="max-h-72 space-y-4 overflow-auto">{quarterly.data.map(report => {
              const names = admin ? (organisation === 'all' ? metrics.orgNames : [organisation]) : user?.organization ? [user.organization] : [];
              const responses = report.responses.filter((r: DashboardRecord) => names.some(n => n.toLowerCase() === String(r.organisation).toLowerCase()));
              const submitted = responses.filter((r: DashboardRecord) => r.status === 'Submitted').length;
              const drafts = responses.filter((r: DashboardRecord) => r.status === 'Draft').length;
              return <div key={report.id} className="border-b border-border pb-4 last:border-0 last:pb-0"><div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-semibold">{report.title}</h3><p className="mt-1 text-xs text-muted-foreground">{report.quarter} {report.dueDate && `· Due ${dateLabel(report.dueDate)}`}</p></div><ClipboardCheck className="h-5 w-5 shrink-0 text-primary" /></div><div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs"><span className="text-muted-foreground">Not started <strong className="ml-1 text-foreground">{Math.max(0, names.length - submitted - drafts)}</strong></span><span className="text-warning">Draft <strong className="ml-1">{drafts}</strong></span><span className="text-primary">Submitted <strong className="ml-1">{submitted}</strong></span></div></div>;
            })}</div>}
          </DashboardPanel>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-[11px] text-muted-foreground"><span className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5" />{organisation === 'all' ? 'All organisations' : organisation} · Attendance counts event participation, not unique people.</span><span>Updated {query.dataUpdatedAt ? new Date(query.dataUpdatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—'}</span></div>
      </>}
    </div>
  </div>;
}