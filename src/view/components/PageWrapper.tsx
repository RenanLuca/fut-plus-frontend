import type { ReactNode } from "react";

type PageWrapperProps = {
    title?: ReactNode;
    actions?: ReactNode;
    children: ReactNode;
};

export function PageWrapper({ title, actions, children }: PageWrapperProps) {
    return (
        <div className="flex w-full flex-col gap-6 rounded-xl bg-white p-5 shadow-sm sm:p-6">
            {(title || actions) && (
                <div className="sticky top-0 z-10 -mx-5 -mt-5 flex items-start justify-between gap-3 bg-white px-5 pt-5 pb-2 sm:-mx-6 sm:-mt-6 sm:px-6 sm:pt-6">
                    {title &&
                        (typeof title === "string" ? (
                            <h1 className="text-xl font-bold text-primary-900">{title}</h1>
                        ) : (
                            <div className="flex flex-col gap-1.5">{title}</div>
                        ))}
                    {actions}
                </div>
            )}
            <div className="flex flex-col gap-6">{children}</div>
        </div>
    );
}
