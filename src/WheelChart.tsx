import { useRef, useState } from "react";

type WheelChartProps = {
  domains: string[];
  scores: Record<string, number>;
  onChange: (domain: string, value: number) => void;
};

// Geometry of the radar chart.
const SIZE_W = 600;
const SIZE_H = 460;
const CX = 300;
const CY = 215;
const R = 150;
const LABEL_R = R + 26;
const LEVELS = 10;

const TAU = Math.PI * 2;

// Each domain gets an axis, starting at the top and going clockwise.
function axisAngle(i: number, n: number) {
  return -Math.PI / 2 + (i / n) * TAU;
}

function pointAt(angle: number, radius: number) {
  return {
    x: CX + Math.cos(angle) * radius,
    y: CY + Math.sin(angle) * radius,
  };
}

// Break a long domain name into at most two balanced lines for the labels.
function wrapLabel(label: string): string[] {
  if (label.length <= 12) return [label];
  const words = label.split(" ");
  if (words.length === 1) return [label];
  const lines: string[] = ["", ""];
  let idx = 0;
  for (const w of words) {
    if (idx === 0 && (lines[0] + " " + w).trim().length > 11 && lines[0] !== "") {
      idx = 1;
    }
    lines[idx] = (lines[idx] + " " + w).trim();
  }
  return lines[1] ? [lines[0], lines[1]] : [lines[0]];
}

