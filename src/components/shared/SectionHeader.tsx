import { Link, useMatches, useRouterState } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { useBreadcrumbs } from '@/contexts/BreadcrumbContext'
import { useHeaderActions } from '@/contexts/HeaderActionsContext'
import { usePageTitle } from '@/contexts/PageTitleContext'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  /** Tailwind accent border class, e.g. "border-l-emerald-500" */
  accentClass: string
  /** The URL prefix to strip, e.g. "/manage" or "/super-admin" */
  basePath: string
  /** Human-readable label for the root breadcrumb, e.g. "create & manage" */
  breadcrumbRoot: string
}

/** Maps singular entity path segments to their plural list page paths */
const ENTITY_LIST_ROUTES: Record<string, { label: string; path: string }> = {
  project: { label: 'projects', path: '/manage/projects' },
  challenge: { label: 'challenges', path: '/manage/challenges' },
  task: { label: 'tasks', path: '/manage/tasks' },
}

function buildBreadcrumbSegments(pathname: string, basePath: string, breadcrumbRoot: string) {
  const rest = pathname
    .replace(new RegExp(`^${basePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\/?`), '')
    .replace(/\/$/, '')

  if (!rest) return []

  const parts = rest.split('/')
  const segments: { label: string; href: string }[] = [{ label: breadcrumbRoot, href: basePath }]

  let currentPath = basePath
  for (const part of parts) {
    currentPath += `/${part}`
    const entityRoute = ENTITY_LIST_ROUTES[part]
    if (entityRoute) {
      segments.push({ label: entityRoute.label, href: entityRoute.path })
    } else {
      const label = part === 'new' ? 'create' : part
      segments.push({ label, href: currentPath })
    }
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

export const SectionHeader = ({ accentClass, basePath, breadcrumbRoot }: SectionHeaderProps) => {
  const dynamicTitle = usePageTitle()
  const headerActions = useHeaderActions()
  const breadcrumbOverride = useBreadcrumbs()
  const matches = useMatches()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const staticTitle = [...matches].reverse().find((match) => match.staticData?.pageTitle)
    ?.staticData?.pageTitle

  const fallbackTitle = breadcrumbRoot
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
  const title = buildTitle(pathname, basePath, staticTitle, dynamicTitle, fallbackTitle)
  const segments = breadcrumbOverride ?? buildBreadcrumbSegments(pathname, basePath, breadcrumbRoot)

  return (
    <div
      className={cn(
        'flex h-12 items-center gap-4 border-zinc-700/50 border-b border-l-4 bg-zinc-900 px-4 md:px-5',
        accentClass
      )}
    >
      <h1 className="font-semibold text-sm text-zinc-100">{title}</h1>
      {segments.length > 0 && (
        <nav className="flex items-center gap-1 text-xs text-zinc-500">
          {segments.map((seg, i) => (
            <span key={seg.href} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3 w-3" />}
              {i < segments.length - 1 ? (
                <Link to={seg.href} className="hover:text-zinc-300">
                  {seg.label}
                </Link>
              ) : (
                <span className="text-zinc-400">{seg.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      {headerActions && <div className="ml-auto flex items-center gap-2">{headerActions}</div>}
    </div>
  )
}
