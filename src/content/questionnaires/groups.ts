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
      keys: ['department', 'job_title', 'org_level', 'org_tenure'],
    },
    {
      id: 'organization',
      title: 'Your organization',
      description: 'These details describe the organization you work for.',
      keys: ['employee_count', 'annual_revenue', 'org_type', 'workplace'],
    },
    {
      id: 'purchasing',
      title: 'Purchasing',
      description: 'How you take part in purchasing decisions.',
      keys: ['purchase_involvement', 'purchase_role', 'category_spend'],
    },
    {
      id: 'scope',
      title: 'Experience and scope',
      description: 'Your experience and the reach of the organization.',
      keys: ['experience_years', 'direct_reports', 'headquarters', 'geo_scope', 'international_share', 'business_model'],
    },
  ],
  healthcare: [
    {
      id: 'profession',
      title: 'Profession and credentials',
      description: 'Your profession, specialty, and license.',
      keys: ['profession', 'specialty', 'has_subspecialty', 'subspecialty', 'qualification', 'licensed', 'license_number'],
    },
    {
      id: 'practice',
      title: 'Practice',
      description: 'Where you practice and the patients you see.',
      keys: ['years_profession', 'years_specialty', 'care_setting', 'org_type', 'employment_status', 'patients_per_week', 'age_groups'],
    },
    {
      id: 'decisions',
      title: 'Clinical decisions',
      description: 'The treatment and facility decisions you are involved in.',
      keys: ['treatment_involvement', 'prescribing', 'care_decisions', 'hcp_count', 'hospital_beds'],
    },
    {
      id: 'activity',
      title: 'Research and professional level',
      description: 'Teaching, research, and how you spend your working time.',
      keys: ['research', 'teaching', 'affiliation', 'professional_level', 'patient_care_share'],
    },
  ],
  patient: [
    {
      id: 'condition',
      title: 'Condition',
      description: 'The health condition and how it is being managed.',
      keys: ['conditions', 'diagnosed_when', 'severity', 'management'],
    },
    {
      id: 'care',
      title: 'Care and coverage',
      description: 'Who provides care, where, and how treatment decisions are made.',
      keys: [
        'visit_frequency',
        'managing_professional',
        'specialist_type',
        'coverage',
        'care_location',
        'decision_maker',
        'relationship',
      ],
    },
  ],
}
