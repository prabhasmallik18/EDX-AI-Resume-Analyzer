import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import axios from "axios";

import ATSScoreCard from "../component/analysis/ATSScoreCard";
import SkillsCard from "../component/analysis/SkillsCard";
import MissingSkillsCard from "../component/analysis/MissingSkillsCard";
import StrengthsCard from "../component/analysis/StrengthsCard";
import WeaknessesCard from "../component/analysis/WeaknessesCard";
import SuggestionsCard from "../component/analysis/SuggestionsCard";

const ResumeAnalysis = () => {
  const { id } = useParams();

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResume = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");

        const response = await axios.get(
          `http://localhost:8000/api/resume/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setResume(response.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load resume."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [id]);

  if (loading) {
    return (
      <div className="container-fluid py-5">

        <div
          className="text-center"
          style={{
            marginTop: "120px",
          }}
        >
          <div
            className="spinner-border text-primary"
            style={{
              width: "3rem",
              height: "3rem",
            }}
          ></div>

          <h4 className="mt-4">
            Loading AI Analysis...
          </h4>

          <p className="text-muted">
            Please wait while we prepare your report.
          </p>

        </div>

      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-5">
        <div className="alert alert-danger">
          {error}
        </div>
      </div>
    );
  }

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
          🤖 AI Resume Analysis
        </h2>

        <p className="mb-0 opacity-75">
          Review your ATS score, strengths,
          weaknesses and personalized AI suggestions.
        </p>
      </div>

      <div className="row g-4">

        <div className="col-lg-4">
          <ATSScoreCard
            score={resume.atsScore || 0}
          />
        </div>

        <div className="col-lg-8">
          <SkillsCard
            skills={resume.skills || []}
          />
        </div>

        <div className="col-12">
          <MissingSkillsCard
            missingSkills={
              resume.missingSkills || []
            }
          />
        </div>

        <div className="col-12">
          <StrengthsCard
            strengths={resume.strengths || []}
          />
        </div>

        <div className="col-12">
          <WeaknessesCard
            weaknesses={resume.weaknesses || []}
          />
        </div>

        <div className="col-12">
          <SuggestionsCard
            suggestions={resume.suggestions || []}
          />
        </div>

      </div>

    </div>
  );
};

export default ResumeAnalysis;