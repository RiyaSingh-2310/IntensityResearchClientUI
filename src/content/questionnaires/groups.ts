type PanelKind = 'b2b' | 'healthcare' | 'patient'

export interface QuestionPanel {
  id: string
  title: string
  description: string
  keys: string[]
}

/** Existing questions, grouped for the panel-by-panel additional profile flow. */
export const questionPanels: Record<PanelKind, QuestionPanel[]> = {
  b2b: [
    {
      id: 'role',
      title: 'Your role',
      description: 'Tell us about the work you do and where you sit in the organization.',
      keys: ['b2b-department', 'b2b-title', 'b2b-level', 'b2b-tenure'],
    },
    {
      id: 'organization',
      title: 'Your organization',
      description: 'These details describe the organization you work for.',
      keys: ['b2b-employees', 'b2b-revenue', 'b2b-org-type', 'b2b-workplace'],
    },
    {
      id: 'purchasing',
      title: 'Purchasing',
      description: 'How you take part in purchasing decisions.',
      keys: ['b2b-purchase-involvement', 'b2b-purchase-role', 'b2b-spend'],
    },
    {
      id: 'scope',
      title: 'Experience and scope',
      description: 'Your experience and the reach of the organization.',
      keys: ['b2b-experience', 'b2b-reports', 'b2b-hq', 'b2b-scope', 'b2b-international', 'b2b-model'],
    },
  ],
  healthcare: [
    {
      id: 'profession',
      title: 'Profession and credentials',
      description: 'Your profession, specialty, and license.',
      keys: ['hcp-profession', 'hcp-specialty', 'hcp-has-subspecialty', 'hcp-subspecialty', 'hcp-qualification', 'hcp-licensed', 'hcp-license-number'],
    },
    {
      id: 'practice',
      title: 'Practice',
      description: 'Where you practice and the patients you see.',
      keys: ['hcp-years-profession', 'hcp-years-specialty', 'hcp-setting', 'hcp-org', 'hcp-employment', 'hcp-patients', 'hcp-age-groups'],
    },
    {
      id: 'decisions',
      title: 'Clinical decisions',
      description: 'The treatment and facility decisions you are involved in.',
      keys: ['hcp-treatment-decisions', 'hcp-prescribing', 'hcp-decisions', 'hcp-physicians', 'hcp-beds'],
    },
    {
      id: 'activity',
      title: 'Research and professional level',
      description: 'Teaching, research, and how you spend your working time.',
      keys: ['hcp-research', 'hcp-teach', 'hcp-affiliated', 'hcp-level', 'hcp-patient-care'],
    },
  ],
  patient: [
    {
      id: 'condition',
      title: 'Condition',
      description: 'The health condition and how it is being managed.',
      keys: ['patient-diagnosed', 'patient-diagnosed-when', 'patient-severity', 'patient-managing'],
    },
    {
      id: 'care',
      title: 'Care and coverage',
      description: 'Who provides care, where, and how treatment decisions are made.',
      keys: [
        'patient-visit-frequency',
        'patient-manager',
        'patient-specialist',
        'patient-coverage',
        'patient-location',
        'patient-decision',
        'patient-relationship',
      ],
    },
  ],
}
