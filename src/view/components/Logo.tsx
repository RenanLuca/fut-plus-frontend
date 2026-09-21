import { cn } from "@/src/app/utils/cn";
import logoFutPlus from "../../app/assets/logo-fut-plus.png";
import logoWhiteFutPlus from "../../app/assets/logo-white-fut-plus.png";

export function Logo({
    className,
    wrapperClassName,
}: {
    className?: string;
    wrapperClassName?: string;
}) {
    return (
        <div className={cn("flex", wrapperClassName)}>
            <img src={logoFutPlus} alt="Fut+" className={cn("dark:hidden", className)} />
            <img
                src={logoWhiteFutPlus}
                alt=""
                aria-hidden
                className={cn("hidden dark:block", className)}
            />
        </div>
    );
}
