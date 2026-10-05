import { cn } from '@/lib/utils'

function scorePassword(password: string) {
  let score = 0
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  return score
}

const labels = ['Too short', 'Getting started', 'Fair', 'Strong', 'Excellent']

export function PasswordStrength({ password }: { password: string }) {
  const score = scorePassword(password)
  if (!password) return null

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-1.5">
        {Array.from({ length: 4 }).map((_, index) => (
          <span
            key={index}
            className={cn(
              'h-1.5 rounded-full bg-line',
              score > index && (score <= 2 ? 'bg-warning' : score === 3 ? 'bg-brand-mid' : 'bg-success'),
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted">{labels[score]}</p>
    </div>
  )
}
