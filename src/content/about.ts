import { brand } from '@/config/brand'

export const aboutHero = {
  eyebrow: `About ${brand.name}`,
  titleLead: 'Real opinions,',
  titleAccent: 'meaningful research',
  description: `${brand.name} connects people who want to share their perspective with research studies that help shape products, services, and decisions.`,
}

export const aboutMission = {
  title: 'Our mission',
  paragraphs: [
    `At ${brand.name}, we believe every opinion has value. We invite panelists to take part in research studies that are matched to their profile, and we reward eligible participation with points.`,
    'We focus on high-quality research and a smooth, transparent experience for participants — from clear survey statuses to trackable payout requests.',
  ],
  highlights: ['Free to join', 'Studies matched to your profile', 'Points tracked in your dashboard'],
}

export const aboutPillars = [
  {
    title: 'Matched research',
    copy: 'Profile answers help us invite you to studies that are relevant to you.',
    icon: 'target',
  },
  {
    title: 'Transparent rewards',
    copy: 'Every point and payout request is visible in your history.',
    icon: 'badge',
  },
  {
    title: 'Member dashboard',
    copy: 'Assigned surveys, balance, and payouts in one secure place.',
    icon: 'layout',
  },
  {
    title: 'Responsive support',
    copy: 'Questions go straight to the panel team by email.',
    icon: 'mail',
  },
] as const

export const aboutValues = [
  {
    title: 'Trust & security',
    copy: 'We handle your personal information with care and use it only for research matching.',
    icon: 'shield',
  },
  {
    title: 'Respect for your time',
    copy: 'Take part when it suits you. Participation is always voluntary.',
    icon: 'heart',
  },
  {
    title: 'Fair rewards',
    copy: 'Eligible completed surveys earn points you can redeem for payouts.',
    icon: 'target',
  },
  {
    title: 'Quality insight',
    copy: 'Thoughtful, honest answers help organisations make better decisions.',
    icon: 'globe',
  },
] as const

export const aboutCta = {
  title: 'Get in touch',
  description: 'Have questions about the panel or how we operate? We’d love to hear from you.',
  primary: 'Contact us',
  secondary: 'Join the panel',
}
