import { AuthLayout } from "@/src/view/layouts/AuthLayout";
import { LoginPage } from "@/src/view/pages/Login";
import { BrowserRouter, Route, Routes } from "react-router";
export function Router() {
    return (
        <BrowserRouter>
        <Routes>
        <Route element={<AuthLayout />}>
            <Route path="/" element={<LoginPage />} />
        </Route>
            
        </Routes>
        </BrowserRouter>
    );
}