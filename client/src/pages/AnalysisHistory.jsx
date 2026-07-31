import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"


import HistoryCard from "../component/history/HistoryCard"
import { getMyResumes, deleteResume } from "../api/resumeApi"

const AnalysisHistory = () => {
  const navigate = useNavigate()

  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")



  const fetchResumes = async() =>{
    try{
      const token = localStorage.getItem("token")

      const response = await getMyResumes(token)

      setResumes(response.data)
    }catch(error){
      setError(error.message)
    }finally{
      setLoading(false)
    }
  }

    useEffect(()=>{
    fetchResumes();
  },[])
  if(loading){
    return(
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
      </div>
    )
  }

  if(error){
    return(
      <div className="alert alert-danger">
        {error}
      </div>
    )
  }

  const handleDelete = async(id) => {
    const confirmed = window.confirm("Are you sure you want to delete this resume?")

    if(!confirmed) return

    try{
      const token = localStorage.getItem("token")

      await deleteResume(id, token)

      setResumes((prev)=>
        prev.filter((resume)=> resume._id !== id)
      )

      alert("Resume deleted Successfully!")
    }catch(error){
      error.response?.data?.message || "Failed to delete resume."
    }
  }
  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold">Resume History</h2>
        <p className="text-muted">
          View and manage all your Uploads
        </p>
      </div>
      {resumes.length === 0 ?(
        <div className="text-center py-5">
          <h5>No Resume History Found</h5>
          <p className="text-muted">Upload your resume to get started</p>
        </div>
      ):(
        resumes.map((resume)=>(
          <HistoryCard
            key={resume._id}
            resumeName={resume.originalName}
            atsScore={resume.atsScore}
            analysisStatus={resume.analysisStatus}

            uploadedDate={new Date(
              resume.createdAt
            ).toLocaleDateString()}

            onView={()=>navigate(`/resume/${resume._id}`)}
            onDelete={()=> handleDelete(resume._id)}
          />
        ))
      )}
    </div>
  )
}

export default AnalysisHistory