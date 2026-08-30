import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";

import ATSScoreCard from "../component/analysis/ATSScoreCard";
import SkillsCard from "../component/analysis/SkillsCard";
import MissingSkillsCard from "../component/analysis/MissingSkillsCard";
import StrengthsCard from "../component/analysis/StrengthsCard";
import WeaknessesCard from "../component/analysis/WeaknessesCard";
import SuggestionsCard from "../component/analysis/SuggestionsCard";
import { getResumeById } from "../api/resumeApi";

const ResumeAnalysis = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResume = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const response = await getResumeById(id, token);

      setResume(response.data);
    } catch (err) {
      setError(err.message || "Failed to load resume analysis.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResume();
  }, [id]);

  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body text-center py-5">
            <div
              className="spinner-border text-primary"
              style={{ width: "3rem", height: "3rem" }}
            />
            <h4 className="fw-bold mt-4">Loading AI Analysis...</h4>
            <p className="text-muted mb-0">
              Please wait while we prepare your resume report.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-5">
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body text-center py-5">
            <h4 className="fw-bold">Unable to Load Analysis</h4>
            <p className="text-muted mb-4">{error}</p>
            <div className="d-flex justify-content-center gap-2 flex-wrap">
              <button
                className="btn btn-primary rounded-pill px-4"
                onClick={fetchResume}
              >
                <RefreshCw size={16} className="me-2" />
                Retry
              </button>
              <button
                className="btn btn-outline-secondary rounded-pill px-4"
                onClick={() => navigate("/dashboard/history")}
              >
                <ArrowLeft size={16} className="me-2" />
                Back to History
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const analyzedDate = resume?.createdAt
    ? new Date(resume.createdAt).toLocaleDateString()
    : "Not available";

  return (
    <div className="container-fluid">
      <div
        className="mb-4 p-4 rounded-4 text-white"
        style={{
          background: "linear-gradient(135deg,#2563eb,#4f46e5)",
        }}
      >
        <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
          <div>
            <h2 className="fw-bold mb-2">🤖 AI Resume Analysis</h2>
            <p className="mb-2 opacity-75">
              Review your ATS score, skills, strengths, weaknesses and AI recommendations.
            </p>
            <div className="small opacity-75">
              <strong>Resume:</strong> {resume?.originalName || "Resume"} &nbsp;•&nbsp; 
              <strong>Analyzed:</strong> {analyzedDate} &nbsp;•&nbsp;
              <strong>Status:</strong> {resume?.analysisStatus || "Completed"}
            </div>
          </div>

          <button
            className="btn btn-light rounded-pill px-4"
            onClick={() => navigate("/dashboard/history")}
          >
            <ArrowLeft size={16} className="me-2" />
            Back
          </button>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <ATSScoreCard score={resume?.atsScore || 0} />
        </div>

        <div className="col-lg-8">
          <SkillsCard skills={resume?.skills || []} />
        </div>

        <div className="col-12">
          <MissingSkillsCard missingSkills={resume?.missingSkills || []} />
        </div>

        <div className="col-12">
          <StrengthsCard strengths={resume?.strengths || []} />
        </div>

        <div className="col-12">
          <WeaknessesCard weaknesses={resume?.weaknesses || []} />
        </div>

        <div className="col-12">
          <SuggestionsCard suggestions={resume?.suggestions || []} />
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalysis;
