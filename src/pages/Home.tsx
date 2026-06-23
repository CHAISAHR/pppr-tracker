import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, BarChart3, Calendar, Target, Building2 } from "lucide-react";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { getLogo } from "@/lib/orgLogos";

// Partner categories are derived positionally from the Admin > Organisations list:
// 1st row = Funder, next 3 = Government Departments, next 3 = Implementing Entities,
// remainder = Delivery Partners. Edit the order on the Organisations admin page to change groupings.
const CATEGORY_SLICES: { label: string; take: number }[] = [
  { label: "Funder", take: 1 },
  { label: "Government Departments", take: 3 },
  { label: "Implementing Entities", take: 3 },
  { label: "Delivery Partners", take: Infinity },
];

// Deterministic colour swatch per organisation (uses theme tokens).
const SWATCHES = [
  "bg-primary/10 text-primary border-primary/20",
  "bg-secondary text-secondary-foreground border-secondary",
  "bg-accent/15 text-accent-foreground border-accent/30",
  "bg-muted text-foreground border-border",
];

function initialsOf(name: string) {
  return name
    .replace(/[^a-zA-Z ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 3)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function hashIdx(s: string, mod: number) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % mod;
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orgs, setOrgs] = useState<string[]>([]);
  const [, setLogoTick] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getOrganisations();
        const names: string[] = (data || [])
          .map((o: any) => o?.name)
          .filter((n: string) => !!n);
        setOrgs(names);
      } catch {
        setOrgs([]);
      }
    })();
    const onChange = () => setLogoTick((t) => t + 1);
    window.addEventListener("org-logos-changed", onChange);
    return () => window.removeEventListener("org-logos-changed", onChange);
  }, []);

  const groups = (() => {
    const out: { label: string; items: string[] }[] = [];
    let i = 0;
    for (const { label, take } of CATEGORY_SLICES) {
      const end = take === Infinity ? orgs.length : Math.min(i + take, orgs.length);
      const items = orgs.slice(i, end);
      if (items.length) out.push({ label, items });
      i = end;
      if (i >= orgs.length) break;
    }
    return out;
  })();

  return (
    <div className="min-h-full bg-gradient-to-b from-background via-background to-secondary/30">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 -z-10 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6 border border-primary/20">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Monitoring &amp; Evaluation Platform
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-[1.05] text-foreground max-w-4xl mx-auto">
            One place to track every activity, indicator and event across our partner network.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The M&amp;E Reporting Tool brings together {orgs.length}+ organisations to plan, monitor
            and report on shared programmes &mdash; transparently and in real time.
          </p>
          <div className="mt-9 flex flex-wrap gap-3 justify-center">
            <Button size="lg" className="gap-2" onClick={() => navigate(user ? "/activity-tracker" : "/auth")}>
              {user ? "Open Activity Tracker" : "Sign in to get started"}
              <ArrowRight className="h-4 w-4" />
            </Button>
            {!user && (
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
                Request access
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* What it does */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-20 text-center">
        <div className="mb-10">
          <h2 className="font-heading text-2xl md:text-3xl font-bold tracking-tight mb-3">What the tool does</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Three connected modules that help partners plan, track and report on shared priorities.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5 text-left">
          {[
            { icon: BarChart3, title: "Activity Tracker", desc: "Capture every project activity, delivery partner and milestone in a single source of truth." },
            { icon: Target, title: "Indicator Tracker", desc: "Quantitative metrics with Q1–Q4 roll-up, free-text targets and external evidence links." },
            { icon: Calendar, title: "Event Schedule", desc: "Plan workshops and meetings, run pre/post surveys and generate QR sign-ins." },
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="p-6 border-border/60 hover:border-primary/40 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-lg font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Partner organisations */}
      <section className="border-t border-border/60 bg-card/40">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="inline-flex items-center gap-2 text-primary text-xs font-medium uppercase tracking-wider mb-3">
              <Building2 className="h-3.5 w-3.5" />
              Our partners
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Our partner network
            </h2>
          </div>

          {orgs.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              Partner organisations will appear here once added in the Administration panel.
            </p>
          ) : (
            <div className="space-y-10">
              {groups.map(({ label, items }) => (
                <div key={label}>
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
                      {label}
                    </h3>
                    <div className="flex-1 h-px bg-border/60" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {items.map((name) => {
                      const swatch = SWATCHES[hashIdx(name, SWATCHES.length)];
                      return (
                        <div
                          key={name}
                          title={name}
                          className={`aspect-[4/3] rounded-xl border ${swatch} flex flex-col items-center justify-center p-3 text-center transition-transform hover:-translate-y-0.5`}
                        >
                          <span className="font-heading text-xl font-bold leading-none">
                            {initialsOf(name) || "•"}
                          </span>
                          <span className="mt-2 text-[10px] font-medium opacity-80 line-clamp-2 leading-tight">
                            {name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="max-w-6xl mx-auto px-6 py-8 text-xs text-muted-foreground text-center">
          <span>© {new Date().getFullYear()} M&amp;E Reporting Tool</span>
          <span className="mx-2">·</span>
          <span>Built for transparent, collaborative reporting.</span>
        </div>
      </footer>
    </div>
  );
}
