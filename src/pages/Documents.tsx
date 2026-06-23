import { useEffect, useMemo, useState } from "react";
import { FileText, ExternalLink, Search, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Meeting } from "@/components/MeetingDetailsDialog";

interface DocRow {
  meetingId: string;
  focusArea: string;
  meetingDate: string;
  quarter: string;
  label: string;
  url: string;
}

const parseAttachments = (m: Meeting): DocRow[] => {
  if (!m.attachments) return [];
  return m.attachments
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean)
    .map(line => {
      const [labelOrUrl, maybeUrl] = line.split("|").map(s => s.trim());
      const url = maybeUrl || labelOrUrl;
      const label = maybeUrl ? labelOrUrl : labelOrUrl;
      return {
        meetingId: m.id,
        focusArea: m.focusArea,
        meetingDate: m.meetingDate,
        quarter: m.quarter,
        label,
        url,
      };
    });
};

export default function Documents() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("meetings");
    if (saved) setMeetings(JSON.parse(saved));
  }, []);

  const docs = useMemo(() => {
    const all = meetings.flatMap(parseAttachments);
    if (!search) return all;
    const q = search.toLowerCase();
    return all.filter(
      d =>
        d.label.toLowerCase().includes(q) ||
        d.focusArea.toLowerCase().includes(q) ||
        d.url.toLowerCase().includes(q)
    );
  }, [meetings, search]);

  return (
    <div className="min-h-full bg-background">
      <div className="container mx-auto py-8 px-4 sm:px-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Documents</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              All event documentation uploaded by partners — pre and post event.
            </p>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents, events, URLs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {docs.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <FileText className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No documents yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Documents will appear here as partners add attachment links to events.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-xl border border-border/60 bg-card overflow-hidden divide-y">
            {docs.map((d, idx) => (
              <a
                key={`${d.meetingId}-${idx}`}
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 px-5 py-3 hover:bg-primary/5 transition-colors group"
              >
                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary truncate">
                    {d.label}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{d.url}</p>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-xs font-medium text-foreground truncate max-w-[220px]">
                    {d.focusArea}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    {d.quarter && <Badge variant="outline" className="text-[10px] font-normal">{d.quarter}</Badge>}
                    {d.meetingDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(d.meetingDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
