import { AuthLayout } from "@/src/view/layouts/AuthLayout";
import { LoginPage } from "@/src/view/pages/Login";
import { SignupPage } from "@/src/view/pages/Signup";
import { HomePage } from "@/src/view/pages/Home";
import { BrowserRouter, Route, Routes } from "react-router";
export function Router() {
    return (
        <BrowserRouter>
        <Routes>
        <Route element={<AuthLayout />}>
            <Route path="/" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
        </Route>
        <Route path="/home" element={<HomePage />} />
        </Routes>
        </BrowserRouter>
    );
}