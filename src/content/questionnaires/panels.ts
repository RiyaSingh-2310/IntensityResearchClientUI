import type { QuestionnaireQuestion } from './types'

/**
 * B2B, Healthcare, and Patient questions in workbook order.
 * The workbook download was blocked, so option lists that were not visible are left empty.
 * Dropdown/open fields accept a typed answer. Do not fill these arrays with guessed values.
 */
function panel(
  profile: QuestionnaireQuestion['profile'],
  items: Array<Pick<QuestionnaireQuestion, 'key' | 'label' | 'fieldType'> & Partial<QuestionnaireQuestion>>,
): QuestionnaireQuestion[] {
  return items.map((item, index) => ({
    options: [],
    required: false,
    order: index + 1,
    profile,
    ...item,
  }))
}

export const b2bQuestions = panel('b2b', [
  { key: 'b2b-department', label: 'Which department or function do you primarily work in?', fieldType: 'text', placeholder: 'Enter your department or function' },
  { key: 'b2b-title', label: 'What is your current job title?', fieldType: 'text', placeholder: 'Enter your job title' },
  { key: 'b2b-level', label: 'Which best describes your level within your organization?', fieldType: 'text', placeholder: 'Enter your level' },
  { key: 'b2b-tenure', label: 'How long have you been working in your current organization?', fieldType: 'text', placeholder: 'Enter your answer' },
  { key: 'b2b-employees', label: 'Approximately how many employees work for your organization worldwide?', fieldType: 'text', placeholder: 'Enter a number' },
  { key: 'b2b-revenue', label: 'What is your organization’s approximate annual revenue?', fieldType: 'text', placeholder: 'Enter your answer' },
  { key: 'b2b-org-type', label: 'What type of organization do you work for?', fieldType: 'text', placeholder: 'Enter your answer' },
  { key: 'b2b-workplace', label: 'Where is your primary workplace?', fieldType: 'text', placeholder: 'Enter your answer' },
  {
    key: 'b2b-purchase-involvement',
    label: 'What level of involvement do you have in purchasing decisions for [PRODUCT/SERVICE]?',
    fieldType: 'text',
    placeholder: 'Enter your answer',
  },
  { key: 'b2b-purchase-role', label: 'What role do you typically play in purchasing decisions?', fieldType: 'text', placeholder: 'Enter your answer' },
  {
    key: 'b2b-spend',
    label: 'Approximately how much does your organization spend annually on [PRODUCT/SERVICE CATEGORY]?',
    fieldType: 'text',
    placeholder: 'Enter your answer',
  },
  { key: 'b2b-experience', label: 'How many years of professional experience do you have?', fieldType: 'text', placeholder: 'Enter a number' },
  { key: 'b2b-reports', label: 'Approximately how many employees report directly or indirectly to you?', fieldType: 'text', placeholder: 'Enter a number' },
  { key: 'b2b-hq', label: 'Where is your organization’s headquarters located?', fieldType: 'text', placeholder: 'Enter a location' },
  { key: 'b2b-scope', label: 'Which best describes the geographic scope of your organization?', fieldType: 'text', placeholder: 'Enter your answer' },
  {
    key: 'b2b-international',
    label: 'Approximately what percentage of your organization’s business is conducted internationally?',
    fieldType: 'text',
    placeholder: 'Enter a percentage',
  },
  { key: 'b2b-model', label: 'Which best describes your organization’s primary business model?', fieldType: 'text', placeholder: 'Enter your answer' },
])

