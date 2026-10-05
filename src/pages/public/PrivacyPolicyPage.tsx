import { LegalDocument } from '@/components/legal/LegalDocument'
import { privacyPolicy, privacyTopics } from '@/content/legal'

export function PrivacyPolicyPage() {
  return <LegalDocument content={privacyPolicy} layout="accordion" topics={privacyTopics} />
}
