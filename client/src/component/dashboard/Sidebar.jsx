import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaUpload,
  FaHistory,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";

const Sidebar = () => {
  const menu = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <FaHome />,
    },
    {
      name: "Upload Resume",
      path: "/dashboard/upload",
      icon: <FaUpload />,
    },
    {
      name: "Analysis History",
      path: "/dashboard/history",
      icon: <FaHistory />,
    },
    {
      name: "Profile",
      path: "/dashboard/profile",
      icon: <FaUserCircle />,
    },
  ];

  return (
    <aside
      className="text-white shadow-lg d-flex flex-column"
      style={{
        width: "235px",
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0f172a, #1e3a8a)",
      }}
    >
      {/* Logo */}
      <div className="p-4 border-bottom border-secondary">
        <h3 className="fw-bold mb-1">AI Resume</h3>
        <small className="text-light opacity-75">
          Resume Analyzer
        </small>
      </div>

      {/* Menu */}
      <div className="mt-4 px-3 flex-grow-1">
        {menu.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `d-flex align-items-center gap-3 text-decoration-none rounded px-3 py-3 mb-2 ${
                isActive
                  ? "bg-white text-primary fw-bold"
                  : "text-white"
              }`
            }
          >
            <span style={{ fontSize: "20px" }}>
              {item.icon}
            </span>

            {item.name}
          </NavLink>
        ))}
      </div>

      {/* Logout */}
      <div className="p-3">
        <NavLink
          to="/login"
          className="btn btn-danger w-100"
        >
          <FaSignOutAlt className="me-2" />
          Logout
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;