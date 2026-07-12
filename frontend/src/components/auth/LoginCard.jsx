import Card from "../ui/Card";
import BrandingPanel from "./BrandingPanel";
import LoginForm from "./LoginForm";

const LoginCard = () => {
  return (
    <Card className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2">
      <BrandingPanel />

      <div className="p-8">
        <LoginForm />
      </div>
    </Card>
  );
};

export default LoginCard;