import AuthForm from "./form";

function Login() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 ">
      <AuthForm method="login" route="/api/token/" />
    </div>
  );
}

export default Login;
