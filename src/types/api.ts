export interface ApiEnvelope<T = unknown> {
  success: boolean
  message?: string
  data?: T
  errors?: Record<string, unknown>
}

export interface Panelist {
  id: number
  name: string
  email: string
  phone: string | null
  photo: string | null
  is_verified: number
  balance_point: number
  status: string
  onboarding_step: number
  onboarding_completed_at: string | null
  created_at: string
  updated_at: string | null
}

export interface AuthSuccessData {
  token?: string
  user?: Panelist
  activation_token?: string
  reset_token?: string
  email_sent?: boolean
  email_error?: string
}

export interface DropdownOption {
  id: number
  name: string
}

export interface OnboardingQuestion {
  id: number
  step_no: number
  question_text: string
  field_type: string
  dropdown_category: string | null
  is_required: number
  options: DropdownOption[]
}

export interface OnboardingStepGroup {
  step_no: number
  step_name: string
  questions: OnboardingQuestion[]
}

export interface QuestionsResponse {
  steps: OnboardingStepGroup[]
}

export interface OnboardingAnswer {
  id: string
  question_id: string
  question_text: string
  step_no: string
  field_type: string
  answer_text: string
  answer_ref_id: string
  created_at: string
}

export interface AnswersResponse {
  user: Panelist
  answers: OnboardingAnswer[]
}

export interface OnboardingAnswerInput {
  question_id: number
  answer_text?: string
  answer_ref_id?: number
  answer_ref_ids?: number[]
}

export interface PaymentMethod {
  id: number
  name: string
}

export interface PublicSettings {
  registration_reward_points: number
  minimum_payout: number
  amazon_enabled: number
  flipkart_enabled: number
  paypal_enabled: number
  payment_methods: PaymentMethod[]
}

export interface RewardBalance {
  balance_point: number
  minimum_payout: number
  payment_methods: PaymentMethod[]
}

export interface RewardTransactionRecord {
  id: string
  reward_points: string | number
  transaction_type: string
  reward_type: string
  reference_id: string | null
  status: string
  remark: string | null
  comment: string | null
  created_at: string
}

export type SurveyAssignmentStatus = 'active' | 'complete' | 'terminate' | 'quota_full'

export interface SurveyAssignment {
  id: number
  panelist_id: number
  survey_name: string | null
  survey_url: string | null
  reward_points: number
  status: SurveyAssignmentStatus
  completed_at: string | null
  remark: string | null
  created_by: number | null
  updated_by: number | null
  created_at: string
  updated_at: string | null
}

export interface RewardRequestRecord {
  id: string
  reward_points: string | number
  status: string
  payment_methord?: string
  payment_method?: string
  remark: string | null
  comment: string | null
  action_by: string | null
  action_date: string | null
  created_at: string
}
