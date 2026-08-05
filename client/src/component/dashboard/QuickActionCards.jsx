import { ArrowRight } from "lucide-react";

const QuickActionCards = ({
  title,
  description,
  icon: Icon,
  onClick,
}) => {
  return (
    <div
      className="card border-0 h-100"
      role="button"
      onClick={onClick}
      style={{
        borderRadius: "20px",
        cursor: "pointer",
        overflow: "hidden",
        transition: "all .3s ease",
        boxShadow: "0 12px 30px rgba(0,0,0,.08)",
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
      <div
        style={{
          height: "5px",
          background:
            "linear-gradient(90deg,#2563eb,#4f46e5,#7c3aed)",
        }}
      />

      <div className="card-body p-4">

        <div className="d-flex justify-content-between align-items-center mb-4">

          <div
            className="d-flex justify-content-center align-items-center"
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "16px",
              background:
                "linear-gradient(135deg,#2563eb,#4f46e5)",
              color: "#fff",
            }}
          >
            <Icon size={28} />
          </div>

          <ArrowRight
            size={22}
            className="text-primary"
          />

        </div>

        <h5 className="fw-bold">
          {title}
        </h5>

        <p className="text-muted mb-0">
          {description}
        </p>

      </div>
    </div>
  );
};

export default QuickActionCards;