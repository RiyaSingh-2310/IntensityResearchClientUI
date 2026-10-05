import type { ApiError } from '@/types/common'

export class ApiRequestError extends Error {
  status?: number
  code?: string
  fieldErrors?: Record<string, string>

  constructor(error: ApiError, status?: number) {
    super(error.message)
    this.name = 'ApiRequestError'
    this.status = status
    this.code = error.code
    this.fieldErrors = error.fieldErrors
  }
}

export const UNAUTHORIZED_EVENT = 'ir:unauthorized'

export function fieldMessage(error: unknown, key: string) {
  if (error instanceof ApiRequestError) return error.fieldErrors?.[key]
  return undefined
}
