
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { loginUser } from "../api/authApi";

import AuthCard from "../component/AuthCard";
import InputField from "../component/InputField";
import Button from "../component/Button";
import AuthFooter from "../component/AuthFooter";

import useForm from "../hooks/useForm";

const Login = () => {
  const navigate = useNavigate()
  const [error, setError] = useState("");

  const {formData, handleChange} = useForm({email: "", password:""})


  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    try{
        setError("");

        const response = await loginUser(formData)
        localStorage.setItem("token", response.token)
        localStorage.setItem("user", JSON.stringify(response.data))
        navigate("/dashboard")
    }catch (error){
      setError(error.message)
    }
    
  
  };

  return (
    <AuthCard title={"Welcome Back"} subtitle={"Login to continue"}>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <InputField
          label="Email Address"
          type="email"
          id="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
        />
        <InputField
          label="Password"
          type="password"
          id="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
        />
        <Button text={"Login"} type="submit"/>
        <AuthFooter text="Don't have an account?" linkText={"Register"} linkTo={"/register"}/>
      </form>
    </AuthCard>
  );
};



export default Login;
