const InputField = ({
  type,
  id,
  name,
  placeholder,
  value,
  onChange,
  label,
}) => {
  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="form-label fw-semibold text-dark"
      >
        {label}
      </label>

      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="form-control"
        style={{
          height: "52px",
          borderRadius: "14px",
          border: "1px solid #dbe4f0",
          padding: "0 16px",
          fontSize: "15px",
          transition: "all .3s ease",
          boxShadow: "none",
        }}
        onFocus={(e) => {
          e.target.style.border = "1px solid #2563eb";
          e.target.style.boxShadow =
            "0 0 0 4px rgba(37,99,235,.15)";
        }}
        onBlur={(e) => {
          e.target.style.border = "1px solid #dbe4f0";
          e.target.style.boxShadow = "none";
        }}
      />
    </div>
  );
};

export default InputField;