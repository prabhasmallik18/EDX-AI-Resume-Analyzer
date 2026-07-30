function MissingSkillsCard({ missingSkills = [] }) {
  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-body">
        <h5 className="mb-4">Missing Skills</h5>

        {missingSkills.length === 0 ? (
          <p className="text-success mb-0">
            Excellent! No missing skills identified.
          </p>
        ) : (
          <div className="d-flex flex-wrap gap-2">
            {missingSkills.map((skill, index) => (
              <span
                key={index}
                className="badge bg-danger px-3 py-2"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MissingSkillsCard;