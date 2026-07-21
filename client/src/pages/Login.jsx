import { Link } from "react-router-dom";
import { useState } from "react";

import AuthCard from "../component/AuthCard";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (event) =>{
    const {name, value} = event.target;
    setFormData((prevData)=>({
    ...prevData,
    [name]: value,
  }))
  }
  

  return (
    <AuthCard title={"Welcome Back"} subtitle={"Login to continue"}>
      <form>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="form-control"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          ></input>
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="form-control"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            name="password"
          ></input>
        </div>
        <button className="btn btn-primary w-100">Login</button>
        <p className="text-center mt-4 mb-0">
          Don't have an account? {""}
          <Link to={"/register"}>Register</Link>
        </p>
      </form>
    </AuthCard>
  );
};

export default Login;
