export const paths = {
  home: '/',
  howItWorks: '/how-it-works',
  rewards: '/rewards',
  redeemRewards: '/redeem-rewards',
  help: '/help',
  about: '/about',
  contact: '/contact',
  privacyPolicy: '/privacy-policy',
  termsConditions: '/terms-conditions',
  join: '/join',
  login: '/login',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  verifyEmail: '/verify-email',
  dashboard: '/dashboard',
  history: '/history',
  profile: '/profile',
  settings: '/settings',
  additionalProfile: '/additional-profile',
  surveys: '/surveys',
} as const

/** Where to go after signing in: the page that sent the user to login, if it is an in-app path. */
export function returnPath(from: unknown) {
  return typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') ? from : paths.dashboard
}

export const legacyPanelistRedirects: Record<string, string> = {
  '/panelist': paths.dashboard,
  '/panelist/dashboard': paths.dashboard,
  '/panelist/rewards': paths.rewards,
  '/panelist/redeem-rewards': paths.redeemRewards,
  '/panelist/reward-requests': paths.history,
  '/panelist/reward-history': paths.history,
  '/panelist/profile': paths.profile,
  '/panelist/projects': paths.surveys,
}
