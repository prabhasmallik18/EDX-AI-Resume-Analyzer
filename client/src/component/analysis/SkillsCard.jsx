

const SkillsCard = ({skills=[]}) => {
  return (
    <div className="card shadow-sm border-0 h-100">
        <div className="card-body">
            <h5 className="mb-4">Detected Skills</h5>
            {skills.length === 0 ? (
                <p className="text-muted">No skills found</p>
            ):(
                <div className="d-flex flex-wrap gap-2">
                    {skills.map((skill, index)=>(
                        <span key={index} className="badge bg-primary px-3 py-2" >
                            {skill}
                        </span>
                    ))}
                </div>
            )}
        </div>
    </div>
  )
}

export default SkillsCard