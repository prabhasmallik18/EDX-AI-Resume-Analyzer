import { Link } from "react-router-dom";

const AuthFooter = ({
  text,
  linkText,
  linkTo,
}) => {
  return (
    <div className="text-center mt-4">

      <hr className="mb-4" />

      <p className="text-muted mb-0">
        {text}{" "}

        <Link
          to={linkTo}
          className="fw-bold text-decoration-none"
          style={{
            color: "#2563eb",
          }}
        >
          {linkText}
        </Link>

      </p>

    </div>
  );
};

export default AuthFooter;