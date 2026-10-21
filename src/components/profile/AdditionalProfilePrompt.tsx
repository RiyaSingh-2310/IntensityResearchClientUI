import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { IndustryPanelModal } from '@/components/forms/join/IndustryPanelModal'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { paths } from '@/config/paths'
import { additionalProfileKinds, type AdditionalProfileKind } from '@/content/questionnaires'
import { useAuth } from '@/hooks/useAuth'
import { useAdditionalProfileSync, useSessionProfiles } from '@/lib/additionalProfileSession'
import { invalidateIndustryEligibility, useIndustryEligibility } from '@/lib/industryEligibility'
import {
  clearPanelPromptAfterLogin,
  initialPanelSelection,
  panelPromptFor,
  panelPromptLoginToken,
  readPanelSelection,
  savePanelSelection,
  type PanelPrompt,
} from '@/lib/panelSelection'
import { ADDITIONAL_PROFILE_PROMPT_KEY, additionalProfileService } from '@/services/additionalProfile.service'

export function AdditionalProfilePrompt() {
  const { user, ready } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const userId = user?.id ?? null
  const [closedFor, setClosedFor] = useState<number | null>(null)
  const closed = closedFor != null && closedFor === userId
  const { order } = useSessionProfiles()
  const sync = useAdditionalProfileSync()
  const industry = useIndustryEligibility()
  const [saveError, setSaveError] = useState('')
  const loginToken = userId == null ? null : panelPromptLoginToken(userId)
  const [pinnedIndustry, setPinnedIndustry] = useState<{ token: string; label: string } | null>(null)
  if (!loginToken) {
    if (pinnedIndustry != null) setPinnedIndustry(null)
  } else if (industry.status === 'ready' && pinnedIndustry?.token !== loginToken) {
    setPinnedIndustry({ token: loginToken, label: industry.label })
  }

  useEffect(() => {
    if (userId == null) return
    void additionalProfileService.getState().catch(() => undefined)
  }, [userId])

  const created = additionalProfileKinds.filter((kind) => order.includes(kind))
  const savedChoice = userId == null ? null : readPanelSelection(userId)
  const prompt: PanelPrompt | null =
    industry.status === 'ready'
      ? panelPromptFor({
          industryLabel: industry.label,
          eligible: industry.eligible,
          created,
          saved: savedChoice,
        })
      : null

  const industryLabel = industry.status === 'ready' ? industry.label : ''
  const promptStatus = prompt?.status ?? ''
  const pendingKey = prompt?.status === 'retry' ? prompt.pending.join(',') : ''
  const options = prompt?.status === 'choose' || prompt?.status === 'retry' ? prompt.options : []
  const pending = prompt?.status === 'retry' ? prompt.pending : []
  const selectionKey = `${userId ?? ''}:${industryLabel}:${promptStatus}:${pendingKey}`
  const [draft, setDraft] = useState<{ key: string; selected: AdditionalProfileKind | null }>({ key: '', selected: null })
  if (draft.key !== selectionKey) {
    setDraft({
      key: selectionKey,
      selected: initialPanelSelection(options, pending),
    })
  }
  const selected = draft.selected != null && options.includes(draft.selected) ? draft.selected : initialPanelSelection(options, pending)
  const dismissed = userId != null && (closed || sessionStorage.getItem(ADDITIONAL_PROFILE_PROMPT_KEY) === String(userId))
  const onPanelForm = location.pathname === paths.additionalProfile
  const waiting = !ready || userId == null || sync === 'pending' || industry.status === 'idle' || industry.status === 'loading'
  const profileError = sync === 'error'
  const needsAttention = profileError || industry.status === 'error' || (prompt != null && prompt.status !== 'complete')
  const pinnedLabel = pinnedIndustry?.token === loginToken ? pinnedIndustry.label : null
  const industryChangedAfterLogin = pinnedLabel != null && (industry.status !== 'ready' || pinnedLabel !== industry.label)
  const open = Boolean(loginToken) && !industryChangedAfterLogin && !waiting && !dismissed && !onPanelForm && needsAttention

  function close() {
    clearPanelPromptAfterLogin()
    if (userId != null) sessionStorage.setItem(ADDITIONAL_PROFILE_PROMPT_KEY, String(userId))
    setClosedFor(userId)
  }

  function select(kind: AdditionalProfileKind) {
    setDraft({ key: selectionKey, selected: kind })
  }

  function confirm() {
    if (userId == null || industry.status !== 'ready' || !industry.label || selected == null) return
    if (!options.includes(selected)) return
    setSaveError('')
    try {
      savePanelSelection(userId, { industry: industry.label, kinds: [selected] })
    } catch {
      setSaveError('Your panel choice could not be saved in this browser. Please try again.')
      return
    }
    clearPanelPromptAfterLogin()
    if (!created.includes(selected)) navigate(`${paths.additionalProfile}?type=${selected}`)
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
                invalidateIndustryEligibility()
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

  return (
    <IndustryPanelModal
      open={open && sync === 'ready' && options.length > 0}
      options={options}
      selected={selected}
      onSelect={select}
      onContinue={confirm}
      onDismiss={close}
      error={saveError}
    />
  )
}
