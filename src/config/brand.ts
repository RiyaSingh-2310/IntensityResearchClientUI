export const brand = {
  name: 'Intensity Research',
  shortName: 'Intensity',
  email: 'info@intensityresearch.com',
  website: 'https://intensityresearch.com/',
  websiteLabel: 'intensityresearch.com',
  tagline: 'Where everyday opinions become research insight.',
} as const

export const joinIncentive = {
  label: 'Free to Join',
  headline: 'Join the Research Panel',
  body: 'Share your opinions. Participate in research. Earn rewards.',
  disclaimer:
    'Study availability and reward points vary by profile, eligibility, and individual study requirements. Rewards are not guaranteed earnings.',
}

export const joinHighlights = [
  { value: 'Free', label: 'To join and take part', hint: 'No sign-up or membership fees' },
  { value: '5–15 min', label: 'Typical study length', hint: 'Varies by study' },
  { value: 'Points', label: 'For completed studies', hint: 'Credited after approval' },
] as const

export const joinTopics = [
  'Product & service feedback',
  'Brand & advertising research',
  'Shopping & lifestyle studies',
  'Technology & digital experiences',
  'Media & entertainment',
  'Concept & idea testing',
] as const

export const joinBonuses = [
  'Studies matched to the profile you share with us',
  'Points tracked live in your member dashboard',
  'Payout requests you can follow from pending to completed',
  'Product and concept testing opportunities',
] as const

export const joinHero = {
  /** Rendered uppercase via CSS. */
  eyebrow: 'Intensity Research Community',
  title: 'Join Intensity Research',
  body: 'Share your opinions, experiences, and expertise through research studies and receive rewards for eligible participation.',
  highlights: [
    { title: 'Relevant Studies', copy: 'Matched to your profile' },
    { title: 'Flexible Participation', copy: 'Take part when it suits you' },
    { title: 'Earn Rewards', copy: 'For eligible completed studies' },
  ],
  disclaimer:
    'Survey availability and reward points vary based on your profile, eligibility, and individual study requirements.',
} as const

export const joinWhyJoin = [
  { title: 'Earn Rewards', copy: 'Receive points for eligible completed studies and redeem them once you reach the minimum payout.' },
  {
    title: 'Relevant Research Opportunities',
    copy: 'Your profile answers help us invite you to research that is relevant to your life and interests.',
  },
  {
    title: 'Privacy Protected',
    copy: 'Your information is used to match you with research and is never sold as a mailing list.',
  },
] as const

export const joinResearchOpportunities = joinTopics

export const joinMemberTrust = [
  { title: 'Secure & Confidential', copy: 'Your personal information is protected and handled with care.' },
  { title: 'Relevant Opportunities', copy: 'Invitations are matched to the profile you share with us.' },
  { title: 'Fair Rewards', copy: 'Points are credited for eligible completed studies and shown in your history.' },
  { title: 'Voluntary Participation', copy: 'You decide which studies to take part in.' },
] as const

export const joinSidebarDisclaimer =
  'Survey availability and reward points vary based on eligibility and study requirements.'

export const joinTrust = ['Secure registration', 'Privacy protected', 'Free to join', 'Points for participation'] as const

export const publicNav = [
  { to: '/', label: 'Home', end: true },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/rewards', label: 'Rewards' },
  { to: '/help', label: 'Help' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
] as const

export const memberNav = [
  { to: '/dashboard', label: 'Dashboard', end: true },
  { to: '/', label: 'Home', end: true },
  { to: '/rewards', label: 'Rewards' },
  { to: '/redeem-rewards', label: 'Redeem Rewards' },
  { to: '/history', label: 'Reward History' },
  { to: '/contact', label: 'Contact' },
] as const
