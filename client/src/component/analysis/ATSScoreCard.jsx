const ATSScoreCard = ({ score }) => {
  let status = "";
  let color = "";

  if (score >= 90) {
    status = "Excellent";
    color = "success";
  } else if (score >= 70) {
    status = "Good";
    color = "warning";
  } else {
    status = "Needs Improvement";
    color = "danger";
  }

  return (
    <div
      className="card border-0 h-100"
      style={{
        borderRadius: "20px",
        boxShadow: "0 15px 35px rgba(0,0,0,.08)",
      }}
    >
      <div className="card-body text-center p-5">

        <h5 className="fw-bold mb-4">
          ATS Score
        </h5>

        <h1
          className={`display-2 fw-bold text-${color}`}
        >
          {score}%
        </h1>

        <div
          className="progress mt-4"
          style={{
            height: "14px",
            borderRadius: "10px",
          }}
        >
          <div
            className={`progress-bar bg-${color}`}
            style={{
              width: `${score}%`,
            }}
          ></div>
        </div>

        <p
          className={`mt-4 fw-bold text-${color}`}
        >
          {status}
        </p>

      </div>
    </div>
  );
};

export default ATSScoreCard;