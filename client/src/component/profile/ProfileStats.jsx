import {
  FileText,
  BarChart3,
  Trophy,
} from "lucide-react";

function ProfileStats({
  totalResumes,
  averageATS,
  highestATS,
}) {
  const stats = [
    {
      title: "Total Resumes",
      value: totalResumes,
      icon: FileText,
    },
    {
      title: "Average ATS",
      value: `${averageATS}%`,
      icon: BarChart3,
    },
    {
      title: "Highest ATS",
      value: `${highestATS}%`,
      icon: Trophy,
    },
  ];

  return (
    <div className="row g-4">

      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            className="col-md-4"
            key={stat.title}
          >
            <div
              className="card border-0 h-100"
              style={{
                borderRadius: "20px",
                boxShadow:
                  "0 12px 30px rgba(0,0,0,.08)",
              }}
            >
              <div className="card-body text-center p-4">

                <div
                  className="mx-auto mb-3 d-flex justify-content-center align-items-center"
                  style={{
                    width: "65px",
                    height: "65px",
                    borderRadius: "18px",
                    background:
                      "linear-gradient(135deg,#2563eb,#4f46e5)",
                    color: "#fff",
                  }}
                >
                  <Icon size={30} />
                </div>

                <h2 className="fw-bold text-dark">
                  {stat.value}
                </h2>

                <p className="text-muted mb-0">
                  {stat.title}
                </p>

              </div>
            </div>
          </div>
        );
      })}

    </div>
  );
}

export default ProfileStats;