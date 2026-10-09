import type { QuestionnaireQuestion } from './types'

/**
 * About You additions from the "Questions add in current page" sheet.
 * Area and housing options are the values visible in that sheet.
 * Country uses the ISO country names; the sheet lists countries under Q1.
 * State and city are Dropdown/Open-ended. Their option columns were blank in the visible rows,
 * so they accept a typed answer until a fixed list is added here.
 */
export const aboutYouQuestions: QuestionnaireQuestion[] = [
  {
    key: 'about-country',
    label: 'Which country do you currently live or work in?',
    profile: 'about-you',
    fieldType: 'dropdown',
    options: [],
    optionsFrom: 'countries',
    required: true,
    order: 1,
  },
  {
    key: 'about-region',
    label: 'What is your state/province/region?',
    profile: 'about-you',
    fieldType: 'text',
    options: [],
    required: true,
    order: 2,
    placeholder: 'Enter your state, province, or region',
  },
  {
    key: 'about-city',
    label: 'What city do you currently live or work in?',
    profile: 'about-you',
    fieldType: 'text',
    options: [],
    required: true,
    order: 3,
    placeholder: 'Enter your city',
  },
  {
    key: 'about-postal',
    label: 'What is your ZIP/Postal/PIN code?',
    profile: 'about-you',
    fieldType: 'text',
    options: [],
    required: true,
    order: 4,
    placeholder: 'Enter your ZIP, postal, or PIN code',
  },
  {
    key: 'about-area',
    label: 'What type of area do you live in?',
    profile: 'about-you',
    fieldType: 'dropdown',
    options: ['Urban', 'Suburban', 'Rural', 'Other'],
    otherInput: true,
    required: true,
    order: 5,
  },
  {
    key: 'about-housing',
    label: 'Which best describes your current housing situation?',
    profile: 'about-you',
    fieldType: 'dropdown',
    options: ['Own home', 'Rent', 'Live with family', 'Employer-provided accommodation', 'Other'],
    otherInput: true,
    required: true,
    order: 6,
  },
  {
    key: 'about-children',
    label: 'How many children under 18 live in your household?',
    profile: 'about-you',
    fieldType: 'text',
    options: [],
    required: true,
    order: 7,
    placeholder: 'Enter a number',
  },
  {
    key: 'about-industry',
    label: 'Which industry does your organization primarily operate in?',
    profile: 'about-you',
    fieldType: 'text',
    options: [],
    required: true,
    order: 8,
    placeholder: 'Enter your industry',
  },
]
