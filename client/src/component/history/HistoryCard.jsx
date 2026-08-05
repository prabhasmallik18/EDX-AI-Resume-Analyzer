import {
  Eye,
  Trash2,
  CalendarDays,
  FileText,
} from "lucide-react";

function HistoryCard({
  resumeName,
  atsScore,
  analysisStatus,
  uploadedDate,
  onView,
  onDelete,
}) {
  return (
    <div
      className="card border-0 h-100"
      style={{
        borderRadius: "20px",
        boxShadow: "0 12px 30px rgba(0,0,0,.08)",
        transition: "all .3s ease",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-8px)";
        e.currentTarget.style.boxShadow =
          "0 18px 40px rgba(37,99,235,.18)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 12px 30px rgba(0,0,0,.08)";
      }}
    >
      <div
        style={{
          height: "5px",
          background:
            "linear-gradient(90deg,#2563eb,#4f46e5,#7c3aed)",
        }}
      />

      <div className="card-body p-4">

        <div className="d-flex justify-content-between align-items-start">

          <div className="d-flex">

            <div
              className="me-3 d-flex justify-content-center align-items-center"
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "16px",
                background:
                  "linear-gradient(135deg,#2563eb,#4f46e5)",
                color: "#fff",
              }}
            >
              <FileText size={28} />
            </div>

            <div>

              <h5 className="fw-bold mb-2">
                {resumeName}
              </h5>

              <span
                className={`badge me-2 ${
                  analysisStatus === "Completed"
                    ? "bg-success"
                    : analysisStatus === "Pending"
                    ? "bg-warning text-dark"
                    : "bg-danger"
                }`}
              >
                {analysisStatus}
              </span>

              <span className="badge bg-primary">
                ATS {atsScore || 0}%
              </span>

              <div className="mt-3 text-muted">

                <CalendarDays
                  size={16}
                  className="me-2"
                />

                {uploadedDate}

              </div>

            </div>

          </div>

        </div>

        <hr />

        <div className="d-flex gap-3">

          <button
            className="btn btn-primary rounded-pill px-4"
            onClick={onView}
          >
            <Eye size={16} className="me-2" />
            View Analysis
          </button>

          <button
            className="btn btn-outline-danger rounded-pill px-4"
            onClick={onDelete}
          >
            <Trash2 size={16} className="me-2" />
            Delete
          </button>

        </div>

      </div>
    </div>
  );
}

export default HistoryCard;