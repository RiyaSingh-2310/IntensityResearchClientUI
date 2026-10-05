import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { GuestRoute, ProtectedRoute } from '@/components/auth/RouteGuards'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { ScrollToTop } from '@/components/shared/ScrollToTop'
import { legacyPanelistRedirects, paths } from '@/config/paths'
import { AuthProvider } from '@/context/AuthContext'
import { JoinPage } from '@/pages/auth/JoinPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { VerifyPage } from '@/pages/auth/VerifyPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { DashboardPage } from '@/pages/panelist/DashboardPage'
import { HistoryPage } from '@/pages/panelist/HistoryPage'
import { ProjectsPage } from '@/pages/panelist/ProjectsPage'
import { RedeemRewardsPage } from '@/pages/panelist/RedeemRewardsPage'
import { SettingsPage } from '@/pages/panelist/SettingsPage'
import { AboutPage } from '@/pages/public/AboutPage'
import { ContactPage } from '@/pages/public/ContactPage'
import { HelpPage } from '@/pages/public/HelpPage'
import { HomePage } from '@/pages/public/HomePage'
import { HowItWorksPage } from '@/pages/public/HowItWorksPage'
import { PrivacyPolicyPage } from '@/pages/public/PrivacyPolicyPage'
import { RewardsPage } from '@/pages/public/RewardsPage'
import { TermsConditionsPage } from '@/pages/public/TermsConditionsPage'

function VerifySearchRedirect() {
  const { search, hash } = useLocation()
  return <Navigate to={`${paths.verifyEmail}${search}${hash}`} replace />
}

function VerifyPathRedirect() {
  const { token } = useParams()
  const query = token ? `?token=${encodeURIComponent(token)}` : ''
  return <Navigate to={`${paths.verifyEmail}${query}`} replace />
}

function LegacyPanelistRedirect() {
  const { pathname } = useLocation()
  return <Navigate to={legacyPanelistRedirects[pathname] ?? paths.dashboard} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path={paths.home} element={<HomePage />} />
            <Route path={paths.howItWorks} element={<HowItWorksPage />} />
            <Route path={paths.rewards} element={<RewardsPage />} />
            <Route path={paths.help} element={<HelpPage />} />
            <Route path={paths.about} element={<AboutPage />} />
            <Route path={paths.contact} element={<ContactPage />} />
            <Route path={paths.privacyPolicy} element={<PrivacyPolicyPage />} />
            <Route path={paths.termsConditions} element={<TermsConditionsPage />} />
            <Route path={paths.join} element={<JoinPage />} />
            <Route path={paths.verifyEmail} element={<VerifyPage />} />
            <Route path={`${paths.verifyEmail}/:token`} element={<VerifyPage />} />
            <Route path="/verify" element={<VerifySearchRedirect />} />
            <Route path="/verify/:token" element={<VerifyPathRedirect />} />
            <Route path={paths.resetPassword} element={<LoginPage />} />
            <Route element={<GuestRoute />}>
              <Route path={paths.login} element={<LoginPage />} />
              <Route path={paths.forgotPassword} element={<LoginPage />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path={paths.dashboard} element={<DashboardPage />} />
              <Route path={paths.redeemRewards} element={<RedeemRewardsPage />} />
              <Route path={paths.history} element={<HistoryPage />} />
              <Route path={paths.settings} element={<SettingsPage />} />
              <Route path={paths.surveys} element={<ProjectsPage />} />
            </Route>
          </Route>

          <Route path="/panelist" element={<LegacyPanelistRedirect />} />
          <Route path="/panelist/*" element={<LegacyPanelistRedirect />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
