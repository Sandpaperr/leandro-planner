import { useMemo, useRef, useState } from "react";
import {
  WHEEL_DOMAINS, OUTCOME_SECTIONS, QUARTERLY_PARTS, WEEKLY_PHASES,
} from "./content";
import { allDocs, labelForKey, exportAll, importAll } from "./storage";
import type { StoredDoc } from "./storage";

const SPARK_WEEKS = 12; // points shown per trend tile

type Scores = Record<string, number>;
const num = (v: unknown): number | undefined => (typeof v === "number" && v >= 1 && v <= 10 ? v : undefined);
const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

function docScores(doc: StoredDoc): Scores {
  const raw = (doc.data.scores ?? {}) as Record<string, unknown>;
  const out: Scores = {};
  for (const d of WHEEL_DOMAINS) {
    const v = num(raw[d]);
    if (v !== undefined) out[d] = v;
  }
  return out;
}

function avgScore(scores: Scores): number | undefined {
  const vals = Object.values(scores);
  if (vals.length === 0) return undefined;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}

/* Single-series sparkline: de-emphasised 2px line, latest point in the accent
   with a surface ring. Fixed 1–10 domain so week-to-week shapes are comparable. */
function Sparkline({ series, labels }: { series: Array<number | undefined>; labels: string[] }) {
  const W = 132, H = 36, PAD = 5;
  const n = series.length;
  const x = (i: number) => (n <= 1 ? W / 2 : PAD + (i * (W - 2 * PAD)) / (n - 1));
  const y = (v: number) => H - PAD - ((v - 1) / 9) * (H - 2 * PAD);

  const segments: string[] = [];
  let current: string[] = [];
  series.forEach((v, i) => {
    if (v === undefined) {
      if (current.length > 1) segments.push(current.join(" "));
      current = [];
    } else {
      current.push(`${x(i).toFixed(1)},${y(v).toFixed(1)}`);
    }
  });
  if (current.length > 1) segments.push(current.join(" "));

  let lastIdx = -1;
  series.forEach((v, i) => { if (v !== undefined) lastIdx = i; });

  return (
    <svg className="spark-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Score trend">
      {segments.map((pts, i) => (
        <polyline key={i} points={pts} fill="none" stroke="#A8A298" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {series.map((v, i) =>
        v === undefined ? null : (
          <circle key={i} cx={x(i)} cy={y(v)} r={i === lastIdx ? 4 : 2.5}
            fill={i === lastIdx ? "#9A6E2A" : "#A8A298"}
            stroke="#FFFFFF" strokeWidth={i === lastIdx ? 2 : 1.5}>
            <title>{`${labels[i]}: ${v}`}</title>
          </circle>
        )
      )}
    </svg>
  );
}

function Delta({ curr, prev }: { curr: number | undefined; prev: number | undefined }) {
  if (curr === undefined || prev === undefined) return <span className="spark-delta">—</span>;
  const d = Math.round((curr - prev) * 10) / 10;
  if (d === 0) return <span className="spark-delta">= same</span>;
  return (
    <span className={`spark-delta ${d > 0 ? "up" : "down"}`}>
      {d > 0 ? "▲" : "▼"} {d > 0 ? "+" : ""}{d} vs prev
    </span>
  );
}

/* One question–answer row in an archive entry; renders nothing when empty. */
function QA({ q, a }: { q: string; a: string }) {
  if (!a) return null;
  return (
    <div className="report-qa">
      <p className="report-q">{q}</p>
      <p className="report-a">{a}</p>
    </div>
  );
}

function ScoresLine({ scores }: { scores: Scores }) {
  const entries = WHEEL_DOMAINS.filter((d) => scores[d] !== undefined);
  if (entries.length === 0) return null;
  return (
    <div className="report-qa">
      <p className="report-q">Wheel scores</p>
      <p className="report-a report-scores">
        {entries.map((d) => (
          <span key={d} className="report-score-chip">{d} <strong>{scores[d]}</strong></span>
        ))}
      </p>
    </div>
  );
}

function WeeklyEntry({ doc }: { doc: StoredDoc }) {
  const answers = (doc.data.answers ?? {}) as Record<string, string>;
  const big3 = (doc.data.big3 ?? []) as string[];
  const scores = docScores(doc);
  const avg = avgScore(scores);
  const big3Filled = big3.filter((b) => str(b));
  return (
    <details className="report-acc">
      <summary>
        <span className="report-acc-title">{labelForKey(doc.key)}</span>
        <span className="report-acc-meta">
          {avg !== undefined ? `wheel avg ${avg}` : ""}{avg !== undefined && big3Filled.length > 0 ? " · " : ""}
          {big3Filled.length > 0 ? `${big3Filled.length} big-3 set` : ""}
        </span>
      </summary>
      <div className="report-acc-body">
        {big3Filled.length > 0 && (
          <div className="report-qa">
            <p className="report-q">Weekly Big 3</p>
            {big3Filled.map((b, i) => <p className="report-a" key={i}>{i + 1}. {b}</p>)}
          </div>
        )}
        {WEEKLY_PHASES.map((phase) =>
          phase.items.map((item) => {
            if (item.type === "text") return <QA key={item.number} q={item.question!} a={str(answers[item.number])} />;
            if (item.type === "multi" || item.type === "wheel") {
              return (
                <div key={item.number}>
                  {item.type === "wheel" && <ScoresLine scores={scores} />}
                  {(item.questions ?? []).map((q, qi) => (
                    <QA key={qi} q={q} a={str(answers[`${item.number}-${qi}`])} />
                  ))}
                </div>
              );
            }
            return null;
          })
        )}
      </div>
    </details>
  );
}

function QuarterlyEntry({ doc }: { doc: StoredDoc }) {
  const answers = (doc.data.answers ?? {}) as Record<string, string>;
  const costAnswers = (doc.data.costAnswers ?? {}) as Record<string, string>;
  const outcomes = (doc.data.outcomes ?? []) as Array<Record<string, string>>;
  const scores = docScores(doc);
  const avg = avgScore(scores);
  const named = outcomes.filter((o) => str(o.label));
  return (
    <details className="report-acc">
      <summary>
        <span className="report-acc-title">{labelForKey(doc.key)}</span>
        <span className="report-acc-meta">
          {named.length > 0 ? named.map((o) => o.label).join(" · ") : avg !== undefined ? `wheel avg ${avg}` : ""}
        </span>
      </summary>
      <div className="report-acc-body">
        {outcomes.map((o, oi) => {
          const filled = OUTCOME_SECTIONS.filter((s) => str(o[s.key]));
          if (filled.length === 0 && !str(o.label)) return null;
          return (
            <div className="report-outcome" key={oi}>
              <p className="report-outcome-title">0{oi + 1} — {str(o.label) || `Outcome ${oi + 1}`}</p>
              {filled.map((s) => <QA key={s.key} q={s.label} a={str(o[s.key])} />)}
            </div>
          );
        })}
        {QUARTERLY_PARTS.map((part) =>
          part.items.map((item) => {
            if (item.type === "text") return <QA key={item.number} q={item.question!} a={str(answers[item.number])} />;
            if (item.type === "multi") {
              return (item.questions ?? []).map((q, qi) => (
                <QA key={`${item.number}-${qi}`} q={q} a={str(answers[`${item.number}-${qi}`])} />
              ));
            }
            if (item.type === "wheel") return <ScoresLine key={item.number} scores={scores} />;
            if (item.type === "cost") {
              return WHEEL_DOMAINS.filter((d) => str(costAnswers[d])).map((d) => (
                <QA key={`cost-${d}`} q={`The cost of staying at ${d} ${scores[d] ?? ""}`} a={str(costAnswers[d])} />
              ));
            }
            if (item.type === "declaration") {
              return [0, 1, 2].map((j) => (
                <QA key={`${item.number}-${j}`} q={`Declaration 0${j + 1}`} a={str(answers[`${item.number}-${j}`])} />
              ));
            }
            return null;
          })
        )}
      </div>
    </details>
  );
}

function DailyEntry({ doc }: { doc: StoredDoc }) {
  const morning = (doc.data.morning ?? {}) as Record<string, string>;
  const evening = (doc.data.evening ?? {}) as Record<string, string>;
  const big3 = [1, 2, 3].map((i) => ({ task: str(morning[`b${i}`]), time: str(morning[`t${i}`]) })).filter((b) => b.task);
  return (
    <details className="report-acc">
      <summary>
        <span className="report-acc-title">{labelForKey(doc.key)}</span>
        <span className="report-acc-meta">{str(evening.win) || (big3.length > 0 ? big3[0].task : "")}</span>
      </summary>
      <div className="report-acc-body">
        {big3.length > 0 && (
          <div className="report-qa">
            <p className="report-q">Daily Big 3</p>
            {big3.map((b, i) => (
              <p className="report-a" key={i}>{i + 1}. {b.task}{b.time ? ` — ${b.time}` : ""}</p>
            ))}
          </div>
        )}
        <QA q="One Win" a={str(evening.win)} />
        <QA q="One Adjustment" a={str(evening.adjust)} />
        <QA q="Tomorrow's First Move" a={str(evening.first)} />
      </div>
    </details>
  );
}

export default function Report() {
  const [importMessage, setImportMessage] = useState("");
  const [refresh, setRefresh] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const { dailies, weeklies, quarterlies } = useMemo(() => ({
    dailies: allDocs("daily").reverse(),
    weeklies: allDocs("weekly").reverse(),
    quarterlies: allDocs("quarterly").reverse(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [refresh]);

  // Trend data: chronological weekly docs, capped to the last SPARK_WEEKS.
  const trendDocs = useMemo(() => [...weeklies].reverse().slice(-SPARK_WEEKS), [weeklies]);
  const trendLabels = trendDocs.map((d) => labelForKey(d.key));
  const trendScores = trendDocs.map(docScores);

  const empty = dailies.length + weeklies.length + quarterlies.length === 0;

  const onExport = () => {
    const blob = new Blob([exportAll()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `planner-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImportFile = async (file: File) => {
    try {
      const written = importAll(await file.text());
      setImportMessage(written > 0 ? `Imported ${written} entr${written === 1 ? "y" : "ies"}.` : "Nothing newer to import.");
      setRefresh((r) => r + 1);
    } catch {
      setImportMessage("That file doesn't look like a planner export.");
    }
  };

  return (
    <div>
      {empty ? (
        <p className="report-empty">
          Nothing stored yet. Entries save automatically as you write — fill in a daily, weekly or
          quarterly session and it will appear here.
        </p>
      ) : (
        <>
          {trendDocs.length > 0 && (
            <>
              <div className="phase-header">
                <span className="phase-eyebrow">Trends</span>
                <span className="phase-title">Wheel of Life</span>
                <span className="phase-time">last {trendDocs.length} weekly pulse{trendDocs.length === 1 ? "" : "s"}</span>
              </div>
              <div className="report-grid">
                <div className="spark-tile spark-tile-avg">
                  <p className="spark-label">Overall average</p>
                  <div className="spark-row">
                    <span className="spark-value">{avgScore(trendScores[trendScores.length - 1] ?? {}) ?? "—"}</span>
                    <Delta
                      curr={avgScore(trendScores[trendScores.length - 1] ?? {})}
                      prev={avgScore(trendScores[trendScores.length - 2] ?? {})}
                    />
                  </div>
                  <Sparkline series={trendScores.map(avgScore)} labels={trendLabels} />
                </div>
                {WHEEL_DOMAINS.map((domain) => {
                  const series = trendScores.map((s) => s[domain]);
                  const defined = series.filter((v): v is number => v !== undefined);
                  const curr = defined[defined.length - 1];
                  const prev = defined[defined.length - 2];
                  return (
                    <div className="spark-tile" key={domain}>
                      <p className="spark-label">{domain}</p>
                      <div className="spark-row">
                        <span className="spark-value">{curr ?? "—"}</span>
                        <Delta curr={curr} prev={prev} />
                      </div>
                      <Sparkline series={series} labels={trendLabels} />
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {quarterlies.length > 0 && (
            <>
              <div className="phase-header">
                <span className="phase-eyebrow">Archive</span>
                <span className="phase-title">Quarterly</span>
                <span className="phase-time">{quarterlies.length} session{quarterlies.length === 1 ? "" : "s"}</span>
              </div>
              {quarterlies.map((doc) => <QuarterlyEntry key={doc.key} doc={doc} />)}
            </>
          )}

          {weeklies.length > 0 && (
            <>
              <div className="phase-header">
                <span className="phase-eyebrow">Archive</span>
                <span className="phase-title">Weekly</span>
                <span className="phase-time">{weeklies.length} session{weeklies.length === 1 ? "" : "s"}</span>
              </div>
              {weeklies.map((doc) => <WeeklyEntry key={doc.key} doc={doc} />)}
            </>
          )}

          {dailies.length > 0 && (
            <>
              <div className="phase-header">
                <span className="phase-eyebrow">Archive</span>
                <span className="phase-title">Daily</span>
                <span className="phase-time">{dailies.length} entr{dailies.length === 1 ? "y" : "ies"}</span>
              </div>
              {dailies.map((doc) => <DailyEntry key={doc.key} doc={doc} />)}
            </>
          )}
        </>
      )}

      <div className="phase-header">
        <span className="phase-eyebrow">Data</span>
        <span className="phase-title">Backup</span>
      </div>
      <div className="report-data-row">
        <button className="print-btn" onClick={onExport}>⤓ Export JSON</button>
        <button className="print-btn" onClick={() => fileRef.current?.click()}>⤒ Import JSON</button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onImportFile(f);
            e.target.value = "";
          }}
        />
        {importMessage && <span className="report-import-msg">{importMessage}</span>}
      </div>
    </div>
  );
}
