function SuggestionsCard({ suggestions = [] }) {
  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-body">
        <h5 className="mb-4 text-primary">
          AI Suggestions
        </h5>

        {suggestions.length === 0 ? (
          <p className="text-success mb-0">
            Excellent! Your resume doesn't require any additional suggestions.
          </p>
        ) : (
          <ul className="list-group list-group-flush">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="list-group-item px-0 border-0"
              >
                <span className="text-primary me-2">-</span>
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default SuggestionsCard;