import { scoreMeta } from "../../utils/scoreUtils";

const MESSAGES = {
  Excellent: "Your resume has strong ATS readiness and keyword coverage.",
  Good: "Your resume has a good ATS foundation. A few targeted improvements can raise the score.",
  Average: "Your resume is readable by ATS systems, but keyword coverage and impact can be improved.",
  "Needs work": "Add relevant keywords, measurable achievements, and clearer resume sections.",
};

const ATSScoreCard = ({ score }) => {
  const { value, color, label } = scoreMeta(score);

  return (
    <div
      className="card border-0 h-100"
      style={{
        borderRadius: "20px",
        boxShadow: "0 15px 35px rgba(0,0,0,.08)",
      }}
    >
      <div className="card-body text-center p-5">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="fw-bold mb-0">ATS Score</h5>
          <span className={`badge text-bg-${color}`}>{label}</span>
        </div>

        <h1 className={`display-2 fw-bold text-${color} mb-0`}>{value}%</h1>

        <p className="text-muted mt-2 mb-4">ATS Readiness</p>

        <div className="progress" style={{ height: "14px", borderRadius: "10px" }}>
          <div
            className={`progress-bar bg-${color}`}
            style={{ width: `${value}%` }}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin="0"
            aria-valuemax="100"
          />
        </div>

        <p className={`mt-4 mb-2 fw-bold text-${color}`}>{label}</p>
        <p className="text-muted mb-0 small">{MESSAGES[label]}</p>

        <div className="row mt-4 text-muted small">
          <div className="col-4">
            <div className="fw-bold text-dark">50–69</div>
            Average
          </div>
          <div className="col-4">
            <div className="fw-bold text-dark">70–84</div>
            Good
          </div>
          <div className="col-4">
            <div className="fw-bold text-dark">85–100</div>
            Excellent
          </div>
        </div>
      </div>
    </div>
  );
};

export default ATSScoreCard;
