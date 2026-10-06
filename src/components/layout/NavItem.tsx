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
          'rounded-full px-3 text-sm text-ink-soft transition-all duration-200',
          mobile ? 'block py-3' : 'py-2 lg:motion-safe:hover:-translate-y-0.5 lg:hover:bg-white lg:hover:text-ink lg:hover:shadow-soft',
          isActive ? 'bg-white font-bold text-ink shadow-soft' : 'font-medium',
        )
      }
    >
      {children}
    </NavLink>
  )
}
