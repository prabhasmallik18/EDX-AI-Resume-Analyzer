import { scoreMeta } from "../../utils/scoreUtils";

const yes = (flag) => (flag ? "✓" : "✗");

// What each part measures, and the real evidence behind it (from the analysis engine).
const ROWS = [
  {
    key: "keywords",
    label: "Keywords",
    hint: "Industry keyword coverage",
    evidence: (i) => `${i.roleSkillsMatched} of ${i.roleSkillsExpected} skills typical for a ${i.role}`,
  },
  {
    key: "skills",
    label: "Skills",
    hint: "Relevance and breadth of skills",
    evidence: (i) => `${i.totalSkills} skills found across ${i.skillAreas} technical areas`,
  },
  {
    key: "impact",
    label: "Impact",
    hint: "Numbers, results and action verbs",
    evidence: (i) =>
      i.bulletCount > 0
        ? `${i.quantifiedBullets} of ${i.bulletCount} bullets contain numbers · ${i.actionVerbBullets} start with an action verb · ${i.weakPhraseBullets} use weak phrases`
        : "No bullet points were found to measure",
  },
  {
    key: "structure",
    label: "Structure",
    hint: "Key sections present and ordered",
    evidence: (i) =>
      `Sections: ${i.sectionsFound?.length ? i.sectionsFound.join(", ") : "none detected"} · Email ${yes(i.contact?.email)} Phone ${yes(i.contact?.phone)} LinkedIn ${yes(i.contact?.linkedin)} GitHub ${yes(i.contact?.github)}`,
  },
  {
    key: "formatting",
    label: "Formatting",
    hint: "How cleanly an ATS can read it",
    evidence: (i) => `${i.wordCount} words (best range: 250 to 900)`,
  },
];

// Resumes analysed before this feature existed have no breakdown, so we show nothing.
const ScoreBreakdownCard = ({ breakdown, insights }) => {
  if (!breakdown) return null;

  const rows = ROWS.filter((row) => Number.isFinite(breakdown[row.key]));
  if (rows.length === 0) return null;

  const weakest = [...rows].sort((a, b) => breakdown[a.key] - breakdown[b.key])[0];
  const weights = insights?.weights;

  return (
    <div className="card border-0 h-100">
      <div className="card-body p-4">
        <h5 className="fw-bold mb-1">How your score is calculated</h5>
        <p className="text-muted small mb-4">
          Your ATS score is a weighted mix of these five checks. Fix the weakest area first:{" "}
          <strong>{weakest.label}</strong>.
        </p>

        {rows.map((row) => {
          const meta = scoreMeta(breakdown[row.key]);
          return (
            <div key={row.key} className="mb-3">
              <div className="d-flex justify-content-between small mb-1">
                <span className="fw-semibold">
                  {row.label}
                  {weights?.[row.key] !== undefined && (
                    <span className="badge text-bg-light border ms-2 fw-normal">
                      {Math.round(weights[row.key] * 100)}% of score
                    </span>
                  )}
                </span>
                <span className="fw-bold">{meta.value}</span>
              </div>
              <div
                className="progress"
                style={{ height: "8px" }}
                role="progressbar"
                aria-label={`${row.label} score`}
                aria-valuenow={meta.value}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <div className={`progress-bar bg-${meta.color}`} style={{ width: `${meta.value}%` }} />
              </div>
              <div className="small text-muted mt-1">{insights ? row.evidence(insights) : row.hint}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScoreBreakdownCard;
