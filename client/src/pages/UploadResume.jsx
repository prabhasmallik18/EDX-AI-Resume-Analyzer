import { Upload } from "lucide-react";
import { useState, useRef } from "react";

import { uploadResume } from "../api/resumeApi";

import ResumePreviewCard from "../component/upload/ResumePreviewCard";

const UploadResume = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setloading] = useState(false);
  const [success, setSuccess] = useState("");
  const [dragActive, setDragActive] = useState(false)

  const fileInputRef = useRef(null)

  const handleSelectedFile = (file) => {
    if (!file) {
      return;
    }
    setError("");
    setSuccess("");

    if (file.type !== "application/pdf") {
      setError("Pleae select a PDF file.");
      setSelectedFile(null);
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size must be less than 5 MB");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    
    handleSelectedFile(file)
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!selectedFile) {
      return;
    }

    try{
      setloading(true);
      setError("")
      setSuccess("")

      const token = localStorage.getItem("token")

      const response = await uploadResume(selectedFile, token)
      setSuccess(response.message)
      setSelectedFile(null);

      if (fileInputRef.current){
        fileInputRef.current.value= "";
      }
    }catch(error){
      setError(error.message)
    }finally{
      setloading(false)
    }
  };

  const handleRemoveFile = () =>{
    setSelectedFile(null)
    setError(null)
    setSuccess("")
  }

  const handleDragOver = (event) =>{
    event.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = () =>{
    setDragActive(false)
  }

  const handleDrop = (event) =>{
    event.preventDefault()

    setDragActive(false);
    const file = event.dataTransfer.files[0];
    if(!file) return;

    handleSelectedFile(file)
  }

  const handleBrowserClick = () => {
    fileInputRef.current.click()
  }

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h2>Upload Resume</h2>
        <p>
          Upload your resume in PDF format to receive yout AI-powered ATS
          analysis
        </p>
      </div>
        <div className={`card shadow border-0 rounded-4 ${dragActive? "border border-primary border-3" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowserClick}
            style={{cursor: "pointer"}}
        >
        <form className="card-body p-5 text-center" onSubmit={handleUpload}>
          <Upload size={60} className="text-primary mb-3" />
          <h4>{ dragActive? "Release to Upload" : "Upload Your Resume"}</h4>
          <p className="text-muted">{dragActive? "Drop your resume here" : "Drag & Drop your PDF resume"}</p>
          <input
            ref={fileInputRef}
            type="file"
            className="d-none"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={loading}
            key={selectedFile ? selectedFile.name : "empty"}
          />
          {success && <div className="alert alert-success mt-3">{success}</div>}
          {error && <div className="alert alert-danger mt-3">{error}</div>}

          {selectedFile && (
            <ResumePreviewCard
                file={selectedFile}
                onRemove={handleRemoveFile}
            />
          )}
          <button
            className="btn btn-primary mt-5 px-5"
            disabled={!selectedFile || loading}
          >
            {loading ? "Uploading....." : "Upload resume"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadResume;
