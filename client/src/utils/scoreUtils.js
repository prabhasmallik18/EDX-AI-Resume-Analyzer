// ONE scale used everywhere in the app (cards, history, charts, job match).
//   85-100 Excellent (green) | 70-84 Good (blue) | 50-69 Average (amber) | 0-49 Needs work (red)
export const scoreMeta = (score) => {
  const value = Math.min(100, Math.max(0, Math.round(Number(score) || 0)));

  if (value >= 85) return { value, color: "success", hex: "#16a34a", label: "Excellent" };
  if (value >= 70) return { value, color: "primary", hex: "#2563eb", label: "Good" };
  if (value >= 50) return { value, color: "warning", hex: "#d97706", label: "Average" };
  return { value, color: "danger", hex: "#dc2626", label: "Needs work" };
};

export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "";

export const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })
    : "";
