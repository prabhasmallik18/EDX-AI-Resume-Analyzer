import { useEffect, useState } from "react";

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

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const profileResponse = await getProfile(token);
      setUser(profileResponse.data.data);

      const resumeResponse = await getMyResumes(token);
      const resumes = resumeResponse.data;

      const totalResumes = resumes.length;

      const highestATS =
        resumes.length > 0
          ? Math.max(...resumes.map((resume) => resume.atsScore || 0))
          : 0;

      const averageATS =
        resumes.length > 0
          ? Math.round(
              resumes.reduce(
                (sum, resume) => sum + (resume.atsScore || 0),
                0
              ) / resumes.length
            )
          : 0;

      setStats({
        totalResumes,
        averageATS,
        highestATS,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div
          className="spinner-border text-primary"
          style={{
            width: "3rem",
            height: "3rem",
          }}
        ></div>

        <p className="mt-3 text-muted">
          Loading Profile...
        </p>
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
          👤 My Profile
        </h2>

        <p className="mb-0 opacity-75">
          View your account details and resume performance.
        </p>
      </div>

      <ProfileHeader
        name={user?.name}
        email={user?.email}
      />

      <div className="mt-4">

        <ProfileStats
          totalResumes={stats.totalResumes}
          averageATS={stats.averageATS}
          highestATS={stats.highestATS}
        />

      </div>

    </div>
  );
};

export default Profile;