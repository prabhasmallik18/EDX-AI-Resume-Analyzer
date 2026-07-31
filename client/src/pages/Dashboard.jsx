import StatCard from "../component/dashboard/StatCard"
import QuickActionCards from "../component/dashboard/QuickActionCards"
import RecentAnalysisCard from "../component/dashboard/RecentAnalysisCard"

import { useNavigate } from "react-router-dom"

import { statistics as defaultStatistics, quickActions } from "../data/dashboard"


import { getMyResumes } from "../api/resumeApi"

import { useState , useEffect} from "react"
import { FileText } from "lucide-react"



function Dashboard() {
  const navigate = useNavigate();

  const [resumes, setResumes]= useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const statistics = defaultStatistics.map((stat)=>{
    switch(stat.title){
      case "Total Resumes":
        return{
            ...stat,
            value: resumes.length
        }
      case "Average ATS Score":
        return{
          ...stat,
          value: 
          resumes.length > 0 ? Math.round(
      resumes.reduce((sum, resumes) => sum+ (resumes.atsScore || 0), 
      0
    ) / resumes.length
  ): "NA",
        }
      case "Job Matches":
        return{
          ...stat,
          value: 0
        }
      case "Uploads":
        return{
          ...stat,
          value: resumes.length
        }
    }
  })

  useEffect(()=>{
    const fetchResumes = async()=>{
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
    fetchResumes()
  }, [])

  if(error){
    return(
      <div className="alert alert-danger">
        {error}
      </div>
    )
  }


  return (
    <>
      <div className="mb-4">
        <h2>Dashboard</h2>

        <p className="text-muted">Here's a quick overview of your activity.</p>
      </div>

      <div className="row g-4">
        {statistics.map((stat) => (
          <div key={stat.id} className="col-md-6 col-xl-3">
            <StatCard title={stat.title} value={stat.value} icon={stat.icon} />
          </div>
        ))}
      </div>

      <h4 className="mt-5 mb-4">Quick Actions</h4>

      <div className="row mt-5">


  <div className="col-lg-7">

    <h4 className="mb-4">
      Quick Actions
    </h4>

    <div className="row g-4">

      {quickActions.map((action) => (

        <div
          key={action.id}
          className="col-md-6"
        >

          <QuickActionCards

            title={action.title}

            description={action.description}

            icon={action.icon}

            onClick={()=>{
              if(action.title === "AI Analysis"){
                if (resumes.length === 0){
                  alert("No resume found")
                  return
                }

                navigate(`/resume/${resumes[0]._id}`)
              }else{
                navigate(action.path)
              }
            }}  

          />

        </div>

      ))}

    </div>

  </div>

  <div className="col-lg-5">

    <div className="d-flex justify-content-between align-items-center mb-4">

      <h4 className="mb-0">
        Recent Analyses
      </h4>

      <button
        className="btn btn-outline-primary btn-sm"  onClick={()=> navigate("/dashboard/history")}
      >
        View All
      </button>

    </div>

    {loading?(
      <div className="text-center py-3">
        <div className="spinner-border text-primary"></div>
      </div>
    ): resumes.length === 0 ? (
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <FileText
            size={48}
            className="text-secondary mb-3"
          />
          <h5>No Resume Found</h5>
          <p className="text-muted">
            Upload your first resume to generate AI insights
          </p>
        </div>
      </div>
    ):(
      resumes.slice(0,3).map((resume)=>(
        <RecentAnalysisCard

        key={resume._id}

        resumeName={resume.originalName}

        atsScore={resume.analysisStatus === "Completed"
          ? `${resume.atsScore || 0}%` : "Pending"
        }

        analyzedOn={new Date(
          resume.createdAt
        ).toLocaleDateString()}

      />
      ))
    )}

  </div>

</div>
    </>
  );
}

export default Dashboard;
