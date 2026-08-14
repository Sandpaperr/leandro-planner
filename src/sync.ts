// Supabase sync on top of the local-first store (storage.ts).
// Configured via VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY; when those are
// absent the app runs local-only and every function here is a safe no-op.

import { createClient } from "@supabase/supabase-js";
import type { Session } from "@supabase/supabase-js";
import { allDocs, loadDoc, saveDoc } from "./storage";
import type { DocData, StoredDoc } from "./storage";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
export const syncConfigured = supabase !== null;

export type { Session };

export function onSession(callback: (session: Session | null) => void): () => void {
  if (!supabase) {
    callback(null);
    return () => {};
  }
  supabase.auth.getSession().then(({ data }) => callback(data.session));
  const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => sub.subscription.unsubscribe();
}

export async function sendMagicLink(email: string): Promise<string | null> {
  if (!supabase) return "Sync is not configured";
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  });
  return error ? error.message : null;
}

export async function signOut(): Promise<void> {
  await supabase?.auth.signOut();
}

type EntryRow = { key: string; data: DocData; updated_at: string };

// Two-way merge: for every key present locally or remotely, the newer
// updated_at wins. Returns keys whose LOCAL copy changed (caller re-hydrates).
export async function syncAll(userId: string): Promise<{ changedLocal: string[]; error: string | null }> {
  if (!supabase) return { changedLocal: [], error: null };

  const { data: rows, error } = await supabase
    .from("entries")
    .select("key, data, updated_at")
    .eq("user_id", userId);
  if (error) return { changedLocal: [], error: error.message };

  const remote = new Map<string, EntryRow>((rows ?? []).map((r: EntryRow) => [r.key, r]));
  const local = new Map<string, StoredDoc>(allDocs().map((d) => [d.key, d]));
  const changedLocal: string[] = [];
  const toPush: EntryRow[] = [];

  const keys = new Set([...remote.keys(), ...local.keys()]);
  for (const key of keys) {
    const r = remote.get(key);
    const l = local.get(key);
    if (r && (!l || l.updated_at < r.updated_at)) {
      saveDoc(key, r.data, r.updated_at);
      changedLocal.push(key);
    } else if (l && (!r || r.updated_at < l.updated_at)) {
      toPush.push({ key: l.key, data: l.data, updated_at: l.updated_at });
    }
  }

  if (toPush.length > 0) {
    const { error: pushError } = await supabase
      .from("entries")
      .upsert(toPush.map((row) => ({ ...row, user_id: userId })), { onConflict: "user_id,key" });
    if (pushError) return { changedLocal, error: pushError.message };
  }
  return { changedLocal, error: null };
}

// Push a single doc after a local save. Fire-and-forget from the autosave path.
export async function pushDoc(userId: string, key: string): Promise<string | null> {
  if (!supabase) return null;
  const doc = loadDoc(key);
  if (!doc) return null;
  const { error } = await supabase
    .from("entries")
    .upsert({ user_id: userId, key: doc.key, data: doc.data, updated_at: doc.updated_at }, { onConflict: "user_id,key" });
  return error ? error.message : null;
}
