const RecentAnalysisCard = ({resumeName, atsScore, analyzedOn}) => {
  return (
<div className="d-flex justify-content-between align-items-center border rounded p-3 mb-3">
    <div>
        <h6 className="mb-1">{resumeName}</h6>
        <small className="text-muted">{analyzedOn}</small>
    </div>
    <span className="badge bg-success fs-6">
        {atsScore}
    </span>

</div>
  )
}

export default RecentAnalysisCard