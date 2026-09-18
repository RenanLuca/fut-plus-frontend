import { Outlet } from "react-router";
import { LoginBanner } from "../components/svg/LoginBanner";
import logoFutPlus from "../../app/assets/logo-fut-plus.png";
import logoWhiteFutPlus from "../../app/assets/logo-white-fut-plus.png";

export function AuthLayout() {
  return (
    <div className="h-full w-full overflow-y-auto p-4 sm:p-6 bg-white flex items-center justify-center">
      <div className="w-full max-w-4xl md:h-8/12 rounded-2xl border border-gray-100 flex flex-col md:flex-row overflow-hidden shadow-[0px_20px_60px_-15px_rgba(0,52,1,0.35)]">
        <div className="hidden md:flex relative overflow-hidden w-2/5 bg-linear-to-br from-primary-900 to-forest-900 p-8 flex-col items-center justify-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.15] bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-size-[18px_18px]"
          />
          <div className="relative z-10 flex flex-col items-center gap-2">
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
        </div>
        <div className="w-full md:w-3/5 flex flex-col items-center justify-center py-8 md:py-0">
          <img src={logoFutPlus} alt="Fut+" className="w-28 mb-4 md:hidden" />
          <Outlet />
        </div>
      </div>
    </div>
  );
}