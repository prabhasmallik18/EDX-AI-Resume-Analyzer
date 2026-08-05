import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import HistoryCard from "../component/history/HistoryCard";
import { getMyResumes, deleteResume } from "../api/resumeApi";

const AnalysisHistory = () => {
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResumes = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await getMyResumes(token);

      setResumes(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div
          className="spinner-border text-primary"
          style={{ width: "3rem", height: "3rem" }}
        ></div>

        <p className="mt-3 text-muted">
          Loading Resume History...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
      </div>
    );
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this resume?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      await deleteResume(id, token);

      setResumes((prev) =>
        prev.filter((resume) => resume._id !== id)
      );

      alert("Resume deleted successfully.");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to delete resume."
      );
    }
  };

  return (
    <div className="container-fluid">

      <div
        className="mb-5 p-4 rounded-4 text-white"
        style={{
          background:
            "linear-gradient(135deg,#2563eb,#4f46e5)",
        }}
      >
        <h2 className="fw-bold mb-2">
          📑 Resume History
        </h2>

        <p className="mb-0 opacity-75">
          View, manage and analyze all previously uploaded resumes.
        </p>
      </div>

      {resumes.length === 0 ? (
        <div
          className="card border-0 shadow-sm"
          style={{
            borderRadius: "18px",
          }}
        >
          <div className="card-body text-center py-5">

            <h4 className="fw-bold">
              No Resume History Found
            </h4>

            <p className="text-muted">
              Upload your first resume to start using
              AI Resume Analyzer.
            </p>

          </div>
        </div>
      ) : (
        <div className="row g-4">

          {resumes.map((resume) => (
            <div
              className="col-lg-6"
              key={resume._id}
            >
              <HistoryCard
                resumeName={resume.originalName}
                atsScore={resume.atsScore}
                analysisStatus={resume.analysisStatus}
                uploadedDate={new Date(
                  resume.createdAt
                ).toLocaleDateString()}
                onView={() =>
                  navigate(`/resume/${resume._id}`)
                }
                onDelete={() =>
                  handleDelete(resume._id)
                }
              />
            </div>
          ))}

        </div>
      )}

    </div>
  );
};

export default AnalysisHistory;