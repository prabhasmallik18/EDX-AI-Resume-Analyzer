import AuthCard from "../component/AuthCard";
import InputField from "../component/InputField";
import Button from "../component/Button";
import AuthFooter from "../component/AuthFooter";

import useForm from "../hooks/useForm";

const Register = () => {


  const {formData, handleChange} = useForm({fullName: "",
    email: "",
    password: "",
    confirmPassword: "",})
  const handleSubmit = (event) => {
    event.preventDefault();

    // if (!formData.email || !formData.password) {
    //   setError("Please fill in all fields");
    //   return;
    // }
    // setError("");
    console.log(formData);
  };

  return (
    <AuthCard title={"Create Account"} subtitle={"Let's get you started"}>
      <form onSubmit={handleSubmit}>
        <InputField
          label="Full Name"
          type="text"
          id="fullName"
          name="fullName"
          placeholder="Enter your fullname"
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
          placeholder="Enter your password"
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
        <Button text={"Create Account"} type="submit"/>
        <AuthFooter text="Already have an account?" linkText={"Login"} linkTo={"/login"}/>
      </form>
    </AuthCard>
  );
};

export default Register;
