import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import Login from "../pages/Login";
import Register from "../pages/Register";
import NotFound from "../pages/NotFound";
import Dashboard from "../pages/Dashboard";
import UploadResume from "../pages/UploadResume";
import AnalysisHistory from "../pages/AnalysisHistory";
import Profile from "../pages/Profile";
import ResumeAnalysis from "../pages/ResumeAnalysis";
import Home from "../pages/Home";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/upload" element={<UploadResume />} />
          <Route path="/dashboard/history" element={<AnalysisHistory />} />
          <Route path="/dashboard/profile" element={<Profile />} />
          <Route path="/resume/:id" element={<ResumeAnalysis />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
