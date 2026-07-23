import { Upload } from "lucide-react"


const UploadResume = () => {
  return (
   <div className="container-fluid">
    <div className="mb-4">
        <h2>Upload Resume</h2>
        <p>Upload your resume in PDF format to receive yout AI-powered ATS analysis</p>
    </div>
    <div className="card shadow border-0 rounded-4">
        <div className="card-body p-5 text-center">
            <Upload size={60} className="text-primary mb-3"/>
            <h4>Upload Your Resume</h4>
            <p className="text-muted">Supported Format: PDF</p>
            <input type="file" className="form-control" accept=".pdf" />
            <button className="btn btn-primary mt-5 px-5">Upload Resume</button>
        </div>
    </div>
   </div>
  )
}

export default UploadResume