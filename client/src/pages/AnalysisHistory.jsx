import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import HistoryCard from "../component/history/HistoryCard";
import { getMyResumes, deleteResume } from "../api/resumeApi";

const AnalysisHistory = () => {
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const response = await getMyResumes(token);

      const sorted = (response.data || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setResumes(sorted);
    } catch (error) {
      setError(error.message || "Unable to load resume history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this resume and its analysis?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");

      const token = localStorage.getItem("token");
      await deleteResume(id, token);

      setResumes((prev) => prev.filter((resume) => resume._id !== id));
    } catch (error) {
      setError(error.message || "Failed to delete resume.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body text-center py-5">
          <div
            className="spinner-border text-primary"
            style={{ width: "3rem", height: "3rem" }}
          />
          <p className="mt-3 text-muted mb-0">Loading Resume History...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div
        className="mb-4 p-4 rounded-4 text-white"
        style={{
          background: "linear-gradient(135deg,#2563eb,#4f46e5)",
        }}
      >
        <h2 className="fw-bold mb-2">📑 Resume History</h2>
        <p className="mb-0 opacity-75">
          View, manage and analyze all previously uploaded resumes.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center flex-wrap gap-2">
          <span>{error}</span>
          <button className="btn btn-outline-danger btn-sm" onClick={fetchResumes}>
            Retry
          </button>
        </div>
      )}

      {resumes.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body text-center py-5">
            <h4 className="fw-bold">No Resume History Found</h4>
            <p className="text-muted mb-4">
              Upload your first resume to start using AI Resume Analyzer.
            </p>
            <button
              className="btn btn-primary rounded-pill px-4"
              onClick={() => navigate("/dashboard/upload")}
            >
              Upload Resume
            </button>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {resumes.map((resume) => (
            <div className="col-lg-6" key={resume._id}>
              <HistoryCard
                resumeName={resume.originalName}
                atsScore={resume.atsScore}
                analysisStatus={resume.analysisStatus}
                uploadedDate={new Date(resume.createdAt).toLocaleDateString()}
                deleting={deletingId === resume._id}
                onView={() => navigate(`/resume/${resume._id}`)}
                onDelete={() => handleDelete(resume._id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnalysisHistory;
