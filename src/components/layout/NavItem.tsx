import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function NavItem({
  to,
  end,
  children,
  onClick,
  mobile = false,
}: {
  to: string
  end?: boolean
  children: string
  onClick?: () => void
  mobile?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'relative rounded-lg px-3 text-sm text-ink-soft transition-colors duration-200',
          mobile ? 'block py-3 hover:bg-surface hover:text-ink' : 'py-2 hover:bg-surface hover:text-ink',
          isActive
            ? cn(
                'bg-raised font-semibold text-strong',
                mobile
                  ? 'border-l-2 border-signal pl-[10px]'
                  : 'after:absolute after:inset-x-3 after:-bottom-[1px] after:h-0.5 after:rounded-full after:bg-signal',
              )
            : 'font-medium',
        )
      }
    >
      {children}
    </NavLink>
  )
}
