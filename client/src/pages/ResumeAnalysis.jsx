import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"

import axios from "axios"
import ATSScoreCard from "../component/analysis/ATSScoreCard"
import SkillsCard from "../component/analysis/SkillsCard"

const ResumeAnalysis = () => {
    const {id} = useParams()
    const [resume, setResume] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")


    useEffect(()=>{
        const fetchResume = async() =>{
            try{
                setLoading(true);

                const token = localStorage.getItem("token")
                const response = await axios.get(
                    `http://localhost:8000/api/resume/${id}`,
                    {
                        headers:{
                            Authorization: `Bearer ${token}`
                        }
                    }
                )
                setResume(response.data.data)
                console.log(response.data.data.skills)
            }catch(err){
                setError(
                err.response?.data?.message || "Failed to load resume."
                )
            }finally{
                setLoading(false)
            }
        }
        fetchResume()
    },[id])

    if(loading){
        return(
            <div className="continer py-5">
                <h3>Loading analysis....</h3>
            </div>
        )
    }

    if(error){
        return(
            <div className="container py-5">
                <div className="alert alert-danger">
                    "{error}
                </div>
            </div>
        )
    }
  return (
    <div className="container py-5">
        <h2>Resume Analysis</h2>
        <div className="row">
            <div className="col-md-6 col-lg-4">
                <ATSScoreCard score={resume.atsScore || 0}/>
            </div>
             <div className="col-lg-8">
                <SkillsCard skills={resume.skills || []}/>
            </div>
        </div>
    </div>
  )
}

export default ResumeAnalysis