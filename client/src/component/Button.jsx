

const Button = ({type="button", text, clasName=""}) => {
  return (
    <button
        type={type}
        className= {`btn btn-primary w-100 ${clasName}`}
    >
        {text}
    </button>
  )
}

export default Button