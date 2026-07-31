function ProfileStats({
  totalResumes,
  averageATS,
  highestATS,
}) {
  const stats = [
    {
      title: "Total Resumes",
      value: totalResumes,
    },
    {
      title: "Average ATS",
      value: `${averageATS}%`,
    },
    {
      title: "Highest ATS",
      value: `${highestATS}%`,
    },
  ];

  return (
    <div className="row g-3">
      {stats.map((stat) => (
        <div
          className="col-md-4"
          key={stat.title}
        >
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center">
              <h2 className="fw-bold text-primary">
                {stat.value}
              </h2>

              <p className="text-muted mb-0">
                {stat.title}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProfileStats;