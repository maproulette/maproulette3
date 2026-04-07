import { Link, useMatches, useRouterState } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { usePageTitle } from '@/contexts/PageTitleContext'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  /** Tailwind background class, e.g. "bg-emerald-600" */
  colorClass: string
  /** The URL prefix to strip, e.g. "/manage" or "/super-admin" */
  basePath: string
  /** Human-readable label for the root breadcrumb, e.g. "create & manage" */
  breadcrumbRoot: string
}

function buildBreadcrumbSegments(pathname: string, basePath: string, breadcrumbRoot: string) {
  const rest = pathname
    .replace(new RegExp(`^${basePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\/?`), '')
    .replace(/\/$/, '')

  if (!rest) return [{ label: breadcrumbRoot, href: basePath }]

  const parts = rest.split('/')
  const segments: { label: string; href: string }[] = [{ label: breadcrumbRoot, href: basePath }]

  let currentPath = basePath
  for (const part of parts) {
    const label = part === 'new' ? 'create' : part
    currentPath += `/${part}`
    segments.push({ label, href: currentPath })
  }

  return segments
}

function buildTitle(
  pathname: string,
  basePath: string,
  staticTitle: string | undefined,
  dynamicTitle: string | null,
  fallbackTitle: string
): string {
  if (dynamicTitle) return dynamicTitle
  if (staticTitle) {
    const paramMatch = pathname.match(/\/(project|challenge|task)\/(\d+)/)
    if (paramMatch) {
      return `${staticTitle} ${paramMatch[2]}`
    }
    return staticTitle
  }

  const rest = pathname
    .replace(new RegExp(`^${basePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\/?`), '')
    .replace(/\/$/, '')
  if (!rest) return fallbackTitle

  const parts = rest.split('/')
  return parts
    .map((p) => (p === 'new' ? 'Create' : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(' ')
}

export const SectionHeader = ({ colorClass, basePath, breadcrumbRoot }: SectionHeaderProps) => {
  const dynamicTitle = usePageTitle()
  const matches = useMatches()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const staticTitle = [...matches].reverse().find((match) => match.staticData?.pageTitle)
    ?.staticData?.pageTitle

  const fallbackTitle = breadcrumbRoot.charAt(0).toUpperCase() + breadcrumbRoot.slice(1)
  const title = buildTitle(pathname, basePath, staticTitle, dynamicTitle, fallbackTitle)
  const segments = buildBreadcrumbSegments(pathname, basePath, breadcrumbRoot)

  return (
    <div className={cn('flex items-center gap-4 px-4 py-3 md:px-5', colorClass)}>
      <h1 className="font-semibold text-lg text-white">{title}</h1>
      <nav className="flex items-center gap-1 text-sm text-white/70">
        {segments.map((seg, i) => (
          <span key={seg.href} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3" />}
            {i < segments.length - 1 ? (
              <Link to={seg.href} className="hover:text-white">
                {seg.label}
              </Link>
            ) : (
              <span className="text-white/90">{seg.label}</span>
            )}
          </span>
        ))}
      </nav>
    </div>
  )
}
