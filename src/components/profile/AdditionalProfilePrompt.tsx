import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { IndustryPanelModal } from '@/components/forms/join/IndustryPanelModal'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { paths } from '@/config/paths'
import { additionalProfileKinds, type AdditionalProfileKind } from '@/content/questionnaires'
import { PROFILE_SECTION_IDS } from '@/content/profileQuestions'
import { useAuth } from '@/hooks/useAuth'
import { useAdditionalProfileSync, useSessionProfiles } from '@/lib/additionalProfileSession'
import { industryAnswerLabel, panelsForIndustryLabel } from '@/lib/industryPanels'
import { panelPromptFor, readPanelSelection, savePanelSelection, type PanelPrompt } from '@/lib/panelSelection'
import { answersToFormValues, buildProfileSections } from '@/lib/profileQuestions'
import { ADDITIONAL_PROFILE_PROMPT_KEY, additionalProfileService } from '@/services/additionalProfile.service'
import { onboardingService } from '@/services/onboarding.service'

type IndustryState =
  | { status: 'idle' }
  | { status: 'error' }
  | { status: 'ready'; label: string }

export function AdditionalProfilePrompt() {
  const { user, ready } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const userId = user?.id ?? null
  const [closedFor, setClosedFor] = useState<number | null>(null)
  const closed = closedFor != null && closedFor === userId
  const { order } = useSessionProfiles()
  const sync = useAdditionalProfileSync()
  const [industryRecord, setIndustryRecord] = useState<{ userId: number | null; state: IndustryState }>({
    userId: null,
    state: { status: 'idle' },
  })
  const industry = industryRecord.userId === userId ? industryRecord.state : { status: 'idle' as const }
  const [reloadKey, setReloadKey] = useState(0)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    if (userId == null) return
    void additionalProfileService.getState().catch(() => undefined)
  }, [userId])

  useEffect(() => {
    if (userId == null) return
    let cancelled = false
    Promise.all([onboardingService.getQuestions(), onboardingService.getAnswers()])
      .then(([questions, saved]) => {
        if (cancelled) return
        const sections = buildProfileSections(questions.steps)
        const profileQuestions = PROFILE_SECTION_IDS.flatMap((id) => sections[id])
        const label = industryAnswerLabel(sections, answersToFormValues(saved.answers, profileQuestions))
        setIndustryRecord({ userId, state: { status: 'ready', label } })
      })
      .catch(() => {
        if (!cancelled) setIndustryRecord({ userId, state: { status: 'error' } })
      })
    return () => {
      cancelled = true
    }
  }, [userId, reloadKey])

  const created = additionalProfileKinds.filter((kind) => order.includes(kind))
  const savedChoice = userId == null ? null : readPanelSelection(userId)
  const prompt: PanelPrompt | null =
    industry.status === 'ready'
      ? panelPromptFor({
          industryLabel: industry.label,
          eligible: panelsForIndustryLabel(industry.label),
          created,
          saved: savedChoice,
        })
      : null

  const industryLabel = industry.status === 'ready' ? industry.label : ''
  const promptStatus = prompt?.status ?? ''
  const pendingKey = prompt?.status === 'retry' ? prompt.pending.join(',') : ''
  const selectionKey = `${userId ?? ''}:${industryLabel}:${promptStatus}:${pendingKey}`
  const [draft, setDraft] = useState<{ key: string; selected: AdditionalProfileKind[] }>({ key: '', selected: [] })
  if (draft.key !== selectionKey) {
    setDraft({
      key: selectionKey,
      selected: promptStatus === 'retry' && pendingKey ? (pendingKey.split(',') as AdditionalProfileKind[]) : [],
    })
  }
  const selected = draft.selected
  const dismissed = userId != null && (closed || sessionStorage.getItem(ADDITIONAL_PROFILE_PROMPT_KEY) === String(userId))
  const onPanelForm = location.pathname === paths.additionalProfile
  const waiting = !ready || userId == null || sync === 'pending' || industry.status === 'idle'
  const profileError = sync === 'error'
  const needsAttention = profileError || industry.status === 'error' || (prompt != null && prompt.status !== 'complete')
  const open = !waiting && !dismissed && !onPanelForm && needsAttention

  function close() {
    if (userId != null) sessionStorage.setItem(ADDITIONAL_PROFILE_PROMPT_KEY, String(userId))
    setClosedFor(userId)
  }

  function toggle(kind: AdditionalProfileKind) {
    setDraft((current) => ({
      key: selectionKey,
      selected: current.selected.includes(kind) ? current.selected.filter((item) => item !== kind) : [...current.selected, kind],
    }))
  }

  function confirm() {
    if (userId == null || industry.status !== 'ready' || !industry.label) return
    setSaveError('')
    try {
      savePanelSelection(userId, { industry: industry.label, kinds: selected })
    } catch {
      setSaveError('Your panel choice could not be saved in this browser. Please try again.')
      return
    }
    const next = selected.find((kind) => !created.includes(kind))
    if (next) navigate(`${paths.additionalProfile}?type=${next}`)
  }

  if ((industry.status === 'error' || profileError) && open) {
    return (
      <Dialog open onOpenChange={(next) => { if (!next) close() }}>
        <DialogContent title="Panel selection is unavailable" description="Your industry could not be loaded, so panel options are hidden.">
          <p className="text-sm text-ink-soft">Check your connection, then try again. You can also add your industry from your profile.</p>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={close}>Not now</Button>
            <Button
              onClick={() => {
                setIndustryRecord({ userId, state: { status: 'idle' } })
                setReloadKey((key) => key + 1)
                void additionalProfileService.getState().catch(() => undefined)
              }}
            >
              Try again
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (prompt?.status === 'missing-industry' && open) {
    return (
      <Dialog open onOpenChange={(next) => { if (!next) close() }}>
        <DialogContent
          title="Industry needed"
          description="Panel options stay hidden until your organization industry is saved on your profile."
        >
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={close}>Not now</Button>
            <Button onClick={() => { close(); navigate(paths.profile) }}>Go to profile</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const options = prompt?.status === 'choose' || prompt?.status === 'retry' ? prompt.options : []

  return (
    <IndustryPanelModal
      open={open && sync === 'ready' && options.length > 0}
      options={options}
      selected={selected}
      onToggle={toggle}
      onContinue={confirm}
      onDismiss={close}
      error={saveError}
    />
  )
}
