import { FileText, Trash2 } from "lucide-react";

const ResumePreviewCard = ({ file, onRemove }) => {
  const formatFileSize = (bytes) => {
    if (bytes < 1024) {
      return `${bytes} Bytes`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };
  return (
    <div className="card border-0 shadow-sm rounded-4 mt-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <FileText size={40} className="text-primary me-3" />
            <div>
              <h5 className="mb-1">{file.name}</h5>
              <small className="text-muted">{formatFileSize(file.size)}</small>
            </div>
          </div>
          <button className="btn btn-outline-danger btn-sm" onClick={onRemove}>
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumePreviewCard;
