import { House, LogOut, Users, User as UserIcon } from "lucide-react";
import { NavLink, Outlet } from "react-router";
import { useAuth } from "@/src/app/hooks/useAuth";
import { useCurrentUser } from "@/src/app/hooks/useCurrentUser";
import { getInitials } from "@/src/app/utils/get-initials";
import { cn } from "@/src/app/utils/cn";
import {
    Avatar,
    AvatarFallback,
} from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import logoFutPlus from "../../app/assets/logo-fut-plus.png";

const NAV_ITEMS = [
    { to: "/home", label: "Home", icon: House },
    { to: "/groups", label: "Grupos", icon: Users },
    { to: "/profile", label: "Perfil", icon: UserIcon },
];

export function AppLayout() {
    const { logout } = useAuth();
    const { data: user } = useCurrentUser();

    return (
        <div className="h-full w-full flex flex-col md:flex-row bg-ice-300">
            <aside className="hidden md:flex md:w-56 md:flex-col md:border-r md:border-gray-100 md:bg-white md:p-4 md:gap-6">
                <img src={logoFutPlus} alt="Fut+" className="w-24" />
                <nav className="flex flex-col gap-1">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-pale-100",
                                    isActive && "bg-pale-100 text-primary-900",
                                )
                            }
                        >
                            <item.icon className="size-4" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            <div className="flex flex-col flex-1 min-h-0">
                <header className="flex items-center justify-between gap-3 border-b border-gray-100 bg-white p-4">
                    <img src={logoFutPlus} alt="Fut+" className="w-20 md:hidden" />
                    <div className="flex items-center gap-3 ml-auto">
                        {user && (
                            <div className="hidden sm:flex flex-col items-end leading-tight">
                                <span className="text-sm font-medium">{user.name}</span>
                                <span className="text-xs text-muted-foreground">{user.email}</span>
                            </div>
                        )}
                        <Avatar>
                            <AvatarFallback>
                                {user ? getInitials(user.name) : "?"}
                            </AvatarFallback>
                        </Avatar>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Sair"
                            onClick={() => logout()}
                        >
                            <LogOut className="size-4" />
                        </Button>
                    </div>
                </header>

                <main className="flex-1 min-h-0 overflow-y-auto p-4 pb-24 md:pb-4">
                    <Outlet />
                </main>
            </div>

            <nav className="md:hidden fixed inset-x-0 bottom-0 flex justify-around border-t border-gray-100 bg-white py-2">
                {NAV_ITEMS.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            cn(
                                "flex flex-col items-center gap-0.5 px-4 py-1 text-xs font-medium text-gray-500",
                                isActive && "text-primary-900",
                            )
                        }
                    >
                        <item.icon className="size-5" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}
