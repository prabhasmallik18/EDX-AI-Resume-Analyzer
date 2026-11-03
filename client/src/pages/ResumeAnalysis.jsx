import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Printer, RefreshCw, Cpu } from "lucide-react";

import ATSScoreCard from "../component/analysis/ATSScoreCard";
import SkillsCard from "../component/analysis/SkillsCard";
import MissingSkillsCard from "../component/analysis/MissingSkillsCard";
import StrengthsCard from "../component/analysis/StrengthsCard";
import WeaknessesCard from "../component/analysis/WeaknessesCard";
import SuggestionsCard from "../component/analysis/SuggestionsCard";
import ScoreBreakdownCard from "../component/analysis/ScoreBreakdownCard";
import JobMatchCard from "../component/analysis/JobMatchCard";
import { getResumeById, reanalyzeResume } from "../api/resumeApi";
import { getToken } from "../utils/auth";

const ENGINE_LABELS = {
  local: "Built-in analysis engine",
  hybrid: "Built-in engine + Gemini advice",
};

const ResumeAnalysis = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reanalyzing, setReanalyzing] = useState(false);
  const [actionError, setActionError] = useState("");

  const fetchResume = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getResumeById(id, getToken());

      setResume(response.data);
    } catch (err) {
      setError(err.message || "Failed to load resume analysis.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchResume();
  }, [fetchResume]);

  const handleReanalyze = async () => {
    try {
      setReanalyzing(true);
      setActionError("");

      const response = await reanalyzeResume(id, getToken());

      setResume(response.data);
    } catch (err) {
      setActionError(err.message || "Could not analyse this resume again.");
    } finally {
      setReanalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body text-center py-5">
            <div
              className="spinner-border text-primary"
              style={{ width: "3rem", height: "3rem" }}
            />
            <h4 className="fw-bold mt-4">Loading your report...</h4>
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

  const engineLabel = ENGINE_LABELS[resume?.engine];
  const isOldAnalysis = !resume?.engine || resume.engine === "gemini";

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
            <h2 className="fw-bold mb-2">📊 Resume Analysis</h2>
            <p className="mb-2 opacity-75">
              Review your ATS score, how it was calculated, your skills, strengths, weaknesses and
              recommendations.
            </p>
            <div className="small opacity-75">
              <strong>Resume:</strong> {resume?.originalName || "Resume"} &nbsp;•&nbsp;
              <strong>Analyzed:</strong> {analyzedDate} &nbsp;•&nbsp;
              <strong>Status:</strong> {resume?.analysisStatus || "Completed"}
            </div>
            <div className="mt-2">
              <span className="badge text-bg-light d-inline-flex align-items-center gap-1">
                <Cpu size={13} />
                {engineLabel || "Analysed with an earlier version"}
              </span>
            </div>
          </div>

          <div className="d-flex gap-2 flex-wrap no-print">
            <button
              className="btn btn-outline-light rounded-pill px-4"
              onClick={handleReanalyze}
              disabled={reanalyzing}
              title="Analyse the saved resume text again with the current engine"
            >
              <RefreshCw size={16} className={`me-2 ${reanalyzing ? "spin" : ""}`} />
              {reanalyzing ? "Analysing..." : "Re-analyze"}
            </button>
            <button
              className="btn btn-outline-light rounded-pill px-4"
              onClick={() => window.print()}
              title="Opens the print window. Choose 'Save as PDF' to download the report."
            >
              <Printer size={16} className="me-2" />
              Download Report
            </button>
            <button
              className="btn btn-light rounded-pill px-4"
              onClick={() => navigate("/dashboard/history")}
            >
              <ArrowLeft size={16} className="me-2" />
              Back
            </button>
          </div>
        </div>
      </div>

      {actionError && (
        <div className="alert alert-danger rounded-4 no-print" role="alert">
          {actionError}
        </div>
      )}

      {isOldAnalysis && (
        <div className="alert alert-info rounded-4 small no-print">
          This resume was analysed by an earlier version, so its score may differ from newer ones.
          Click <strong>Re-analyze</strong> to update it with the current engine and see the full
          breakdown.
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-4">
          <ATSScoreCard score={resume?.atsScore || 0} />
        </div>

        <div className="col-lg-8">
          {resume?.scoreBreakdown ? (
            <ScoreBreakdownCard
              breakdown={resume.scoreBreakdown}
              insights={resume.insights}
            />
          ) : (
            <SkillsCard skills={resume?.skills || []} />
          )}
        </div>

        {resume?.scoreBreakdown && (
          <div className="col-12">
            <SkillsCard skills={resume?.skills || []} />
          </div>
        )}

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

        <div className="col-12">
          <JobMatchCard
            key={resume?._id}
            resumeId={resume?._id}
            initialMatches={resume?.jobMatches || []}
          />
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalysis;
