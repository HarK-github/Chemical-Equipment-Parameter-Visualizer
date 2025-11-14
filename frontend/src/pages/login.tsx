import AuthForm from "./form";

function Login() {
  return (
    <div className="flex flex-col justify-center ">
      <AuthForm method="login" route="/api/token/" />
    </div>
  );
}

export default Login;
