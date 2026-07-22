const InputField = ({type, id, name, placeholder, value, onChange, label}) => {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <input 
      type={type}
      id={id}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="form-control" />
    </div>
  );
};

export default InputField;
