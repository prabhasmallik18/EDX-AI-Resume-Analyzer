const RecentAnalysisCard = ({
  resumeName,
  atsScore,
  analyzedOn,
}) => {
  return (
    <div
      className="card border-0 mb-3"
      style={{
        borderRadius: "18px",
        boxShadow: "0 10px 25px rgba(0,0,0,.08)",
        transition: "all .3s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div className="card-body">

        <div className="d-flex justify-content-between align-items-center">

          <div>

            <h5 className="fw-bold mb-1">
              {resumeName}
            </h5>

            <small className="text-muted">
              📅 {analyzedOn}
            </small>

          </div>

          <div className="text-end">

            <span
              className="badge"
              style={{
                background:
                  "linear-gradient(135deg,#22c55e,#16a34a)",
                padding: "10px 16px",
                borderRadius: "12px",
                fontSize: "15px",
              }}
            >
              {atsScore}
            </span>

            <div
              className="text-success mt-2"
              style={{
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              AI Completed
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default RecentAnalysisCard;