import { ReactNode } from 'react';

export function DashboardPanel({ title, action, children, className = '' }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`min-w-0 rounded-lg border border-card-border/60 bg-card p-5 shadow-xs ${className}`}>
    <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-sm font-semibold text-secondary-foreground">{title}</h2>{action}</div>
    {children}
  </section>;
}