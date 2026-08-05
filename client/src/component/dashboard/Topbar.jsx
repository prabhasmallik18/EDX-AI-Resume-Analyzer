import { FaBell } from "react-icons/fa";

const Topbar = () => {
  return (
    <header
      className="bg-white shadow-sm px-4 py-3 d-flex justify-content-between align-items-center"
    >
      <div>
        <h4 className="fw-bold mb-0">
          Welcome Back 👋
        </h4>

        <small className="text-muted">
          Manage your resumes with AI
        </small>
      </div>

      <div className="d-flex align-items-center gap-4">

        <FaBell
          size={20}
          className="text-secondary"
        />

        <div className="text-end">

          <div className="fw-bold">
            Vadali Prabhas
          </div>

          <small className="text-muted">
            Resume Analyst
          </small>

        </div>

        <img
          src="https://ui-avatars.com/api/?name=Prabhas"
          width="45"
          height="45"
          style={{ borderRadius: "50%" }}
        />

      </div>
    </header>
  );
};

export default Topbar;