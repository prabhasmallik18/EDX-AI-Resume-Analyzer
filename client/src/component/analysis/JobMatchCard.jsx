import { useState } from "react";
import { Target, LoaderCircle, CheckCircle2, XCircle, Lightbulb, AlertTriangle } from "lucide-react";

import { matchJob } from "../../api/resumeApi";
import { getToken } from "../../utils/auth";
import { scoreMeta, formatDate } from "../../utils/scoreUtils";

const MAX_JD = 8000;
const MIN_JD = 50;

// Circular score badge drawn with SVG.
const ScoreRing = ({ score, size = 130 }) => {
  const meta = scoreMeta(score);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="position-relative d-inline-block" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label={`Match score ${meta.value} out of 100`}>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#e5eaf3" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={meta.hex}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - meta.value / 100)}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="position-absolute top-50 start-50 translate-middle text-center">
        <div className="fw-bold fs-2 lh-1">{meta.value}%</div>
        <div className="small text-muted">{meta.label}</div>
      </div>
    </div>
  );
};

const Chips = ({ items, variant }) =>
  items.length === 0 ? (
    <p className="text-muted small mb-0">None</p>
  ) : (
    <div className="d-flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className={`badge rounded-pill px-3 py-2 fw-medium ${variant}`}>
          {item}
        </span>
      ))}
    </div>
  );

const MatchResult = ({ match }) => (
  <div>
    <div className="row g-4 align-items-center mb-4">
      <div className="col-md-auto text-center">
        <ScoreRing score={match.matchScore} />
      </div>
      <div className="col-md">
        <h5 className="fw-bold mb-1">
          {match.jobTitle || "Job match"}
          {match.company && <span className="text-muted fw-normal"> · {match.company}</span>}
        </h5>
        <div className="small text-muted mb-2">
          Keyword match <strong>{match.keywordScore}%</strong>
          {match.similarityScore != null && (
            <>
              {" "}· Wording similarity <strong>{match.similarityScore}%</strong>
            </>
          )}
          {match.aiUsed && match.aiScore != null && (
            <>
              {" "}· Gemini fit <strong>{match.aiScore}%</strong>
            </>
          )}
          {" "}· {formatDate(match.createdAt)}
        </div>
        {match.summary && <p className="mb-0">{match.summary}</p>}
      </div>
    </div>

    {match.engine === "local-fallback" && (
      <div className="alert alert-warning d-flex gap-2 align-items-start small">
        <AlertTriangle size={18} className="flex-shrink-0 mt-1" />
        <span>
          The extra Gemini advice was not available for this check, so the score uses the built-in
          engine only. The result is still complete.
        </span>
      </div>
    )}

    <div className="row g-4">
      <div className="col-md-6">
        <h6 className="fw-bold d-flex align-items-center gap-2">
          <CheckCircle2 size={18} className="text-success" /> Keywords you have ({match.matchedKeywords.length})
        </h6>
        <Chips items={match.matchedKeywords} variant="text-bg-success" />
      </div>
      <div className="col-md-6">
        <h6 className="fw-bold d-flex align-items-center gap-2">
          <XCircle size={18} className="text-danger" /> Keywords missing ({match.missingKeywords.length})
        </h6>
        <Chips items={match.missingKeywords} variant="text-bg-danger" />
      </div>

      {match.strengthsForRole?.length > 0 && (
        <div className="col-12">
          <h6 className="fw-bold">Why you fit this role</h6>
          <ul className="mb-0 ps-3">
            {match.strengthsForRole.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {match.suggestions?.length > 0 && (
        <div className="col-12">
          <h6 className="fw-bold d-flex align-items-center gap-2">
            <Lightbulb size={18} className="text-warning" /> How to tailor your resume for this job
          </h6>
          <ul className="mb-0 ps-3">
            {match.suggestions.map((item) => (
              <li key={item} className="mb-1">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </div>
);

const JobMatchCard = ({ resumeId, initialMatches = [] }) => {
  // newest first
  const [matches, setMatches] = useState(() => [...initialMatches].reverse());
  const [activeIndex, setActiveIndex] = useState(0);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const trimmedLength = jobDescription.trim().length;
  const canSubmit = trimmedLength >= MIN_JD && trimmedLength <= MAX_JD && !loading;
  const activeMatch = matches[activeIndex];

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    try {
      setLoading(true);
      setError("");

      const response = await matchJob(resumeId, { jobTitle, company, jobDescription }, getToken());

      setMatches((previous) => [response.data, ...previous].slice(0, 10));
      setActiveIndex(0);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card border-0">
      <div className="card-body p-4">
        <div className="d-flex align-items-center gap-2 mb-1">
          <Target size={22} className="text-primary" />
          <h4 className="fw-bold mb-0">Job Match</h4>
        </div>
        <p className="text-muted mb-4">
          Paste a job description to see how well this resume fits it, which keywords are missing,
          and what to change.
        </p>

        <form onSubmit={handleSubmit} className="mb-4 no-print">
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label htmlFor="jm-title" className="form-label small fw-semibold">
                Job title (optional)
              </label>
              <input
                id="jm-title"
                className="form-control"
                maxLength={120}
                placeholder="e.g. Full Stack Developer Intern"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="jm-company" className="form-label small fw-semibold">
                Company (optional)
              </label>
              <input
                id="jm-company"
                className="form-control"
                maxLength={120}
                placeholder="e.g. Acme Technologies"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
          </div>

          <label htmlFor="jm-description" className="form-label small fw-semibold">
            Job description
          </label>
          <textarea
            id="jm-description"
            className="form-control"
            rows={7}
            placeholder="Paste the full job posting here (responsibilities and requirements)..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            aria-describedby="jm-counter"
          />
          <div className="d-flex justify-content-between align-items-center mt-2 flex-wrap gap-2">
            <small
              id="jm-counter"
              className={trimmedLength > MAX_JD ? "text-danger" : "text-muted"}
            >
              {trimmedLength} / {MAX_JD} characters
              {trimmedLength > 0 && trimmedLength < MIN_JD && ` · add at least ${MIN_JD - trimmedLength} more`}
            </small>
            <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={!canSubmit}>
              {loading ? (
                <>
                  <LoaderCircle size={16} className="me-2 spin" /> Checking match...
                </>
              ) : (
                "Check Match"
              )}
            </button>
          </div>

          {error && (
            <div className="alert alert-danger mt-3 mb-0 small" role="alert">
              {error}
            </div>
          )}
        </form>

        {matches.length > 1 && (
          <div className="mb-4 no-print">
            <div className="small fw-semibold text-muted mb-2">Previous checks</div>
            <div className="d-flex flex-wrap gap-2">
              {matches.map((match, index) => {
                const meta = scoreMeta(match.matchScore);
                return (
                  <button
                    key={match._id || index}
                    type="button"
                    className={`btn btn-sm rounded-pill ${index === activeIndex ? "btn-primary" : "btn-outline-secondary"}`}
                    onClick={() => setActiveIndex(index)}
                  >
                    {match.jobTitle || match.company || `Job ${matches.length - index}`}{" "}
                    <span className={`badge text-bg-${meta.color} ms-1`}>{meta.value}%</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {activeMatch ? (
          <div className="border-top pt-4">
            <MatchResult match={activeMatch} />
          </div>
        ) : (
          <div className="text-center text-muted py-3 border-top">
            No job checked yet. Paste a job description above to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default JobMatchCard;
