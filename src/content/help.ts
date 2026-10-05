export const helpHero = {
  titleLead: 'How can we',
  titleAccent: 'help you?',
  description: 'Find answers about your account, assigned surveys, points, and payouts.',
  searchPlaceholder: 'Search help topics and FAQs…',
}

export const helpCategories = [
  {
    id: 'getting-started',
    title: 'Getting started',
    icon: 'smartphone',
    articles: [
      {
        title: 'Creating an account',
        copy: 'Select Join, complete each registration step, review your answers, then verify your email before logging in.',
        icon: 'user',
      },
      {
        title: 'Verifying your email',
        copy: 'Open the link in the verification email. If it hasn’t arrived, request a new one from the login page.',
        icon: 'badge',
      },
      {
        title: 'Your dashboard',
        copy: 'See your available points, ongoing surveys, recent activity, and shortcuts to redeem.',
        icon: 'layout',
      },
      {
        title: 'Keeping your profile current',
        copy: 'Update your profile answers under Profile & settings so invitations stay relevant.',
        icon: 'pencil',
      },
    ],
  },
  {
    id: 'surveys',
    title: 'Surveys & points',
    icon: 'trending',
    articles: [
      {
        title: 'Finding your surveys',
        copy: 'Every survey assigned to you is listed on the Surveys page. Filter by Ongoing, Completed, Terminated, or Quota full.',
        icon: 'search',
      },
      {
        title: 'Continuing a survey',
        copy: 'Ongoing surveys show a Continue survey button that opens the study in a new tab.',
        icon: 'clipboard',
      },
      {
        title: 'Terminated and quota full',
        copy: 'Terminated means you did not match the study criteria. Quota full means enough responses were collected.',
        icon: 'clock',
      },
      {
        title: 'How points are credited',
        copy: 'Points for a completed survey show as Pending until they are approved, then Credited to your balance.',
        icon: 'chart',
      },
    ],
  },
  {
    id: 'rewards',
    title: 'Rewards & payouts',
    icon: 'gem',
    articles: [
      {
        title: 'Requesting a payout',
        copy: 'On Redeem, choose a payout method and the points to redeem, then submit your request.',
        icon: 'gift',
      },
      {
        title: 'Payout methods',
        copy: 'Available methods are listed on the Rewards page and may change over time.',
        icon: 'wallet',
      },
      {
        title: 'Minimum payout',
        copy: 'You can request a payout once your redeemable balance reaches the minimum shown on the Rewards page.',
        icon: 'zap',
      },
      {
        title: 'Tracking a request',
        copy: 'History shows each request as Pending, Approved, Rejected, or Completed.',
        icon: 'truck',
      },
    ],
  },
  {
    id: 'account',
    title: 'Account & security',
    icon: 'settings',
    articles: [
      {
        title: 'Forgot your password',
        copy: 'Use Forgot password on the login page and follow the link sent to your email.',
        icon: 'key',
      },
      {
        title: 'Changing your password',
        copy: 'While logged in, open Profile & settings and use the Change password section.',
        icon: 'shield',
      },
      {
        title: 'Updating your details',
        copy: 'Edit your personal details, photo, and profile answers in Profile & settings.',
        icon: 'users',
      },
      {
        title: 'Something not working?',
        copy: 'Refresh the page and try again. If the problem continues, contact the panel team.',
        icon: 'wrench',
      },
    ],
  },
] as const

export const helpFaqs = [
  {
    q: 'How long does a payout take?',
    a: 'Every payout request is reviewed by our team. You can follow its status — Pending, Approved, Rejected, or Completed — in your History.',
  },
  {
    q: 'Why was a survey terminated?',
    a: 'Studies have screening criteria and quotas. A terminated survey usually means you did not match the study’s criteria. Keep your profile current to get better matches.',
  },
  {
    q: 'How can I earn more points?',
    a: 'Complete the surveys assigned to you and keep your profile answers up to date so invitations stay relevant. Point values are set per study.',
  },
  {
    q: 'What’s the minimum I can redeem?',
    a: 'The minimum payout is shown on the Rewards and Redeem pages. You can request a payout once your redeemable balance reaches it.',
  },
  {
    q: 'Why are some of my points held?',
    a: 'When you submit a payout request, those points are held until the request is reviewed, so they can’t be redeemed twice.',
  },
  {
    q: 'Can I change a payout request after submitting it?',
    a: 'Submitted requests go to review. If you need to change something, contact the panel team with the request date and method.',
  },
]
