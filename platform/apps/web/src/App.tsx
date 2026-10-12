import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./lib/auth";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Home } from "./pages/Home";
import { BrandPage } from "./pages/Brand";
import { StrategyPage } from "./pages/Strategy";
import { ContentStudio } from "./pages/ContentStudio";
import { ContentDetail } from "./pages/ContentDetail";
import { CalendarPage } from "./pages/Calendar";
import { ApprovalsPage } from "./pages/Approvals";
import { SettingsPage } from "./pages/Settings";
import { ComingSoon } from "./pages/ComingSoon";
import { InvitePage } from "./pages/Invite";
import { ForgotPassword, ResetPassword } from "./pages/PasswordReset";
import { AdminPage } from "./pages/Admin";

export function App() {
  const { me, loading, workspace } = useAuth();
  if (loading) {
    return (
      <div className="auth-main" role="status">
        <span className="spinner" /> Chargement…
      </div>
    );
  }
  if (!me) {
    return (
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/invite" element={<InvitePage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }
  if (!workspace) {
    if (location.pathname === "/invite") return <InvitePage />;
    return <div className="auth-main">Aucun espace de travail accessible. Contactez l'administrateur de votre organisation.</div>;
  }
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="brand" element={<BrandPage />} />
        <Route path="strategy" element={<StrategyPage />} />
        <Route path="content" element={<ContentStudio />} />
        <Route path="content/:id" element={<ContentDetail />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="approvals" element={<ApprovalsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="soon/:module" element={<ComingSoon />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="invite" element={<InvitePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
