import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="container">
        <div className="row justify-content-center align-items-center" style={{minHeight: "100vh"}}>
            <div className="col-md-6 col-lg-5">
                <Outlet/>
            </div>
        </div>
    </div>
  )
}

export default AuthLayout