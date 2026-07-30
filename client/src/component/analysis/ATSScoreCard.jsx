
const ATSScoreCard = ({score}) => {
    let status= ""
    let color = ""

    if (score >= 90){
        status = "Excellent"
        color = "sucess"
    } else if (score >=70){
        status = "Good"
        color = "warning"
    }else{
        status = "Needs Improvement!"
        color = "danger"
    }
  return (
    <div className="card shadow-sm border-0">
        <div className="card-body text-center">
            <h5 className="mb-4">ATS Score</h5>
            <h1 className={`display-3 text-${color}`}>{score}%</h1>
            <div className="progress mt-4" style={{height: "12px"}}>
                <div className={`progress-bar bg-${color}`} role="progressbar" style={{width: `${score}%`}} >
                </div>
            </div>
            <p className={`mt-3 fw-semibold text-${color}`}>{status}</p>
        </div>
    </div>
  )
}

export default ATSScoreCard