export default function WheelChart({ domains, scores, onChange }: WheelChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dragAxis, setDragAxis] = useState<number | null>(null);
  const [hoverAxis, setHoverAxis] = useState<number | null>(null);

  const n = domains.length;
  const rated = domains.filter((d) => scores[d]).length;
  const total = domains.reduce((sum, d) => sum + (scores[d] || 0), 0);
  const avg = rated ? total / rated : 0;

  // Convert a pointer event into a coordinate in the SVG's own viewBox space.
  function toSvgPoint(e: React.PointerEvent): { x: number; y: number } | null {
    const svg = svgRef.current;
    if (!svg) return null;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const local = pt.matrixTransform(ctm.inverse());
    return { x: local.x, y: local.y };
  }

  // Given a point, find which axis it is closest to (by angle).
  function nearestAxis(x: number, y: number): number {
    const angle = Math.atan2(y - CY, x - CX);
    let best = 0;
    let bestDiff = Infinity;
    for (let i = 0; i < n; i++) {
      let diff = Math.abs(angle - axisAngle(i, n)) % TAU;
      if (diff > Math.PI) diff = TAU - diff;
      if (diff < bestDiff) {
        bestDiff = diff;
        best = i;
      }
    }
    return best;
  }

  // Project a point onto a given axis to get a 1–10 score.
  function scoreFor(axis: number, x: number, y: number): number {
    const a = axisAngle(axis, n);
    const dx = x - CX;
    const dy = y - CY;
    const proj = dx * Math.cos(a) + dy * Math.sin(a); // distance along axis
    const raw = Math.round((proj / R) * LEVELS);
    return Math.min(LEVELS, Math.max(1, raw));
  }

  function applyAt(axis: number, x: number, y: number) {
    const value = scoreFor(axis, x, y);
    onChange(domains[axis], value);
  }

  function handlePointerDown(e: React.PointerEvent) {
    const p = toSvgPoint(e);
    if (!p) return;
    // Ignore clicks well outside the plotting area (e.g. on labels).
    const dist = Math.hypot(p.x - CX, p.y - CY);
    if (dist > R * 1.25) return;
    const axis = nearestAxis(p.x, p.y);
    setDragAxis(axis);
    (e.target as Element).setPointerCapture?.(e.pointerId);
    applyAt(axis, p.x, p.y);
  }

  function handlePointerMove(e: React.PointerEvent) {
    const p = toSvgPoint(e);
    if (!p) return;
    if (dragAxis === null) {
      const dist = Math.hypot(p.x - CX, p.y - CY);
      setHoverAxis(dist > R * 1.25 ? null : nearestAxis(p.x, p.y));
      return;
    }
    applyAt(dragAxis, p.x, p.y);
  }

  function endDrag() {
    setDragAxis(null);
  }

  // The filled polygon connecting each domain's current score.
  const polygon = domains
    .map((d, i) => {
      const s = scores[d] || 0;
      const p = pointAt(axisAngle(i, n), (s / LEVELS) * R);
      return `${p.x},${p.y}`;
    })
    .join(" ");

  // Concentric grid rings.
  const gridLevels = [2, 4, 6, 8, 10];

  return (
    <div className="wheel-chart-wrap">
      <div className="wheel-chart-meta no-print">
        <span className="wheel-chart-hint">Click or drag a point to score each area</span>
        <span className="wheel-chart-avg">
          Avg <strong>{rated ? avg.toFixed(1) : "—"}</strong>
        </span>
      </div>

      <svg
        ref={svgRef}
        className="wheel-chart-svg"
        viewBox={`0 0 ${SIZE_W} ${SIZE_H}`}
        role="img"
        aria-label="Wheel of Life spider chart"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerLeave={() => {
          endDrag();
          setHoverAxis(null);
        }}
        onPointerCancel={endDrag}
      >
        <defs>
          <linearGradient id="wheelFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C79A4E" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#9A6E2A" stopOpacity="0.30" />
          </linearGradient>
        </defs>

        {/* Concentric grid rings */}
        {gridLevels.map((lvl) => {
          const pts = domains
            .map((_, i) => {
              const p = pointAt(axisAngle(i, n), (lvl / LEVELS) * R);
              return `${p.x},${p.y}`;
            })
            .join(" ");
          return (
            <polygon
              key={lvl}
              points={pts}
              fill="none"
              stroke="#DDD6CA"
              strokeWidth={lvl === LEVELS ? 1.4 : 1}
              opacity={lvl === LEVELS ? 1 : 0.7}
            />
          );
        })}

        {/* Axis spokes */}
        {domains.map((d, i) => {
          const outer = pointAt(axisAngle(i, n), R);
          const active = hoverAxis === i || dragAxis === i;
          return (
            <line
              key={`axis-${d}`}
              x1={CX}
              y1={CY}
              x2={outer.x}
              y2={outer.y}
              stroke={active ? "#9A6E2A" : "#DDD6CA"}
              strokeWidth={active ? 1.5 : 1}
            />
          );
        })}

        {/* Score polygon */}
        {rated > 0 && (
          <polygon
            points={polygon}
            fill="url(#wheelFill)"
            stroke="#9A6E2A"
            strokeWidth={2}
            strokeLinejoin="round"
          />
        )}

        {/* Vertices / draggable handles */}
        {domains.map((d, i) => {
          const s = scores[d] || 0;
          const a = axisAngle(i, n);
          const p = pointAt(a, (s / LEVELS) * R);
          const active = hoverAxis === i || dragAxis === i;
          if (!s && !active) {
            // Unrated: show a faint clickable hint dot at the rim midpoint.
            const hint = pointAt(a, R * 0.5);
            return (
              <circle
                key={`v-${d}`}
                cx={hint.x}
                cy={hint.y}
                r={4}
                fill="#FFFFFF"
                stroke="#C9C1B4"
                strokeWidth={1.5}
                style={{ cursor: "pointer" }}
              />
            );
          }
          return (
            <g key={`v-${d}`} style={{ cursor: "pointer" }}>
              <circle
                cx={p.x}
                cy={p.y}
                r={active ? 9 : 6}
                fill={active ? "#9A6E2A" : "#1A1714"}
                stroke="#FFFFFF"
                strokeWidth={2}
              />
              {s > 0 && (
                <text
                  x={p.x}
                  y={p.y - 13}
                  textAnchor="middle"
                  fontFamily="'DM Mono', monospace"
                  fontSize={11}
                  fill="#9A6E2A"
                  fontWeight={500}
                >
                  {s}
                </text>
              )}
            </g>
          );
        })}

        {/* Labels */}
        {domains.map((d, i) => {
          const a = axisAngle(i, n);
          const p = pointAt(a, LABEL_R);
          const cos = Math.cos(a);
          const anchor = Math.abs(cos) < 0.3 ? "middle" : cos > 0 ? "start" : "end";
          const lines = wrapLabel(d);
          const active = hoverAxis === i || dragAxis === i;
          const dyStart = lines.length > 1 ? -5 : 4;
          return (
            <text
              key={`l-${d}`}
              x={p.x}
              y={p.y}
              textAnchor={anchor}
              fontFamily="'DM Mono', monospace"
              fontSize={10}
              letterSpacing={0.5}
              fill={active ? "#9A6E2A" : "#4A4540"}
              fontWeight={active ? 600 : 400}
              style={{ textTransform: "uppercase", userSelect: "none" }}
            >
              {lines.map((ln, li) => (
                <tspan key={li} x={p.x} dy={li === 0 ? dyStart : 13}>
                  {ln}
                </tspan>
              ))}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
