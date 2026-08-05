const StatCard = ({ title, icon: Icon, value }) => {
  return (
    <div
      className="card h-100 border-0"
      style={{
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
        transition: "all .3s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-8px)";
        e.currentTarget.style.boxShadow =
          "0 18px 40px rgba(37,99,235,.20)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 12px 30px rgba(0,0,0,.08)";
      }}
    >
      {/* Top Border */}
      <div
        style={{
          height: "5px",
          background:
            "linear-gradient(90deg,#2563eb,#4f46e5,#7c3aed)",
        }}
      />

      <div className="card-body p-4">

        <div className="d-flex justify-content-between align-items-center">

          <div>

            <p
              className="text-uppercase text-secondary mb-2"
              style={{
                fontSize: "12px",
                letterSpacing: "1px",
                fontWeight: "600",
              }}
            >
              {title}
            </p>

            <h2
              className="fw-bold mb-1"
              style={{
                color: "#0f172a",
              }}
            >
              {value}
            </h2>

            <small className="text-muted">
              Updated just now
            </small>

          </div>

          <div
            className="d-flex justify-content-center align-items-center"
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "18px",
              background:
                "linear-gradient(135deg,#2563eb,#4f46e5)",
              color: "#fff",
            }}
          >
            <Icon size={32} />
          </div>

        </div>

      </div>
    </div>
  );
};

export default StatCard;