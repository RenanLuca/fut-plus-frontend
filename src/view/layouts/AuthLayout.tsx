import { Outlet } from "react-router";
import { LoginBanner } from "../components/svg/LoginBanner";
import logoWhiteFutPlus from "../../app/assets/logo-white-fut-plus.png";

export function AuthLayout() {
  return (
    <div className="h-full w-full p-4 bg-white flex items-center justify-center">
      <div className="h-8/12 w-8/12 max-w-4xl rounded-md flex items-center shadow-[0px_9px_38px_rgba(0,0,0,0.3),0px_15px_12px_rgba(0,0,0,0.22)]">
        <div className="w-2/5 h-full bg-primary-900 p-8 rounded-l-md flex flex-col items-center justify-center">
          <img src={logoWhiteFutPlus} alt="Fut+" className="w-32" />
          <LoginBanner
            color="var(--color-primary-400)"
            width={300}
            height={300}
          />
          <p className="font-medium text-white text-sm text-center tracking-wide">
            A sua pelada de sempre, organizada como nunca!
          </p>
        </div>
        <div className="w-3/5 h-full flex flex-col items-center justify-center rounded-r-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}