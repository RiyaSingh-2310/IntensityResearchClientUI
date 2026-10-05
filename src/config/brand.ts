export const brand = {
  name: 'Intensity Research',
  shortName: 'Intensity',
  email: 'info@intensityresearch.com',
  website: 'https://intensityresearch.com/',
  websiteLabel: 'intensityresearch.com',
  tagline: 'Where everyday opinions become research insight.',
} as const

export const joinIncentive = {
  label: 'Free to join',
  headline: 'Join the Intensity Research panel',
  body: 'Share your perspective in research studies and earn points you can redeem for rewards.',
  disclaimer:
    'Study availability and reward points vary by profile, eligibility, and individual study requirements. Rewards are not guaranteed earnings.',
}

export const joinHero = {
  /** Rendered uppercase via CSS. */
  eyebrow: 'Intensity Research panel',
  title: 'Join Intensity Research',
  body: 'Create your free account, complete a short profile, and receive research invitations matched to you.',
  highlights: [
    { title: 'Matched studies', copy: 'Based on your profile' },
    { title: 'Your schedule', copy: 'Take part when it suits you' },
    { title: 'Reward points', copy: 'For eligible completed studies' },
  ],
  disclaimer:
    'Survey availability and reward points vary based on your profile, eligibility, and individual study requirements.',
} as const

export const joinWhyJoin = [
  { title: 'Earn reward points', copy: 'Receive points for eligible completed studies and redeem them once you reach the minimum payout.' },
  {
    title: 'Studies that fit you',
    copy: 'Your profile answers help us invite you to research that is relevant to your life and interests.',
  },
  {
    title: 'Privacy first',
    copy: 'Your information is used to match you with research and is never sold as a mailing list.',
  },
] as const

export const joinResearchOpportunities = [
  'Product & service feedback',
  'Brand & advertising research',
  'Shopping & lifestyle studies',
  'Technology & digital experiences',
  'Media & entertainment',
  'Concept & idea testing',
] as const

export const joinMemberTrust = [
  { title: 'Secure & confidential', copy: 'Your personal information is protected and handled with care.' },
  { title: 'Relevant invitations', copy: 'Invitations are matched to the profile you share with us.' },
  { title: 'Transparent rewards', copy: 'Points are credited for eligible completed studies and shown in your history.' },
  { title: 'Always voluntary', copy: 'You decide which studies to take part in.' },
] as const

export const joinSidebarDisclaimer =
  'Survey availability and reward points vary based on eligibility and study requirements.'

export const joinTrust = ['Secure registration', 'Privacy protected', 'Free to join', 'Points for participation'] as const

export const publicNav = [
  { to: '/', label: 'Home', end: true },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/rewards', label: 'Rewards' },
  { to: '/help', label: 'Help' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
] as const

export const memberNav = [
  { to: '/dashboard', label: 'Dashboard', end: true },
  { to: '/surveys', label: 'Surveys' },
  { to: '/redeem-rewards', label: 'Redeem' },
  { to: '/history', label: 'History' },
  { to: '/help', label: 'Help' },
] as const
