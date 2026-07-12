import BrandingPanel from "../components/auth/BrandingPanel";
import LoginForm from "../components/auth/LoginForm";

function Login() {
  return (
    <div className="min-h-screen flex bg-slate-950">
      <div className="hidden lg:flex w-2/5">
        <BrandingPanel />
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <LoginForm />
      </div>
    </div>
  );
}

export default Login;
