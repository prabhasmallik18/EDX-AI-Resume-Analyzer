import { Outlet , NavLink } from "react-router-dom";



const MainLayout = () => {
  return (
    <>
        <nav className="navbar navbar-expand-lg bg-dark navbar-dark">
            <div className="container">
                <NavLink to="/" className="navbar-brand">AI Resume Analyzer</NavLink>
                <div className="navbar-nav ms-auto">
                    <NavLink className={"nav-link"} to="/">Home</NavLink>
                    <NavLink className={"nav-link"} to="/login">Login</NavLink>
                    <NavLink className={"nav-link"} to="/register">Register</NavLink>
                </div>
            </div>
        </nav>
        <main className="container py-4">
            <Outlet/>
        </main>
    </>
  )
}

export default MainLayout