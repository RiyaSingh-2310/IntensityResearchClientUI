import { brand } from '@/config/brand'

export const aboutHero = {
  eyebrow: `About ${brand.name}`,
  titleLead: 'Real Opinions,',
  titleAccent: 'Meaningful Research',
  description: `${brand.name} connects people who want to share their perspective with research studies that help shape products, services, and decisions.`,
}

export const aboutMission = {
  title: 'Our Mission',
  paragraphs: [
    `At ${brand.name}, we believe every opinion has value. We invite panelists to take part in research studies that are matched to their profile, and we reward eligible participation with points.`,
    'We focus on high-quality research and a smooth, transparent experience for participants — from clear survey statuses to trackable payout requests.',
  ],
  highlights: ['Free to join', 'Studies matched to your profile', 'Points tracked in your dashboard'],
}

export const aboutStats = [
  { value: 'Free', label: 'To Join', icon: 'users' },
  { value: '100%', label: 'Voluntary Participation', icon: 'globe' },
  { value: '4 Steps', label: 'From Sign-up to Payout', icon: 'badge' },
  { value: '1 Dashboard', label: 'Surveys, Points & Payouts', icon: 'building' },
] as const

export const aboutValues = [
  {
    title: 'Trust & Security',
    copy: 'We handle your personal information with care and use it only for research matching.',
    icon: 'shield',
  },
  {
    title: 'Respect for Your Time',
    copy: 'Take part when it suits you. Participation is always voluntary.',
    icon: 'heart',
  },
  {
    title: 'Fair Rewards',
    copy: 'Eligible completed surveys earn points you can redeem for payouts.',
    icon: 'target',
  },
  {
    title: 'Quality Insight',
    copy: 'Thoughtful, honest answers help organisations make better decisions.',
    icon: 'globe',
  },
] as const

export const aboutCta = {
  title: 'Get in Touch',
  description: 'Have questions about the panel or how we operate? We’d love to hear from you.',
  primary: 'Contact Us',
  secondary: 'Join Our Community',
}
