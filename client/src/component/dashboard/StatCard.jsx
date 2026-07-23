
const StatCard = ({title, icon:Icon, value,}) => {
  return (
    <div className="card shadow-sm border-0 h-100">
        <div className="card-body">
            <div className="fs-2 mb-3">
                <Icon size={32} className="text-primary"/>
            </div>
            <h6 className='text-muted'>
                {title}
            </h6>
            <h3 className='fw-bold'>
                {value}
            </h3>
        </div>
    </div>
  )
}

export default StatCard