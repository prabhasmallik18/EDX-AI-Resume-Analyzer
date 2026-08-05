const AuthCard = ({ title, subtitle, children }) => {
  return (
    <div
      className="card border-0 mx-auto"
      style={{
        maxWidth: "460px",
        borderRadius: "24px",
        overflow: "hidden",
        boxShadow: "0 20px 50px rgba(37,99,235,.15)",
      }}
    >
      {/* Top Gradient */}
      <div
        style={{
          height: "8px",
          background:
            "linear-gradient(90deg,#2563eb,#4f46e5,#7c3aed)",
        }}
      />

      <div className="card-body p-5">

        <div className="text-center mb-4">

          <div
            className="mx-auto mb-3 d-flex justify-content-center align-items-center"
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "18px",
              background:
                "linear-gradient(135deg,#2563eb,#4f46e5)",
              color: "#fff",
              fontSize: "30px",
              fontWeight: "bold",
            }}
          >
            AI
          </div>

          <h2 className="fw-bold mb-2">
            {title}
          </h2>

          <p className="text-muted mb-0">
            {subtitle}
          </p>

        </div>

        {children}

      </div>
    </div>
  );
};

export default AuthCard;