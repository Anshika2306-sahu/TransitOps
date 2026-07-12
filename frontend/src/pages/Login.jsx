import BrandingPanel from "../components/auth/BrandingPanel";
import LoginForm from "../components/auth/LoginForm";

function Login() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-[#1A0B2E] via-[#2D1B69] to-[#1A0B2E] flex">
      {/* Background Glows */}
      <div className="absolute -top-32 -left-20 w-[40rem] h-[40rem] bg-violet-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[50rem] h-[50rem] bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="hidden lg:flex w-2/5 relative z-10">
        <BrandingPanel />
      </div>

      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <LoginForm />
      </div>
    </div>
  );
}

export default Login;
