import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

interface BackLinkProps {
  to: string
  params?: Record<string, string>
  search?: Record<string, unknown>
  children: React.ReactNode
}

export const BackLink = ({ to, params, search, children }: BackLinkProps) => {
  return (
    <Link
      to={to}
      params={params}
      search={search}
      className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
    >
      <ArrowLeft className="h-4 w-4" />
      {children}
    </Link>
  )
}
