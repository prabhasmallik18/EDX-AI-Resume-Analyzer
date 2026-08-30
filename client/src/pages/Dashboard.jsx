import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";

import StatCard from "../component/dashboard/StatCard";
import QuickActionCards from "../component/dashboard/QuickActionCards";
import RecentAnalysisCard from "../component/dashboard/RecentAnalysisCard";

import { statistics as defaultStatistics, quickActions } from "../data/dashboard";
import { getMyResumes } from "../api/resumeApi";

function Dashboard() {
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sortedResumes = [...resumes].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const completedResumes = resumes.filter(
    (resume) => resume.analysisStatus === "Completed" && typeof resume.atsScore === "number"
  );

  const averageATS =
    completedResumes.length > 0
      ? Math.round(
          completedResumes.reduce((sum, resume) => sum + resume.atsScore, 0) /
            completedResumes.length
        )
      : "NA";

  const statistics = defaultStatistics.map((stat) => {
    switch (stat.title) {
      case "Total Resumes":
        return {
          ...stat,
          value: resumes.length,
        };

      case "Average ATS Score":
        return {
          ...stat,
          value: averageATS,
        };

      case "Job Matches":
        return {
          ...stat,
          value: "—",
        };

      case "Uploads":
        return {
          ...stat,
          value: resumes.length,
        };

      default:
        return stat;
    }
  });

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        const response = await getMyResumes(token);
        setResumes(response.data || []);
      } catch (error) {
        setError(error.message || "Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, []);

  const handleAIAnalysis = () => {
    const latestCompletedResume = sortedResumes.find(
      (resume) => resume.analysisStatus === "Completed"
    );

    if (!latestCompletedResume) {
      alert("No completed resume analysis found.");
      return;
    }

    navigate(`/resume/${latestCompletedResume._id}`);
  };

  if (error) {
    return (
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body text-center py-5">
          <FileText size={48} className="text-danger mb-3" />
          <h4 className="fw-bold">Unable to Load Dashboard</h4>
          <p className="text-muted mb-4">{error}</p>
          <button
            className="btn btn-primary rounded-pill px-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Welcome Banner */}
      <div
        className="mb-4 py-4 px-4 rounded-4 text-white"
        style={{
          background: "linear-gradient(135deg,#2563eb,#4f46e5)",
        }}
      >
        <h2 className="fw-bold mb-2">Welcome Back 👋</h2>
        <p className="mb-0 opacity-75">
          Track your resume performance and AI insights from one place.
        </p>
      </div>

      {/* Statistics */}
      <div className="row g-4 mb-5">
        {statistics.map((stat) => (
          <div key={stat.id} className="col-md-6 col-xl-3">
            <StatCard
              title={stat.title}
              value={loading ? "..." : stat.value}
              icon={stat.icon}
            />
          </div>
        ))}
      </div>

      {/* Main Section */}
      <div className="row g-4">
        {/* Quick Actions */}
        <div className="col-lg-7">
          <h4 className="fw-bold mb-4">🚀 Quick Actions</h4>

          <div className="row g-4">
            {quickActions.map((action) => (
              <div key={action.id} className="col-md-6">
                <QuickActionCards
                  title={action.title}
                  description={action.description}
                  icon={action.icon}
                  onClick={() => {
                    if (action.title === "AI Analysis") {
                      handleAIAnalysis();
                    } else {
                      navigate(action.path);
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Resume Analysis */}
        <div className="col-lg-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold mb-0">Recent Resume Analysis</h4>

            <button
              className="btn btn-primary rounded-pill px-4"
              onClick={() => navigate("/dashboard/history")}
            >
              View All
            </button>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="text-muted mt-3 mb-0">Loading analyses...</p>
            </div>
          ) : sortedResumes.length === 0 ? (
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body text-center py-5">
                <FileText size={48} className="text-secondary mb-3" />
                <h5>No Resume Found</h5>
                <p className="text-muted mb-4">
                  Upload your first resume to generate AI insights.
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
            sortedResumes.slice(0, 3).map((resume) => (
              <RecentAnalysisCard
                key={resume._id}
                resumeName={resume.originalName}
                atsScore={
                  resume.analysisStatus === "Completed"
                    ? `${resume.atsScore || 0}%`
                    : "Pending"
                }
                analyzedOn={new Date(resume.createdAt).toLocaleDateString()}
                onClick={() => navigate(`/resume/${resume._id}`)}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default Dashboard;
