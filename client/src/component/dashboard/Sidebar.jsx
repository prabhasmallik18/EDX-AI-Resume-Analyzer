import { NavLink } from "react-router-dom"

const Sidebar = () => {
  return (
    <aside className="bg-dark text-white p-4" style={{minHeight:"100vh", width:"250px"}}>
        <h3 mb-3>AI Resume Analyzer</h3>
        <nav className="d-flex flex-column gap-3">
            <NavLink className={"text-white text-decoration-none"}>Dashboard</NavLink>
        </nav>
    </aside>
  )
}

export default Sidebar


//Dashboard
//Uplaod resime
//Analysis history
// profile