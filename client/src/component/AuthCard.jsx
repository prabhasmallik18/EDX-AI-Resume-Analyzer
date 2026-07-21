

const AuthCard = ({title, subtitle, children}) => {
  return (
    <div className="card shadow border-0">
        <div className="card-body p-4">
            <h2 className="text-center mb-2">{title}</h2>
            <p className="text-center mb-4 text-muted">{subtitle}</p>
            {children}
        </div>
    </div>
  )
}

export default AuthCard