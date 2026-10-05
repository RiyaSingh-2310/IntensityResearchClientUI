export const rewardsHero = {
  eyebrow: 'Rewards',
  titleLead: 'Your opinions,',
  titleAccent: 'rewarded',
  description:
    'Earn points for eligible completed studies, then redeem them through the payout methods currently enabled on the panel.',
  pills: ['Free to join', 'Points for eligible studies', 'Every request reviewed'],
}

export const rewardSteps = [
  {
    title: 'Earn points',
    copy: 'Points are credited to your balance when a study you took part in is marked complete.',
  },
  {
    title: 'Reach the minimum',
    copy: 'Once your available balance reaches the minimum payout, you can submit a redemption request.',
  },
  {
    title: 'Request a payout',
    copy: 'Choose a payout method and the points to redeem. Our team reviews each request before it is paid.',
  },
] as const

export const rewardBenefits = [
  {
    title: 'Reviewed payouts',
    copy: 'Every redemption request is checked by our team before it is processed, which keeps payouts accurate and secure.',
    icon: 'shield',
  },
  {
    title: 'Clear status',
    copy: 'Track every request as pending, approved, rejected, or completed in your redemption history.',
    icon: 'zap',
  },
  {
    title: 'Methods from the panel',
    copy: 'The payout methods shown here come directly from the panel’s current settings, so you only see options you can actually use.',
    icon: 'globe',
  },
] as const

export const rewardsFaqs = [
  {
    q: 'How do I earn points?',
    a: 'Points are credited when a study you participated in is marked complete. Studies that end early (terminated or quota full) are not eligible for points.',
  },
  {
    q: 'What is the minimum redemption?',
    a: 'You can request a payout once your available balance reaches the minimum payout shown on this page.',
  },
  {
    q: 'How long does a payout take?',
    a: 'Each request is reviewed before it is paid, so timing depends on the review. You can follow the status of every request in your redemption history.',
  },
  {
    q: 'Why are some of my points “held”?',
    a: 'Points in a pending redemption request are reserved until the request is reviewed, so they cannot be used for another request at the same time.',
  },
]

export const rewardsCta = {
  titleLead: 'Start earning points with',
  titleAccent: 'Intensity Research',
  description:
    'Join the panel for free, complete studies that match your profile, and redeem your points when you reach the minimum payout.',
  primary: 'Join for free',
  secondary: 'How it works',
}
