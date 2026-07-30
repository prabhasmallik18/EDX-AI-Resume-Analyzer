function StrengthsCard({ strengths = [] }) {
  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-body">
        <h5 className="mb-4 text-success">
          Resume Strengths
        </h5>

        {strengths.length === 0 ? (
          <p className="text-muted mb-0">
            No strengths identified.
          </p>
        ) : (
          <ul className="list-group list-group-flush">
            {strengths.map((strength, index) => (
              <li
                key={index}
                className="list-group-item px-0 border-0"
              >
                <span className="text-success me-2">-</span>
                {strength}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default StrengthsCard;