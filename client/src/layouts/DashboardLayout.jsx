import { Outlet } from "react-router-dom";
import Sidebar from "../component/dashboard/Sidebar";
import Topbar from "../component/dashboard/Topbar";


const DashboardLayout = () => {
  return (
    <div className="d-flex">
        <Sidebar/>
        <div className="flex-grow-1 bg-light">
            <Topbar/>
        
        <main className="p-4">
            <Outlet/>
        </main>
        </div>
    </div>
  )
}

export default DashboardLayout