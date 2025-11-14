import AuthForm from "./form";

function Register() {
  return (
    <div>
      <AuthForm method="register" route="/api/token/" />
    </div>
  );
}

export default Register;
