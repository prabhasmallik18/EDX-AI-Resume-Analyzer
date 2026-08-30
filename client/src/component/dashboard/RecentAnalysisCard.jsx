const RecentAnalysisCard = ({
  resumeName,
  atsScore,
  analyzedOn,
  onClick,
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
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.();
        }
      }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow =
          "0 16px 32px rgba(37,99,235,.14)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,.08)";
      }}
    >
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center gap-3">
          <div className="min-w-0">
            <h5
              className="fw-bold mb-1 text-truncate"
              title={resumeName}
            >
              {resumeName}
            </h5>

            <small className="text-muted">
              📅 {analyzedOn}
            </small>
          </div>

          <div className="text-end flex-shrink-0">
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
