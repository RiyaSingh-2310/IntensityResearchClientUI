export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

export interface ApiError {
  message: string
  code?: string
  fieldErrors?: Record<string, string>
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
}

export type RewardCategory = 'cash' | 'gift-card' | 'digital' | 'charity'

export type RewardAvailability = 'available' | 'coming-soon' | 'unavailable'

export type RewardRequestStatus = 'pending' | 'approved' | 'rejected' | 'completed'

export type TransactionType = 'earned' | 'redeemed' | 'bonus' | 'adjustment'