export const healthcareQuestions = panel('healthcare', [
  { key: 'hcp-profession', label: 'Which of the following best describes your current healthcare profession?', fieldType: 'text', placeholder: 'Enter your profession' },
  { key: 'hcp-specialty', label: 'What is your primary medical specialty?', fieldType: 'text', placeholder: 'Enter your specialty' },
  { key: 'hcp-has-subspecialty', label: 'Do you have a subspecialty?', fieldType: 'radio', options: ['Yes', 'No'] },
  {
    key: 'hcp-subspecialty',
    label: 'Please specify your subspecialty.',
    fieldType: 'text',
    placeholder: 'Enter your subspecialty',
    required: true,
    showIf: { key: 'hcp-has-subspecialty', equals: 'Yes' },
  },
  { key: 'hcp-qualification', label: 'What is your highest professional qualification?', fieldType: 'text', placeholder: 'Enter your qualification' },
  { key: 'hcp-licensed', label: 'Are you currently licensed/registered to practice in your country?', fieldType: 'radio', options: ['Yes', 'No'] },
  { key: 'hcp-license-number', label: 'License or Registration number to practice in your country?', fieldType: 'text' },
  { key: 'hcp-years-profession', label: 'How many years have you been practicing in your profession?', fieldType: 'text' },
  { key: 'hcp-years-specialty', label: 'How many years have you been practicing in your current specialty?', fieldType: 'text' },
  { key: 'hcp-setting', label: 'What type of healthcare setting do you primarily work in?', fieldType: 'text', placeholder: 'Enter your answer' },
  { key: 'hcp-org', label: 'What type of organization do you primarily work for?', fieldType: 'text', placeholder: 'Enter your answer' },
  { key: 'hcp-employment', label: 'What is your current employment status?', fieldType: 'text', placeholder: 'Enter your answer' },
  { key: 'hcp-patients', label: 'Approximately how many patients do you personally see/manage in a typical week?', fieldType: 'text', placeholder: 'Enter a number' },
  { key: 'hcp-age-groups', label: 'Which age groups do you primarily treat?', fieldType: 'text', placeholder: 'Enter your answer' },
  { key: 'hcp-treatment-decisions', label: 'What level of involvement do you have in treatment decisions for your patients?', fieldType: 'text', placeholder: 'Enter your answer' },
  { key: 'hcp-prescribing', label: 'Are you involved in prescribing medications?', fieldType: 'radio', options: ['Yes', 'No'] },
  { key: 'hcp-decisions', label: 'Which of the following healthcare decisions are you involved in?', fieldType: 'text', placeholder: 'Enter your answer' },
  { key: 'hcp-physicians', label: 'Approximately how many physicians/HCPs work at your primary practice or facility?', fieldType: 'text', placeholder: 'Enter a number' },
  { key: 'hcp-beds', label: 'Approximately how many beds does your primary hospital have?', fieldType: 'text', placeholder: 'Enter a number' },
  { key: 'hcp-research', label: 'Are you involved in medical research or clinical trials?', fieldType: 'radio', options: ['Yes', 'No'] },
  { key: 'hcp-teach', label: 'Do you teach or train other healthcare professionals?', fieldType: 'radio', options: ['Yes', 'No'] },
  {
    key: 'hcp-affiliated',
    label: 'Are you affiliated with a medical school, university, or teaching hospital?',
    fieldType: 'radio',
    options: ['Yes', 'No'],
  },
  { key: 'hcp-level', label: 'Which best describes your professional level?', fieldType: 'text', placeholder: 'Enter your answer' },
  { key: 'hcp-patient-care', label: 'Approximately what percentage of your working time is spent on direct patient care?', fieldType: 'text', placeholder: 'Enter a percentage' },
])

export const patientQuestions = panel('patient', [
  {
    key: 'patient-diagnosed',
    label: "Have you ever been or someone else's diagnosed with below health condition by a healthcare professional?",
    fieldType: 'text',
    placeholder: 'Enter the health condition',
  },
  { key: 'patient-diagnosed-when', label: "When were you or someone else's first diagnosed?", fieldType: 'text', placeholder: 'Enter your answer' },
  { key: 'patient-severity', label: "How would you describe the severity of your or someone else's condition?", fieldType: 'text', placeholder: 'Enter your answer' },
  { key: 'patient-managing', label: "How are you currently managing your or someone else's condition?", fieldType: 'text', placeholder: 'Enter your answer' },
  {
    key: 'patient-visit-frequency',
    label: "How often do you typically visit a healthcare professional regarding your or someone else's condition?",
    fieldType: 'text',
    placeholder: 'Enter your answer',
  },
  {
    key: 'patient-manager',
    label: "Which type of healthcare professional primarily manages your or someone else's condition?",
    fieldType: 'text',
    placeholder: 'Enter your answer',
  },
  { key: 'patient-specialist', label: "What type of specialist do you or someone else's primarily see?", fieldType: 'text', placeholder: 'Enter your answer' },
  { key: 'patient-coverage', label: "What type of health coverage do you or someone else's currently have?", fieldType: 'text', placeholder: 'Enter your answer' },
  { key: 'patient-location', label: "Where do you or someone else's primarily receive healthcare?", fieldType: 'text', placeholder: 'Enter your answer' },
  { key: 'patient-decision', label: "Who usually makes the final decision about your or someone else's treatment?", fieldType: 'text', placeholder: 'Enter your answer' },
  { key: 'patient-relationship', label: 'What is your relationship to the patient?', fieldType: 'text', placeholder: 'Enter your answer' },
])
