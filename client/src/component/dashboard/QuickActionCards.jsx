import { ArrowRight } from "lucide-react"



const QuickActionCards = ({title, description, icon:Icon, onClick}) => {
  return (
    <div className="card border-0 shadow-sm h-100" role="button" onClick={onClick} style={{cursor: "pointer"}}>
        <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
                <Icon
                    size={32}
                    className="text-primary mb-3"
                />
                <ArrowRight size={20} className="text-primary"/>
            </div>
            <h5>{title}</h5>
            <p className="text-muted">{description}</p>
        </div>
    </div>
  )
}

export default QuickActionCards