import { useCallback, useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type SortDir = "asc" | "desc";

type Getter<T> = (row: T) => unknown;

const DATE_RE = /^\d{4}-\d{2}-\d{2}/;
const NUMERIC_TEXT_RE = /^-?[\d.,\s$€£%]+$/;

/** Turn a cell value into something comparable: numbers stay numbers, dates
 *  become timestamps, plain text stays lower-cased text. */
function toComparable(v: unknown): number | string {
  if (v === null || v === undefined) return "";
  if (typeof v === "number") return Number.isFinite(v) ? v : "";
  if (v instanceof Date) return v.getTime();
  const s = String(v).trim();
  if (s === "") return "";
  if (DATE_RE.test(s)) {
    const t = new Date(s).getTime();
    if (Number.isFinite(t)) return t;
  }
  if (NUMERIC_TEXT_RE.test(s)) {
    const n = Number(s.replace(/[^0-9.\-]/g, ""));
    if (Number.isFinite(n)) return n;
  }
  return s.toLowerCase();
}

function compare(a: unknown, b: unknown): number {
  const av = toComparable(a);
  const bv = toComparable(b);
  if (typeof av === "number" && typeof bv === "number") return av - bv;
  return String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: "base" });
}

export interface SortHeadProps {
  /** The column this header sorts on. */
  sortKey: string;
  children: ReactNode;
  className?: string;
  /** Hide the arrow (use for columns that should not be sortable). */
  static?: boolean;
}

export interface UseTableSortResult<T> {
  /** Rows in the current sort order. */
  sorted: T[];
  sortKey: string | null;
  sortDir: SortDir;
  toggleSort: (key: string) => void;
  /** Drop-in replacement for <TableHead> — adds a click handler and a sort arrow. */
  SortHead: (props: SortHeadProps) => ReactNode;
}

/**
 * Generic client-side sorting for any table.
 *
 *   const { sorted, SortHead } = useTableSort(rows, { getters: { score: r => r.score } });
 *
 * Pass `getters` for computed columns (risk score, achievement %, totals).
 */
export function useTableSort<T>(
  rows: T[],
  options?: { initialKey?: string; initialDir?: SortDir; getters?: Record<string, Getter<T>> },
): UseTableSortResult<T> {
  const { initialKey = null, initialDir = "asc", getters } = options ?? {};
  const [sortKey, setSortKey] = useState<string | null>(initialKey);
  const [sortDir, setSortDir] = useState<SortDir>(initialDir);

  const toggleSort = useCallback((key: string) => {
    setSortKey((current) => {
      if (current === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return current;
      }
      setSortDir("asc");
      return key;
    });
  }, []);

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const read: Getter<T> = (row) => getters?.[sortKey]?.(row) ?? (row as Record<string, unknown>)?.[sortKey];
    return [...rows].sort((a, b) => {
      const result = compare(read(a), read(b));
      return sortDir === "asc" ? result : -result;
    });
    // getters is a stable object literal in practice; re-running on rows/sort is enough.
  }, [rows, sortKey, sortDir, getters]);

  const SortHead = useCallback(
    ({ sortKey: key, children, className, static: isStatic }: SortHeadProps) => {
      if (isStatic) return <TableHead className={className}>{children}</TableHead>;
      const active = sortKey === key;
      return (
        <TableHead
          className={cn("cursor-pointer select-none whitespace-nowrap transition-colors hover:text-primary", className)}
          onClick={() => toggleSort(key)}
          aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
          title={`Sort by ${typeof children === "string" ? children : "this column"}`}
        >
          <span className="inline-flex items-center gap-1">
            {children}
            {active ? (
              sortDir === "asc" ? (
                <ArrowUp className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
              ) : (
                <ArrowDown className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
              )
            ) : (
              <ArrowUpDown className="h-3 w-3 shrink-0 opacity-40" aria-hidden="true" />
            )}
          </span>
        </TableHead>
      );
    },
    [sortKey, sortDir, toggleSort],
  );

  return { sorted, sortKey, sortDir, toggleSort, SortHead };
}
