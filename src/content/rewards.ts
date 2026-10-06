import type { RewardCategory } from '@/types/common'

export const categoryLabels: Record<RewardCategory, string> = {
  cash: 'Instant Cash',
  'gift-card': 'Gift Cards',
  digital: 'Prepaid & Digital',
  charity: 'Charity',
}

export const rewardsHero = {
  eyebrow: 'Rewards Catalog',
  titleLead: 'Redeem Your Points for',
  titleAccent: 'Rewards You Choose',
  description:
    'Turn your survey points into cash, gift cards, and digital payouts through the options currently enabled on the Intensity Research panel.',
  pills: ['Secure & Verified', 'Every Request Reviewed', 'Free to Join'],
}

export const rewardShowcase = [
  {
    id: 'cash',
    title: 'Instant Cash',
    description: 'PayPal payouts, available in most countries Tremendous serves.',
    category: 'cash' as const,
    ids: ['paypal'],
    comingSoonSlots: 0,
  },
  {
    id: 'gift-cards',
    title: 'Gift Cards',
    description: 'Prepaid Visa and popular gift cards from the Tremendous catalog that work in your country.',
    category: 'gift-card' as const,
    ids: ['virtual-visa', 'amazon'],
    comingSoonSlots: 0,
  },
  {
    id: 'charity',
    title: 'Charity',
    description: 'Donate to meaningful causes.',
    category: 'charity' as const,
    ids: [],
    comingSoonSlots: 0,
  },
] as const

export const popularRewardIds = ['paypal', 'virtual-visa'] as const

export const rewardBenefits = [
  {
    title: 'Clear Status',
    copy: 'Track every request as pending, approved, rejected, or completed in your reward history.',
    icon: 'zap',
  },
  {
    title: 'Secure Payouts',
    copy: 'Every redemption request is checked by our team before it is processed, which keeps payouts accurate and secure.',
    icon: 'shield',
  },
  {
    title: 'Rewards for Your Country',
    copy: 'Options come from the Tremendous catalog and the panel’s payout settings, so you only see rewards that can be delivered where you live.',
    icon: 'globe',
  },
] as const

export const rewardsFaqs = [
  {
    q: 'How do I earn points?',
    a: 'Points are credited when a study you participated in is marked complete. Studies that end early (terminated or quota full) are not eligible for points.',
  },
  {
    q: 'How long do payouts take?',
    a: 'Each request is reviewed before it is paid, so timing depends on the review. You can follow the status of every request in your reward history.',
  },
  {
    q: 'What’s the minimum redemption amount?',
    a: 'You can request a payout once your available balance reaches the minimum payout shown on this page.',
  },
  {
    q: 'Why don’t I see every reward?',
    a: 'Many gift cards only work in one country. We only list rewards Tremendous can deliver to the country you select, so a reward you see is one you can actually use.',
  },
  {
    q: 'Why are some of my points “held”?',
    a: 'Points in a pending redemption request are reserved until the request is reviewed, so they cannot be used for another request at the same time.',
  },
]

export const rewardsCta = {
  titleLead: 'Start Earning Points and',
  titleAccent: 'Unlock These Rewards',
  description:
    'Join the Intensity Research panel for free, complete studies that match your profile, and redeem your points when you reach the minimum payout.',
  primary: 'Join for Free',
  secondary: 'Learn More',
}
