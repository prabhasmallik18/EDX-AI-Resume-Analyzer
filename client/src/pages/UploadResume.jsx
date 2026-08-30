import { useState, useRef } from "react";
import { CheckCircle2, FileText, LoaderCircle, Upload, XCircle } from "lucide-react";

import { uploadResume } from "../api/resumeApi";
import ResumePreviewCard from "../component/upload/ResumePreviewCard";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const UploadResume = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);

  const handleSelectedFile = (file) => {
    if (!file) return;

    setError("");
    setSuccess("");

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setSelectedFile(null);
      setError("Please select a PDF resume file.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setError("File size must be less than 5 MB.");
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (event) => {
    handleSelectedFile(event.target.files?.[0]);
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!selectedFile || loading) return;

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");
      const response = await uploadResume(selectedFile, token);

      setSuccess(response.message || "Resume uploaded and analyzed successfully.");
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (uploadError) {
      setError(uploadError.message || "Resume upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFile = () => {
    if (loading) return;
    setSelectedFile(null);
    setError("");
    setSuccess("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    handleSelectedFile(event.dataTransfer.files?.[0]);
  };

  const handleBrowserClick = (event) => {
    if (loading) return;

    if (event.target.closest("button")) return;

    fileInputRef.current?.click();
  };

  return (
    <div className="container-fluid">
      <div
        className="mb-4 p-4 rounded-4 text-white"
        style={{
          background: "linear-gradient(135deg,#2563eb,#4f46e5)",
        }}
      >
        <h2 className="fw-bold mb-2">📄 Upload Resume</h2>
        <p className="mb-0 opacity-75">
          Upload your resume and receive an AI-powered ATS analysis within seconds.
        </p>
      </div>

      {success && (
        <div className="alert alert-success d-flex align-items-center gap-2 rounded-4">
          <CheckCircle2 size={20} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 rounded-4">
          <XCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div
        className={`card border-0 rounded-4 ${
          dragActive ? "border border-primary border-3" : ""
        }`}
        style={{
          cursor: loading ? "default" : "pointer",
          boxShadow: "0 18px 40px rgba(0,0,0,.08)",
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowserClick}
      >
        <form className="card-body p-5 text-center" onSubmit={handleUpload}>
          {loading ? (
            <LoaderCircle
              size={70}
              className="text-primary mb-4"
              style={{ animation: "spin 1s linear infinite" }}
            />
          ) : (
            <Upload size={70} className="text-primary mb-4" />
          )}

          <h3 className="fw-bold">
            {loading
              ? "Analyzing Your Resume..."
              : dragActive
              ? "Release to Upload"
              : "Upload Your Resume"}
          </h3>

          <p className="text-muted fs-5 mb-3">
            {loading
              ? "Your PDF is being processed and analyzed by AI. Please wait."
              : dragActive
              ? "Drop your PDF resume here"
              : "Drag & Drop your PDF resume here or click anywhere to browse"}
          </p>

          <p className="text-muted small mb-4">
            PDF only • Maximum file size: 5 MB
          </p>

          <input
            ref={fileInputRef}
            type="file"
            className="d-none"
            accept="application/pdf,.pdf"
            onChange={handleFileChange}
            disabled={loading}
          />

          {selectedFile && (
            <div onClick={(event) => event.stopPropagation()}>
              <ResumePreviewCard
                file={selectedFile}
                onRemove={handleRemoveFile}
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary rounded-pill px-5 py-3 mt-4"
            disabled={!selectedFile || loading}
          >
            {loading ? (
              <>
                <LoaderCircle
                  size={18}
                  className="me-2"
                  style={{ animation: "spin 1s linear infinite" }}
                />
                Analyzing Resume...
              </>
            ) : (
              <>
                <FileText size={18} className="me-2" />
                Analyze Resume
              </>
            )}
          </button>
        </form>
      </div>

      <style>
        {`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
      </style>
    </div>
  );
};

export default UploadResume;
