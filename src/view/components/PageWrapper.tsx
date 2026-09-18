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
                <div className="flex items-start justify-between gap-3">
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
