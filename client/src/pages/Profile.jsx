import { useEffect, useState } from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";

import ProfileHeader from "../component/profile/ProfileHeader";
import ProfileStats from "../component/profile/ProfileStats";

import { getProfile } from "../api/userApi";
import { getMyResumes } from "../api/resumeApi";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalResumes: 0,
    averageATS: 0,
    highestATS: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const [profileResponse, resumeResponse] = await Promise.all([
        getProfile(token),
        getMyResumes(token),
      ]);

      setUser(profileResponse?.data?.data || null);

      const resumes = resumeResponse?.data || [];
      const completedResumes = resumes.filter(
        (resume) =>
          resume.analysisStatus === "Completed" &&
          typeof resume.atsScore === "number"
      );

      const scores = completedResumes.map((resume) => resume.atsScore);
      const totalResumes = resumes.length;
      const highestATS = scores.length > 0 ? Math.max(...scores) : 0;
      const averageATS =
        scores.length > 0
          ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
          : 0;

      setStats({
        totalResumes,
        averageATS,
        highestATS,
      });
    } catch (profileError) {
      setError(profileError.message || "Unable to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body text-center py-5">
          <LoaderCircle
            size={48}
            className="text-primary"
            style={{ animation: "profile-spin 1s linear infinite" }}
          />
          <p className="mt-3 text-muted mb-0">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body text-center py-5">
          <AlertCircle size={48} className="text-danger mb-3" />
          <h4 className="fw-bold">Unable to Load Profile</h4>
          <p className="text-muted mb-4">{error}</p>
          <button className="btn btn-primary rounded-pill px-4" onClick={fetchProfile}>
            Try Again
          </button>
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
        <h2 className="fw-bold mb-2">👤 My Profile</h2>
        <p className="mb-0 opacity-75">
          View your account details and resume performance.
        </p>
      </div>

      <ProfileHeader name={user?.name || "User"} email={user?.email || ""} />

      <div className="mt-4">
        <ProfileStats
          totalResumes={stats.totalResumes}
          averageATS={stats.averageATS}
          highestATS={stats.highestATS}
        />
      </div>

      <style>
        {`@keyframes profile-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
      </style>
    </div>
  );
};

export default Profile;
