import { LegalDocument } from '@/components/legal/LegalDocument'
import { termsConditions } from '@/content/legal'

export function TermsConditionsPage() {
  return <LegalDocument content={termsConditions} layout="article" />
}
