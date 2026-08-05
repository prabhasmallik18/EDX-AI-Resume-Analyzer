import AuthCard from "../component/AuthCard";
import InputField from "../component/InputField";
import Button from "../component/Button";
import AuthFooter from "../component/AuthFooter";

import { registerUser } from "../api/authApi";
import { useNavigate } from "react-router-dom";

import useForm from "../hooks/useForm";

const Register = () => {
  const navigate = useNavigate();

  const { formData, handleChange } = useForm({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const response = await registerUser({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      alert(response.message);
      navigate("/login");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <AuthCard
      title="Create Your Account"
      subtitle="Start analyzing your resume with AI"
    >
      <form onSubmit={handleSubmit}>
        <InputField
          label="Full Name"
          type="text"
          id="fullName"
          name="fullName"
          placeholder="Enter your full name"
          value={formData.fullName}
          onChange={handleChange}
        />

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
          placeholder="Create a password"
          value={formData.password}
          onChange={handleChange}
        />

        <InputField
          label="Confirm Password"
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange}
        />

        <Button
          type="submit"
          text="Create Account"
        />

        <AuthFooter
          text="Already have an account?"
          linkText="Login"
          linkTo="/login"
        />
      </form>
    </AuthCard>
  );
};

export default Register;