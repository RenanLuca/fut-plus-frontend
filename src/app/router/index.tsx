import { AuthLayout } from "@/src/view/layouts/AuthLayout";
import { AppLayout } from "@/src/view/layouts/AppLayout";
import { RequireAuth } from "@/src/view/layouts/RequireAuth";
import { LoginPage } from "@/src/view/pages/Login";
import { SignupPage } from "@/src/view/pages/Signup";
import { VerifyEmailPage } from "@/src/view/pages/VerifyEmail";
import { ForgotPasswordPage } from "@/src/view/pages/ForgotPassword";
import { ResetPasswordPage } from "@/src/view/pages/ResetPassword";
import { ConfirmEmailChangePage } from "@/src/view/pages/ConfirmEmailChange";
import { HomePage } from "@/src/view/pages/Home";
import { InvitePage } from "@/src/view/pages/Invite";
import { GroupsPage } from "@/src/view/pages/Groups";
import { GroupDetailPage } from "@/src/view/pages/GroupDetail";
import { GroupLayout } from "@/src/view/pages/GroupDetail/components/GroupLayout";
import { GroupMembersPage } from "@/src/view/pages/GroupMembers";
import { GroupPaymentsPage } from "@/src/view/pages/GroupPayments";
import { MatchDetailPage } from "@/src/view/pages/MatchDetail";
import { ProfilePage } from "@/src/view/pages/Profile";
import { BrowserRouter, Route, Routes } from "react-router";
export function Router() {
    return (
        <BrowserRouter>
        <Routes>
        <Route element={<AuthLayout />}>
            <Route path="/" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/confirm-email-change" element={<ConfirmEmailChangePage />} />
        </Route>
        <Route path="/invite/:inviteId" element={<InvitePage />} />
        <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
                <Route path="/home" element={<HomePage />} />
                <Route path="/groups" element={<GroupsPage />} />
                <Route path="/groups/:groupId" element={<GroupLayout />}>
                    <Route index element={<GroupDetailPage />} />
                    <Route path="members" element={<GroupMembersPage />} />
                    <Route path="payments" element={<GroupPaymentsPage />} />
                </Route>
                <Route
                    path="/groups/:groupId/matches/:matchId"
                    element={<MatchDetailPage />}
                />
                <Route path="/profile" element={<ProfilePage />} />
            </Route>
        </Route>
        </Routes>
        </BrowserRouter>
    );
}
