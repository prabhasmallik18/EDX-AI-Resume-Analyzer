import { Outlet } from "react-router-dom";
import Sidebar from "../component/dashboard/Sidebar";
import Topbar from "../component/dashboard/Topbar";

const DashboardLayout = () => {
  return (
  <div className="dashboard-layout">
  <Sidebar />

  <div className="dashboard-content">
    <Topbar />

    <main className="dashboard-main">
      <Outlet />
    </main>
  </div>
</div>   
  );
};

export default DashboardLayout;