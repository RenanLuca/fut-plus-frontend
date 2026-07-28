import { BrowserRouter, Route, Routes } from "react-router";
import { LoginPage } from "../view/pages/Login";
import { AuthLayout } from "../view/layouts/AuthLayout";

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