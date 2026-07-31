import { useEffect, useState } from "react"

import ProfileHeader from "../component/profile/ProfileHeader"
import ProfileStats from "../component/profile/ProfileStats"

import { getProfile } from "../api/userApi"
import { getMyResumes } from "../api/resumeApi"


const Profile = () => {
  const [user, setUser] = useState(null)

  const[stats, setStats] = useState({
    totalResumes: 0,
    averageATS: 0,
    highestATS: 0,
  })

  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    fetchProfle()
  },[])

  const fetchProfle = async() => {
    try{
      const token = localStorage.getItem("token")

    const profileResponse = await getProfile(token)
    setUser(profileResponse.data.data)

    const resumeResponse = await getMyResumes(token)
    const resumes = resumeResponse.data

    const totalResumes = resumes.length 

    const highestATS = resumes.length > 0 ? Math.max(...resumes.map((r)=> r.atsScore || 0)):0

const averageATS =
  resumes.length > 0
    ? Math.round(
        resumes.reduce(
          (sum, resume) => sum + (resume.atsScore || 0),
          0
        ) / resumes.length
      )
    : 0;
    setStats({totalResumes, highestATS, averageATS})
    }catch(error){
      console.error(error)
    }finally{
      setLoading(false)
    }
    
  }

if (loading) {
  return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary"></div>
    </div>
  );
}
  return (
    <div className="container py-4">
        <div className="mb-4">
          <h2 className="fw-bold">My Profile</h2>
          <p className="text-muted">
            Manage your account information!
          </p>
        </div>

        <ProfileHeader
          name={user?.name}
          email={user?.email}
        />
        <ProfileStats
        totalResumes={stats.totalResumes}
        averageATS={stats.averageATS}
        highestATS={stats.highestATS}
        />
    </div>
  )
}

export default Profile