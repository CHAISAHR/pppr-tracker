import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Opt = { id: string; desc: string };
const NONE = '__none__';
const pick = (r: any, ...keys: string[]) => String(keys.map(k => r[k]).find(v => v != null && String(v).trim() !== '') ?? '').trim();

function uniq(list: Opt[]) {
  const map = new Map<string, Opt>();
  list.forEach(o => { if (o.id && !map.has(o.id)) map.set(o.id, o); });
  return [...map.values()].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
}

export function ActivityIdPicker({ prefix, activityId, subActivityId, onChange }: {
  prefix: string; activityId: string; subActivityId: string;
  onChange: (v: { activityId: string; subActivityId: string }) => void;
}) {
  const { data: projects = [] } = useQuery({ queryKey: ['activity-id-options'], queryFn: () => api.getProjects() });
  const rows = projects.map((r: any) => ({
    a: pick(r, 'activity_id', 'activityId'), ad: pick(r, 'activity_description', 'activityDescription'),
    s: pick(r, 'sub_activity_id', 'subActivityId'), sd: pick(r, 'sub_activity_description', 'subActivityDescription'),
  }));
  const acts = uniq([...rows.map(r => ({ id: r.a, desc: r.ad })), { id: activityId, desc: '' }]);
  const subs = uniq([...rows.filter(r => !activityId || r.a === activityId).map(r => ({ id: r.s, desc: r.sd })), { id: subActivityId, desc: '' }]);
  const item = (o: Opt) => <SelectItem key={o.id} value={o.id} textValue={o.id}>
    <span className="font-medium">{o.id}</span>{o.desc && <span className="ml-2 block max-w-[22rem] whitespace-normal text-xs text-muted-foreground">{o.desc}</span>}
  </SelectItem>;
  // SelectValue renders only the selected id, not the description.
  return <>
    <div className="space-y-2">
      <Label htmlFor={`${prefix}-activityId`}>Activity ID</Label>
      <Select value={activityId || NONE} onValueChange={v => { const id = v === NONE ? '' : v; onChange({ activityId: id, subActivityId: id === activityId ? subActivityId : '' }); }}>
        <SelectTrigger id={`${prefix}-activityId`}><SelectValue placeholder="Select activity">{activityId || 'Select activity'}</SelectValue></SelectTrigger>
        <SelectContent className="max-h-72"><SelectItem value={NONE}>None</SelectItem>{acts.map(item)}</SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label htmlFor={`${prefix}-subActivityId`}>Sub-Activity ID</Label>
      <Select value={subActivityId || NONE} onValueChange={v => onChange({ activityId, subActivityId: v === NONE ? '' : v })}>
        <SelectTrigger id={`${prefix}-subActivityId`}><SelectValue placeholder="Select sub-activity">{subActivityId || 'Select sub-activity'}</SelectValue></SelectTrigger>
        <SelectContent className="max-h-72"><SelectItem value={NONE}>None</SelectItem>{subs.map(item)}</SelectContent>
      </Select>
    </div>
  </>;
}
