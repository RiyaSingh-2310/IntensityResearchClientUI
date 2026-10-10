import type {
  DropdownOption,
  OnboardingAnswer,
  OnboardingQuestion,
  OnboardingStepGroup,
  RewardRequestRecord,
  RewardTransactionRecord,
} from '@/types/api'
import type { RewardRequestStatus, TransactionType } from '@/types/common'
import type { RewardRequest, RewardTransaction } from '@/types/reward'
import { displayPaymentMethodName, paymentMethodCategory } from './paymentMethods'
import { asNumber } from './utils'

export function flattenQuestions(steps: OnboardingStepGroup[]) {
  return steps.flatMap((step) =>
    [...step.questions]
      .sort((a, b) => asNumber(a.display_order) - asNumber(b.display_order) || asNumber(a.id) - asNumber(b.id))
      .map((question) => ({
        ...question,
        id: asNumber(question.id),
        step_no: asNumber(question.step_no ?? step.step_no),
        is_required: asNumber(question.is_required),
        options: (question.options ?? []).map((option) => ({
          id: asNumber(option.id),
          name: option.name,
        })),
      })),
  )
}

export function questionsForApiStep(steps: OnboardingStepGroup[], stepNo: number) {
  return flattenQuestions(steps).filter((question) => question.step_no === stepNo)
}

export function optionLabelById(options: DropdownOption[], id: string | number) {
  return options.find((option) => String(option.id) === String(id))?.name ?? String(id)
}

export function findYesNoId(question: OnboardingQuestion, yes: boolean) {
  const wanted = yes ? 'yes' : 'no'
  return question.options.find((option) => option.name.trim().toLowerCase() === wanted)?.id
}

export function displayAnswer(answers: OnboardingAnswer[], questionId: number) {
  const matched = answers.filter((answer) => asNumber(answer.question_id) === questionId)
  if (!matched.length) return ''
  return matched.map((answer) => answer.answer_text).filter(Boolean).join(', ')
}

export function unwrapCollection<T>(payload: unknown, keys: string[]): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (!payload || typeof payload !== 'object') return []
  const record = payload as Record<string, unknown>
  for (const key of keys) {
    const value = record[key]
    if (Array.isArray(value)) return value as T[]
  }
  return []
}

export function paymentMethodName(record: RewardRequestRecord) {
  return record.payment_method || record.payment_methord || 'Reward'
}

export function mapRewardRequest(record: RewardRequestRecord): RewardRequest {
  const rawName = paymentMethodName(record)
  const name = displayPaymentMethodName(rawName)
  const status = (record.status || 'pending') as RewardRequestStatus
  return {
    id: String(record.id),
    rewardId: rawName,
    rewardName: name,
    category: paymentMethodCategory(rawName),
    pointsUsed: asNumber(record.reward_points),
    requestedAt: record.created_at,
    status,
    paymentMethod: record.payment_method || record.payment_methord || rawName,
    remark: record.remark,
    comment: record.comment,
    processedAt: record.action_date,
  }
}

export function mapTransaction(record: RewardTransactionRecord): RewardTransaction {
  const points = asNumber(record.reward_points)
  const type: TransactionType =
    record.transaction_type === 'debit'
      ? 'redeemed'
      : record.reward_type === 'registration' || record.reward_type === 'manual'
        ? 'bonus'
        : 'earned'
  const status = (record.status || 'posted') as RewardTransaction['status']
  return {
    id: String(record.id),
    rewardName: record.remark || record.reward_type || 'Points',
    points,
    occurredAt: record.created_at,
    type,
    status,
    category: record.reward_type === 'payout' ? paymentMethodCategory(record.remark ?? '') : undefined,
  }
}
