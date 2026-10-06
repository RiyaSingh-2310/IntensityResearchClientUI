import { brand } from '@/config/brand'

export const contactHero = {
  eyebrow: 'Contact Support',
  titleLead: 'Get in Touch',
  titleAccent: 'We’re Here to Help',
  description: 'Questions about your account, a survey, or a payout request? Send us a message and the panel team will follow up by email.',
}

export const contactMethods = [
  {
    id: 'email',
    title: 'Email Support',
    copy: 'Write to the panel team directly',
    detail: brand.email,
    cta: 'Send Email',
    href: `mailto:${brand.email}`,
    icon: 'mail',
  },
  {
    id: 'help',
    title: 'Help Center',
    copy: 'Browse guides, FAQs, and answers',
    detail: 'Account, surveys, and rewards',
    cta: 'Browse Help',
    href: '/help',
    icon: 'help',
  },
  {
    id: 'website',
    title: 'Website',
    copy: `Learn more about ${brand.name}`,
    detail: brand.websiteLabel,
    cta: 'Visit Website',
    href: brand.website,
    icon: 'globe',
  },
] as const

export const quickHelpTopics = [
  {
    title: 'Account Issues',
    copy: 'Signing in, email verification, password reset, and profile updates',
    icon: 'user',
  },
  {
    title: 'Points & Rewards',
    copy: 'Missing points, payout requests, and redemption status',
    icon: 'gift',
  },
  {
    title: 'Surveys',
    copy: 'Survey links, assigned studies, and survey status',
    icon: 'monitor',
  },
] as const

export const contactTips = [
  'Use the email address registered to your account',
  'Describe the issue and what you expected to happen',
  'Include the survey name or payout request date if relevant',
] as const

export const contactFaqs = [
  {
    q: 'How will I hear back?',
    a: 'We reply by email to the address you enter in the form, so please double-check it before sending.',
  },
  {
    q: 'My points are missing. What should I do?',
    a: 'Points are credited after a completed survey is approved. Check the points status on your Surveys page first, then contact us with the survey name if something looks wrong.',
  },
  {
    q: 'What information should I include?',
    a: 'Include your registered email address, a clear description of the issue, and any relevant survey names or dates.',
  },
  {
    q: 'I can’t sign in to my account.',
    a: 'Use “Forgot Password” on the login page to reset your password. If you never received a verification email, you can request a new one from the login page.',
  },
]

export const helpContactIntro = {
  title: 'Contact Our Support Team',
  description: 'Choose your preferred way to get in touch with us. We’re here to help!',
  emailCopy: 'Send us a detailed message.',
  emailMeta: brand.email,
  websiteCopy: `Learn more about ${brand.name}.`,
  websiteMeta: brand.websiteLabel,
}
