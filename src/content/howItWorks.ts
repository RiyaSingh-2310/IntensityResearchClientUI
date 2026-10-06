import { brand } from '@/config/brand'

export const howItWorksHero = {
  eyebrow: 'Simple Process',
  titleLead: 'How It',
  titleAccent: 'Works',
  description: `Getting started with ${brand.name} is simple. Follow these four easy steps to start earning rewards for your opinions.`,
}

export const howItWorksSteps = [
  {
    n: '01',
    title: 'Sign Up',
    copy: 'Create your free panel account. Registration has a few short steps and a review screen before you submit.',
    bullets: ['Account details', 'Review before submitting', 'Email verification'],
    icon: 'userPlus',
  },
  {
    n: '02',
    title: 'Complete Your Profile',
    copy: 'Answer profile questions about yourself, your lifestyle, and your preferences so we can match you with relevant studies.',
    bullets: ['Demographics', 'Lifestyle', 'Preferences and consent'],
    icon: 'clipboard',
  },
  {
    n: '03',
    title: 'Participate in Research',
    copy: 'When a study is a match, it appears on your Surveys page. Open it with Continue Survey and complete it in a new tab.',
    bullets: ['Listed in your dashboard', 'Filter by status', 'Opens in a new tab'],
    icon: 'search',
  },
  {
    n: '04',
    title: 'Earn Rewards',
    copy: 'Points for approved surveys are added to your balance. Request a payout once you reach the minimum.',
    bullets: ['Points credited after approval', 'Choose a payout method', 'Track requests in History'],
    icon: 'gift',
  },
] as const

export const surveyStatusGuide = {
  eyebrow: 'Survey Statuses',
  title: 'What Each Status Means',
  description: 'Every survey on your Surveys page shows one of these statuses.',
  items: [
    { status: 'active', copy: 'The survey is open for you. Use Continue Survey to take part.' },
    { status: 'complete', copy: 'You finished the survey. Points show as pending until they are approved.' },
    { status: 'terminate', copy: 'The survey ended early because you did not match the study criteria.' },
    { status: 'quota_full', copy: 'The study collected enough responses before you could finish.' },
  ],
} as const

export const whyChooseHowItWorks = {
  title: `Why Choose ${brand.name}?`,
  description: 'A straightforward panel experience that respects your time and your data.',
  items: [
    {
      title: 'Flexible Schedule',
      copy: 'Take assigned surveys whenever it suits you, on desktop or mobile.',
      icon: 'clock',
    },
    {
      title: 'Data Security',
      copy: 'Your profile is used to match you with studies and is never sold as a mailing list.',
      icon: 'shield',
    },
    {
      title: 'Clear Tracking',
      copy: 'See every survey, point, and payout request in your member dashboard.',
      icon: 'sparkles',
    },
  ],
} as const

export const howItWorksFaqs = [
  {
    q: 'How much can I earn?',
    a: 'Points depend on the surveys assigned to you. Each survey shows its point value, and points are credited once a completed survey is approved.',
  },
  {
    q: 'When do I get paid?',
    a: 'Once your balance reaches the minimum payout, submit a request from Redeem. Each request is reviewed, and you can follow its status in History.',
  },
  {
    q: 'Is it really free?',
    a: `Yes. There is no signup fee and no membership charge. ${brand.name} never charges panelists to take part.`,
  },
  {
    q: 'What kinds of surveys will I see?',
    a: 'Product and service feedback, brand and advertising research, shopping and lifestyle studies, and concept testing are common. Invitations are matched to your profile.',
  },
]

export const howItWorksCta = {
  title: 'Ready to Start Earning?',
  description: `Join ${brand.name}, complete your profile, and start receiving assigned surveys. It’s free to join.`,
  primary: 'Join Now — It’s Free',
  secondary: 'Learn More',
}
