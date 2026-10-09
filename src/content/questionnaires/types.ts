export type QuestionnaireProfile = 'about-you' | 'b2b' | 'healthcare' | 'patient'

/** Field types taken from the registration workbook. `dropdown-open` is the sheet's "Dropdown/Open-ended" type. */
export type QuestionnaireFieldType = 'text' | 'textarea' | 'dropdown' | 'dropdown-open' | 'radio'

export interface QuestionShowIf {
  key: string
  equals: string
}

export interface QuestionnaireQuestion {
  key: string
  label: string
  profile: QuestionnaireProfile
  fieldType: QuestionnaireFieldType
  /** Predefined choices. Empty means the workbook column had no readable option list. */
  options: string[]
  required: boolean
  order: number
  /** When the selected option is Other, show a text input and store that text. */
  otherInput?: boolean
  showIf?: QuestionShowIf
  /** Use the app country list. The workbook's country column is a country dropdown. */
  optionsFrom?: 'countries'
  placeholder?: string
}

export type QuestionnaireAnswers = Record<string, string>
