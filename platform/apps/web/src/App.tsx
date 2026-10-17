import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./lib/auth";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Home } from "./pages/Home";
import { BrandPage } from "./pages/Brand";
import { SocialAuditPage } from "./pages/SocialAudit";
import { StrategyPage } from "./pages/Strategy";
import { ContentStudio } from "./pages/ContentStudio";
import { ContentDetail } from "./pages/ContentDetail";
import { CalendarPage } from "./pages/Calendar";
import { ApprovalsPage } from "./pages/Approvals";
import { SettingsPage } from "./pages/Settings";
import { ComingSoon } from "./pages/ComingSoon";
import { CopilotPage } from "./pages/Copilot";
import { InvitePage } from "./pages/Invite";
import { ForgotPassword, ResetPassword } from "./pages/PasswordReset";
import { AdminPage } from "./pages/Admin";
import { CrmPage } from "./pages/Crm";
import { CampaignsPage, CampaignDetailPage } from "./pages/Campaigns";
import { PublicFormPage } from "./pages/PublicForm";
import { SocialCallbackPage, SocialHubPage } from "./pages/SocialHub";
import { CreativeBriefPage, CreativeStudioPage } from "./pages/CreativeStudio";
import { VideoProjectPage, VideoStudioPage } from "./pages/VideoStudio";
import { AnalyticsPage } from "./pages/Analytics";
import { BillingReturnPage, DemoCheckoutPage } from "./pages/Billing";
import { VerifyEmailPage } from "./pages/VerifyEmail";
import { useLocation } from "react-router-dom";
import { PrivacyPage, TermsPage } from "./pages/Legal";

/** Pages légales publiques (exigées par TikTok, Meta, LinkedIn, Google). */
const LEGAL_PATHS = ["/confidentialite", "/privacy", "/conditions", "/terms"];

export function App() {
  const { me, loading, workspace } = useAuth();
  const loc = useLocation();
  // Formulaires publics : accessibles connecté ou non, sans l'interface de l'application.
  if (loc.pathname.startsWith("/f/") || loc.pathname.startsWith("/pay/demo/") || LEGAL_PATHS.includes(loc.pathname)) {
    return (
      <Routes>
        <Route path="/confidentialite" element={<PrivacyPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/conditions" element={<TermsPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/f/:slug" element={<PublicFormPage />} />
        <Route path="/pay/demo/:id" element={<DemoCheckoutPage />} />
      </Routes>
    );
  }
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
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }
  if (!workspace) {
    if (loc.pathname === "/invite") return <InvitePage />;
    return <div className="auth-main">Aucun espace de travail accessible. Contactez l'administrateur de votre organisation.</div>;
  }
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="audit" element={<SocialAuditPage />} />
        <Route path="brand" element={<BrandPage />} />
        <Route path="strategy" element={<StrategyPage />} />
        <Route path="content" element={<ContentStudio />} />
        <Route path="content/:id" element={<ContentDetail />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="approvals" element={<ApprovalsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="soon/:module" element={<ComingSoon />} />
        <Route path="copilot" element={<CopilotPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="crm" element={<CrmPage />} />
        <Route path="social" element={<SocialHubPage />} />
        <Route path="social/callback/:connector" element={<SocialCallbackPage />} />
        <Route path="creative" element={<CreativeStudioPage />} />
        <Route path="creative/:id" element={<CreativeBriefPage />} />
        <Route path="video" element={<VideoStudioPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="billing/return" element={<BillingReturnPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />
        <Route path="video/:id" element={<VideoProjectPage />} />
        <Route path="campaigns" element={<CampaignsPage />} />
        <Route path="campaigns/:id" element={<CampaignDetailPage />} />
        <Route path="invite" element={<InvitePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
