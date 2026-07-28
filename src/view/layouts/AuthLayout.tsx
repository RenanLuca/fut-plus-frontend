import { Outlet } from "react-router";

export function AuthLayout() {
    return (
        <div className="h-full bg-red-500">
            <Outlet/>
        </div>
    )
}