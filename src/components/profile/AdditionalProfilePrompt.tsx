import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { paths } from '@/config/paths'
import { additionalProfileKinds, additionalProfileLabels, type AdditionalProfileKind } from '@/content/questionnaires'
import { useAuth } from '@/hooks/useAuth'
import { useSessionProfiles } from '@/lib/additionalProfileSession'
import { ADDITIONAL_PROFILE_PROMPT_KEY } from '@/services/additionalProfile.service'

export function AdditionalProfilePrompt() {
  const { user, ready } = useAuth()
  const navigate = useNavigate()
  const userId = user?.id ?? null
  const [closed, setClosed] = useState(false)
  const { answers } = useSessionProfiles()
  const missing = additionalProfileKinds.filter((kind) => !answers[kind])

  useEffect(() => {
    setClosed(false)
  }, [userId])

  const dismissed =
    userId != null && (closed || sessionStorage.getItem(ADDITIONAL_PROFILE_PROMPT_KEY) === String(userId))
  const open = ready && userId != null && !dismissed && missing.length > 0

  function close() {
    if (userId != null) sessionStorage.setItem(ADDITIONAL_PROFILE_PROMPT_KEY, String(userId))
    setClosed(true)
  }

  function start(kind: AdditionalProfileKind) {
    close()
    navigate(`${paths.additionalProfile}?type=${kind}`)
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) close() }}>
      <DialogContent
        title="Add another profile"
        description="You can add a B2B, Healthcare Professional, or Patient profile. Profiles you have already completed are not listed."
      >
        <div className="grid gap-3">
          {missing.map((kind) => (
            <Button key={kind} className="w-full" variant={kind === missing[0] ? 'default' : 'outline'} onClick={() => start(kind)}>
              Add {additionalProfileLabels[kind]}
            </Button>
          ))}
          <Button className="mx-auto" variant="ghost" onClick={close}>
            Not Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
