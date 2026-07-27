import { NavLink } from "react-router-dom"

const Sidebar = () => {
  return (
    <aside className="bg-dark text-white p-4" style={{minHeight:"100vh", width:"250px"}}>
        <h3 className="mb-5">AI Resume Analyzer</h3>
        <nav className="d-flex flex-column gap-3">
            <NavLink className={"text-white text-decoration-none"} to={"/dashboard"}>Dashboard</NavLink>
            <NavLink className={"text-white text-decoration-none"} to={"/dashboard/upload"}>Upload Resume</NavLink>
            <NavLink className={"text-white text-decoration-none"} to={"/dashboard/history"}>Analysis History</NavLink>
            <NavLink className={"text-white text-decoration-none"} to={"/dashboard/profile"}>Profile</NavLink>
            <NavLink className={"text-white text-decoration-none"} to={"/dashboard/login"}>Logout</NavLink>
        </nav>
    </aside>
  )
}

export default Sidebar


