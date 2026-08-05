const Button = ({
  type = "button",
  text,
  clasName = "",
}) => {
  return (
    <button
      type={type}
      className={`btn w-100 fw-semibold ${clasName}`}
      style={{
        height: "52px",
        borderRadius: "14px",
        border: "none",
        background:
          "linear-gradient(135deg,#2563eb,#4f46e5)",
        color: "#fff",
        fontSize: "16px",
        transition: "all .3s ease",
        boxShadow: "0 10px 25px rgba(37,99,235,.25)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow =
          "0 15px 35px rgba(37,99,235,.35)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 10px 25px rgba(37,99,235,.25)";
      }}
    >
      {text}
    </button>
  );
};

export default Button;