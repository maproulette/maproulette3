import { Link } from '@tanstack/react-router'
import { ExternalLink } from 'lucide-react'
import { useNavigation } from '@/contexts/NavigationContext'

export const DesktopNav = () => {
  const { allNavigationItems } = useNavigation()

  return (
    <nav aria-label="Primary" className="hidden text-sm lg:flex lg:gap-6">
      {allNavigationItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          target={item.openInNewTab ? '_blank' : ''}
          className="link-nav flex items-center gap-1.5"
        >
          {item.icon && <span className="inline-flex">{item.icon}</span>}
          {item.label}
          {item.openInNewTab && (
            <ExternalLink
              className="size-3.5 text-current"
              aria-label={`Open ${item.label} in a new tab`}
            />
          )}
        </Link>
      ))}
    </nav>
  )
}
