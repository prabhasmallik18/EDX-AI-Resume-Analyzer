import { Upload } from "lucide-react";
import { useState, useRef } from "react";

import { uploadResume } from "../api/resumeApi";
import ResumePreviewCard from "../component/upload/ResumePreviewCard";

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

    if (file.type !== "application/pdf") {
      setError("Please select a PDF file.");
      setSelectedFile(null);
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError("File size must be less than 5 MB.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    handleSelectedFile(file);
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!selectedFile) return;

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      const response = await uploadResume(selectedFile, token);

      setSuccess(response.message);

      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError("");
    setSuccess("");
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

    const file = event.dataTransfer.files[0];

    if (!file) return;

    handleSelectedFile(file);
  };

  const handleBrowserClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="container-fluid">

      <div
        className="mb-5 p-4 rounded-4 text-white"
        style={{
          background: "linear-gradient(135deg,#2563eb,#4f46e5)",
        }}
      >
        <h2 className="fw-bold mb-2">
          📄 Upload Resume
        </h2>

        <p className="mb-0 opacity-75">
          Upload your resume and receive an AI-powered ATS analysis within
          seconds.
        </p>
      </div>

      <div
        className={`card border-0 rounded-4 ${
          dragActive ? "border border-primary border-3" : ""
        }`}
        style={{
          cursor: "pointer",
          boxShadow: "0 18px 40px rgba(0,0,0,.08)",
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowserClick}
      >
        <form
          className="card-body p-5 text-center"
          onSubmit={handleUpload}
        >
          <Upload
            size={70}
            className="text-primary mb-4"
          />

          <h3 className="fw-bold">
            {dragActive
              ? "Release to Upload"
              : "Upload Your Resume"}
          </h3>

          <p className="text-muted fs-5 mb-4">
            {dragActive
              ? "Drop your PDF resume here"
              : "Drag & Drop your PDF resume here or click anywhere to browse"}
          </p>

          <input
            ref={fileInputRef}
            type="file"
            className="d-none"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={loading}
            key={selectedFile ? selectedFile.name : "empty"}
          />

          {success && (
            <div className="alert alert-success">
              {success}
            </div>
          )}

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          {selectedFile && (
            <ResumePreviewCard
              file={selectedFile}
              onRemove={handleRemoveFile}
            />
          )}

          <button
            type="submit"
            className="btn btn-primary rounded-pill px-5 py-3 mt-4"
            disabled={!selectedFile || loading}
          >
            {loading ? "Uploading..." : "Upload Resume"}
          </button>
        </form>
      </div>

    </div>
  );
};

export default UploadResume;