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
          value:
            resumes.length > 0
              ? Math.round(
                  resumes.reduce(
                    (sum, resume) => sum + (resume.atsScore || 0),
                    0
                  ) / resumes.length
                )
              : "NA",
        };

      case "Job Matches":
        return {
          ...stat,
          value: 0,
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
        const token = localStorage.getItem("token");
        const response = await getMyResumes(token);
        setResumes(response.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, []);

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
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
        <h2 className="fw-bold mb-2">
          Welcome Back 👋
        </h2>

        <p className="mb-0 opacity-75">
          Track your resume performance and AI insights from one place.
        </p>
      </div>

      {/* Statistics */}

      <div className="row g-4 mb-5">
        {statistics.map((stat) => (
          <div
            key={stat.id}
            className="col-md-6 col-xl-3"
          >
            <StatCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
            />
          </div>
        ))}
      </div>

      {/* Main Section */}

      <div className="row">

        {/* Quick Actions */}

        <div className="col-lg-7">

          <h4 className="fw-bold mb-4">
            🚀 Quick Actions
          </h4>

          <div className="row g-4">

            {quickActions.map((action) => (

              <div
                key={action.id}
                className="col-md-6"
              >
                <QuickActionCards
                  title={action.title}
                  description={action.description}
                  icon={action.icon}
                  onClick={() => {
                    if (action.title === "AI Analysis") {
                      if (resumes.length === 0) {
                        alert("No resume found");
                        return;
                      }

                      navigate(`/resume/${resumes[0]._id}`);
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

            <h4 className="fw-bold mb-0">
              Recent Resume Analysis
            </h4>

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
            </div>

          ) : resumes.length === 0 ? (

            <div
              className="card"
              style={{
                borderRadius: "18px",
                boxShadow: "0 10px 25px rgba(0,0,0,.08)",
              }}
            >
              <div className="card-body text-center py-5">

                <FileText
                  size={48}
                  className="text-secondary mb-3"
                />

                <h5>No Resume Found</h5>

                <p className="text-muted">
                  Upload your first resume to generate AI insights.
                </p>

              </div>
            </div>

          ) : (

            resumes.slice(0, 3).map((resume) => (
              <RecentAnalysisCard
                key={resume._id}
                resumeName={resume.originalName}
                atsScore={
                  resume.analysisStatus === "Completed"
                    ? `${resume.atsScore || 0}%`
                    : "Pending"
                }
                analyzedOn={new Date(
                  resume.createdAt
                ).toLocaleDateString()}
              />
            ))

          )}

        </div>

      </div>
    </>
  );
}

export default Dashboard;