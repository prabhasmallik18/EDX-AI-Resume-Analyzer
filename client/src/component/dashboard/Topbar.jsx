import { useLocation } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import { getUser } from "../../utils/auth";

const TITLES = [
  ["/dashboard/upload", "Upload Resume", "Add a PDF to analyse"],
  ["/dashboard/history", "Analysis History", "All your analysed resumes"],
  ["/dashboard/profile", "My Profile", "Your account and results"],
  ["/resume/", "Resume Report", "Score, evidence and job match"],
  ["/dashboard", "Dashboard", "Your resume progress at a glance"],
];

const Topbar = () => {
  const { pathname } = useLocation();
  const [, title, subtitle] = TITLES.find(([path]) => pathname.startsWith(path)) || TITLES[TITLES.length - 1];
  const user = getUser();
  const displayName = user?.name || "User";

  return (
    <header
      className="bg-white shadow-sm px-4 py-3 d-flex justify-content-between align-items-center"
    >
      <div>
        <h4 className="fw-bold mb-0">
          {title}
        </h4>

        <small className="text-muted">
          {subtitle}
        </small>
      </div>

      <div className="d-flex align-items-center gap-4">

        <FaBell
          size={20}
          className="text-secondary"
        />

        <div className="text-end">

          <div className="fw-bold">
            {displayName}
          </div>

          <small className="text-muted">
            {user?.email || ""}
          </small>

        </div>

        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}`}
          alt={displayName}
          width="45"
          height="45"
          style={{ borderRadius: "50%" }}
        />

      </div>
    </header>
  );
};

export default Topbar;