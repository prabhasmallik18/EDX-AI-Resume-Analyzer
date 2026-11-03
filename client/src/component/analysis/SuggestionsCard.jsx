import { useState } from "react";
import { Copy, Check } from "lucide-react";

function SuggestionsCard({ suggestions = [] }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (suggestions.length === 0) return;
    const text = suggestions.map((s, i) => `${i + 1}. ${s}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0 text-primary">Suggestions to improve</h5>
          {suggestions.length > 0 && (
            <button
              type="button"
              className="btn btn-sm btn-outline-primary rounded-pill px-3 d-inline-flex align-items-center gap-1 no-print"
              onClick={handleCopy}
              title="Copy suggestions to clipboard"
            >
              {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy Suggestions"}
            </button>
          )}
        </div>

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