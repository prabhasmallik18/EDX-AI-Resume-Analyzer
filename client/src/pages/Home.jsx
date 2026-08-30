import { Link } from "react-router-dom";
import { FileText, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";

const Home = () => {
  return (
    <div className="container py-5">
      <div
        className="p-5 rounded-4 text-white text-center"
        style={{
          background: "linear-gradient(135deg,#2563eb,#4f46e5)",
        }}
      >
        <div className="d-flex justify-content-center mb-3">
          <div
            className="d-flex align-items-center justify-content-center rounded-circle bg-white text-primary"
            style={{ width: 76, height: 76 }}
          >
            <FileText size={38} />
          </div>
        </div>

        <h1 className="fw-bold display-5">AI Resume Analyzer</h1>
        <p className="lead mb-4 opacity-75">
          Analyze your resume with AI, understand your ATS readiness, and get practical improvements.
        </p>

        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <Link to="/login" className="btn btn-light rounded-pill px-4 py-2 fw-semibold">
            Get Started <ArrowRight size={17} className="ms-2" />
          </Link>
          <Link to="/register" className="btn btn-outline-light rounded-pill px-4 py-2 fw-semibold">
            Create Account
          </Link>
        </div>
      </div>

      <div className="row g-4 mt-4">
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm rounded-4">
            <div className="card-body p-4 text-center">
              <Sparkles size={38} className="text-primary mb-3" />
              <h5 className="fw-bold">AI-Powered Analysis</h5>
              <p className="text-muted mb-0">Get ATS score, strengths, weaknesses, missing skills, and suggestions.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm rounded-4">
            <div className="card-body p-4 text-center">
              <FileText size={38} className="text-primary mb-3" />
              <h5 className="fw-bold">Resume Insights</h5>
              <p className="text-muted mb-0">Upload PDF resumes and keep your previous analyses organized.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm rounded-4">
            <div className="card-body p-4 text-center">
              <ShieldCheck size={38} className="text-primary mb-3" />
              <h5 className="fw-bold">Secure Access</h5>
              <p className="text-muted mb-0">Your resume analysis is available through your authenticated account.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
