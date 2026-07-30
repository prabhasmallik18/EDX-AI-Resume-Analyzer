function WeaknessesCard({ weaknesses = [] }) {
  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-body">
        <h5 className="mb-4 text-warning">
          Resume Weaknesses
        </h5>

        {weaknesses.length === 0 ? (
          <p className="text-success mb-0">
            Great! No major weaknesses identified.
          </p>
        ) : (
          <ul className="list-group list-group-flush">
            {weaknesses.map((weakness, index) => (
              <li
                key={index}
                className="list-group-item px-0 border-0"
              >
                <span className="text-warning me-2">-</span>
                {weakness}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default WeaknessesCard;