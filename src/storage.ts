// Local-first persistence. Every planner entry is a "doc" keyed by its period
// (daily-2026-08-14, weekly-2026-W33, quarterly-2026-Q3) and stored in
// localStorage immediately; sync.ts mirrors docs to Supabase when configured.

const LS_PREFIX = "planner:v1:";

export type DocData = Record<string, unknown>;

export type StoredDoc = {
  key: string;
  data: DocData;
  updated_at: string; // ISO timestamp, used for last-write-wins merging
};

/* ---------- period keys ---------- */

const pad = (n: number) => String(n).padStart(2, "0");

export function dailyKey(d: Date = new Date()): string {
  return `daily-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// ISO-8601 week: weeks start Monday; week 1 contains the first Thursday.
export function isoWeek(d: Date = new Date()): { year: number; week: number } {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: date.getUTCFullYear(), week };
}

export function weeklyKey(d: Date = new Date()): string {
  const { year, week } = isoWeek(d);
  return `weekly-${year}-W${pad(week)}`;
}

export function quarterlyKey(d: Date = new Date()): string {
  return `quarterly-${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "weekly-2026-W33" -> "Week 33 · 2026", etc.
export function labelForKey(key: string): string {
  let m = key.match(/^daily-(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
  m = key.match(/^weekly-(\d{4})-W(\d{2})$/);
  if (m) return `Week ${Number(m[2])} · ${m[1]}`;
  m = key.match(/^quarterly-(\d{4})-Q(\d)$/);
  if (m) return `Q${m[2]} ${m[1]}`;
  return key;
}

// Sortable stamp so mixed keys order chronologically within their kind.
export function sortStamp(key: string): string {
  return key.replace(/^(daily|weekly|quarterly)-/, "");
}

/* ---------- local store ---------- */

export function loadDoc(key: string): StoredDoc | null {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !parsed.data) return null;
    return { key, data: parsed.data, updated_at: parsed.updated_at || new Date(0).toISOString() };
  } catch {
    return null;
  }
}

export function saveDoc(key: string, data: DocData, updatedAt?: string): StoredDoc {
  const doc = { key, data, updated_at: updatedAt || new Date().toISOString() };
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify({ data: doc.data, updated_at: doc.updated_at }));
  } catch {
    // Quota exceeded or storage unavailable — the in-memory state still works.
  }
  return doc;
}

export function allDocs(kind?: "daily" | "weekly" | "quarterly"): StoredDoc[] {
  const docs: StoredDoc[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k || !k.startsWith(LS_PREFIX)) continue;
    const key = k.slice(LS_PREFIX.length);
    if (kind && !key.startsWith(kind + "-")) continue;
    const doc = loadDoc(key);
    if (doc) docs.push(doc);
  }
  return docs.sort((a, b) => sortStamp(a.key).localeCompare(sortStamp(b.key)));
}

// True when a doc holds nothing worth persisting (avoids writing empty entries
// for every day the app is merely opened).
export function isEmptyDeep(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (typeof value === "number") return false;
  if (typeof value === "boolean") return !value;
  if (Array.isArray(value)) return value.every(isEmptyDeep);
  if (typeof value === "object") return Object.values(value as object).every(isEmptyDeep);
  return false;
}

/* ---------- export / import ---------- */

export function exportAll(): string {
  return JSON.stringify(
    { app: "leandro-planner", version: 1, exported_at: new Date().toISOString(), docs: allDocs() },
    null,
    2
  );
}

// Merges an exported file back in; newer timestamp wins per doc.
// Returns the number of docs written.
export function importAll(json: string): number {
  const parsed = JSON.parse(json);
  const docs: StoredDoc[] = Array.isArray(parsed) ? parsed : parsed?.docs;
  if (!Array.isArray(docs)) throw new Error("Not a planner export file");
  let written = 0;
  for (const doc of docs) {
    if (!doc || typeof doc.key !== "string" || !doc.data) continue;
    const existing = loadDoc(doc.key);
    const incoming = doc.updated_at || new Date(0).toISOString();
    if (!existing || existing.updated_at < incoming) {
      saveDoc(doc.key, doc.data, incoming);
      written++;
    }
  }
  return written;
}
