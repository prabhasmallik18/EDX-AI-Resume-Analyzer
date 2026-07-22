import { Link } from "react-router-dom"

const AuthFooter = ({text, linkText, linkTo}) => {
  return (
    <p className="text-center mt-4 mb-0">
       {text} {" "}
          <Link to={linkTo}>{linkText}</Link>
    </p>
  )
}

export default AuthFooter