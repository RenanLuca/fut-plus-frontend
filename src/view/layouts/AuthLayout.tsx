import { Outlet } from "react-router";
import { LoginBanner } from "../components/svg/LoginBanner";
import logoFutPlus from "../../app/assets/logo-fut-plus.png";
import logoWhiteFutPlus from "../../app/assets/logo-white-fut-plus.png";

export function AuthLayout() {
  return (
    <div className="h-full w-full overflow-y-auto p-4 sm:p-6 bg-white flex items-center justify-center">
      <div className="w-full max-w-4xl md:h-8/12 rounded-md flex flex-col md:flex-row overflow-hidden shadow-[0px_9px_38px_rgba(0,0,0,0.3),0px_15px_12px_rgba(0,0,0,0.22)]">
        <div className="hidden md:flex w-2/5 bg-primary-900 p-8 flex-col items-center justify-center">
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
        <div className="w-full md:w-3/5 flex flex-col items-center justify-center py-8 md:py-0">
          <img src={logoFutPlus} alt="Fut+" className="w-28 mb-4 md:hidden" />
          <Outlet />
        </div>
      </div>
    </div>
  );
}