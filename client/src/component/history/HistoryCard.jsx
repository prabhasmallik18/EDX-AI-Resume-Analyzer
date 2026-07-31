import { Eye, Trash2, CalendarDays } from "lucide-react";

function HistoryCard({
  resumeName,
  atsScore,
  analysisStatus,
  uploadedDate,
  onView,
  onDelete,
}) {
  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-body">

        <div className="d-flex justify-content-between align-items-start flex-wrap">

          <div>
            <h5 className="fw-semibold mb-2">
              {resumeName}
            </h5>

            <p className="mb-2">
              <span
                className={`badge ${
                  analysisStatus === "Completed"
                    ? "bg-success"
                    : analysisStatus === "Pending"
                    ? "bg-warning text-dark"
                    : "bg-danger"
                }`}
              >
                {analysisStatus}
              </span>

              <span className="ms-3 badge bg-primary">
                ATS: {atsScore || 0}%
              </span>
            </p>

            <p className="text-muted mb-0">
              <CalendarDays
                size={16}
                className="me-2"
              />
              {uploadedDate}
            </p>
          </div>

          <div className="d-flex gap-2 mt-3 mt-md-0">

            <button
              className="btn btn-outline-primary btn-sm"
              onClick={onView}
            >
              <Eye size={16} className="me-1" />
              View
            </button>

            <button
              className="btn btn-outline-danger btn-sm"
              onClick={onDelete}
            >
              <Trash2 size={16} className="me-1" />
              Delete
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}

export default HistoryCard;