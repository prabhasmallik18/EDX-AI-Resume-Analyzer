import { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

import { formatDate, formatDateTime } from "../../utils/scoreUtils";

// Chart geometry (in SVG units; the SVG itself scales to the card width).
const W = 640;
const H = 240;
const PAD = { top: 20, right: 24, bottom: 52, left: 40 };
const INK = "#0f172a";
const MUTED = "#64748b";
const GRID = "#e5eaf3";
const LINE = "#2563eb";
const SURFACE = "#ffffff";

const ScoreTrendCard = ({ trend = [], improvement = 0, onSelect }) => {
  const [hover, setHover] = useState(null);
  const [showTable, setShowTable] = useState(false);

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const x = (i) => PAD.left + (trend.length === 1 ? innerW / 2 : (i / (trend.length - 1)) * innerW);
  const y = (score) => PAD.top + (1 - score / 100) * innerH;

  const points = trend.map((p, i) => ({ ...p, cx: x(i), cy: y(p.score) }));
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.cx},${p.cy}`).join(" ");
  const active = hover !== null ? points[hover] : null;

  return (
    <div className="card border-0 h-100">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
          <div>
            <h5 className="fw-bold mb-1">ATS Score Progress</h5>
            <small className="text-muted">Each point is one analysed resume, in the order you uploaded them</small>
          </div>

          {trend.length > 1 && (
            <span
              className={`badge rounded-pill px-3 py-2 d-flex align-items-center gap-1 ${
                improvement >= 0 ? "text-bg-success" : "text-bg-danger"
              }`}
            >
              {improvement >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {improvement >= 0 ? "+" : ""}
              {improvement} since first resume
            </span>
          )}
        </div>

        {trend.length === 0 ? (
          <p className="text-muted text-center py-5 mb-0">
            Upload a resume to start tracking your score.
          </p>
        ) : (
          <>
            <div className="position-relative">
              <svg viewBox={`0 0 ${W} ${H}`} className="w-100" role="img" aria-label="Line chart of ATS score for each analysed resume">
                {[0, 25, 50, 75, 100].map((tick) => (
                  <g key={tick}>
                    <line x1={PAD.left} x2={W - PAD.right} y1={y(tick)} y2={y(tick)} stroke={GRID} strokeWidth="1" />
                    <text x={PAD.left - 8} y={y(tick) + 4} textAnchor="end" fontSize="11" fill={MUTED}>
                      {tick}
                    </text>
                  </g>
                ))}

                {points.length > 1 && (
                  <path d={path} fill="none" stroke={LINE} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                )}

                {active && (
                  <line x1={active.cx} x2={active.cx} y1={PAD.top} y2={H - PAD.bottom} stroke={MUTED} strokeWidth="1" strokeDasharray="3 3" />
                )}

                {points.map((p, i) => (
                  <g key={p.id}>
                    <circle cx={p.cx} cy={p.cy} r={hover === i ? 6 : 4.5} fill={LINE} stroke={SURFACE} strokeWidth="2" />
                    {/* bigger invisible circle = easy to hover / tap */}
                    <circle
                      cx={p.cx}
                      cy={p.cy}
                      r="16"
                      fill="transparent"
                      style={{ cursor: onSelect ? "pointer" : "default" }}
                      onMouseEnter={() => setHover(i)}
                      onMouseLeave={() => setHover(null)}
                      onFocus={() => setHover(i)}
                      onBlur={() => setHover(null)}
                      onClick={() => onSelect?.(p.id)}
                      tabIndex={0}
                      role="button"
                      aria-label={`${p.name}, score ${p.score}, ${formatDate(p.date)}`}
                      onKeyDown={(e) => e.key === "Enter" && onSelect?.(p.id)}
                    />
                  </g>
                ))}

                {/* "#1, #2 ..." under each point (every point if few, otherwise some of them) */}
                {points.map((p, i) =>
                  points.length <= 8 || i === 0 || i === points.length - 1 || i % Math.ceil(points.length / 8) === 0 ? (
                    <text key={`x-${p.id}`} x={p.cx} y={H - 30} textAnchor="middle" fontSize="12" fill={INK}>
                      #{i + 1}
                    </text>
                  ) : null
                )}

                {/* date range, drawn once (if every resume is from the same day it shows one date) */}
                <text x={W / 2} y={H - 8} textAnchor="middle" fontSize="11" fill={MUTED}>
                  {formatDate(points[0].date) === formatDate(points[points.length - 1].date)
                    ? formatDate(points[0].date)
                    : `${formatDate(points[0].date)}  →  ${formatDate(points[points.length - 1].date)}`}
                </text>
              </svg>

              {active && (
                <div
                  className="position-absolute bg-white shadow rounded-3 px-3 py-2 small"
                  style={{
                    left: `${(active.cx / W) * 100}%`,
                    top: `${(active.cy / H) * 100}%`,
                    transform: `translate(${active.cx > W * 0.7 ? "-105%" : "10px"}, -110%)`,
                    pointerEvents: "none",
                    whiteSpace: "nowrap",
                    color: INK,
                  }}
                >
                  <div className="fw-bold">#{hover + 1} · {active.score} / 100</div>
                  <div className="text-muted">{active.name}</div>
                  <div className="text-muted">{formatDateTime(active.date)}</div>
                </div>
              )}
            </div>

            <button
              type="button"
              className="btn btn-link btn-sm p-0 mt-2 text-decoration-none"
              onClick={() => setShowTable((v) => !v)}
              aria-expanded={showTable}
            >
              {showTable ? "Hide" : "Show"} data table
            </button>

            {showTable && (
              <div className="table-responsive mt-2">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Resume</th>
                      <th>Date</th>
                      <th className="text-end">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trend.map((p) => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>{formatDate(p.date)}</td>
                        <td className="text-end">{p.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ScoreTrendCard;
