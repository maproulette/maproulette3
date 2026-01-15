import { useQuery } from '@tanstack/react-query'
import { FileText, Github, Globe, Heart, HelpCircle } from 'lucide-react'
import { apiRequest } from '@/api'
import type { paths } from '@/types/openApiTypes'

type ServiceInfo = paths['/service/info']['get']['responses']['200']['content']['application/json']

export const Footer = () => {
  const { data: serviceInfo } = useQuery<ServiceInfo>({
    queryKey: ['serviceInfo'],
    queryFn: () => apiRequest.get('api/v2/service/info').json<ServiceInfo>(),
  })

  const frontendVersion = 'v4.0.0' // TODO: Replace with actual version from build
  const backendVersion = serviceInfo?.compiletime?.version
    ? serviceInfo.compiletime.version === serviceInfo.compiletime.gitHeadCommit
      ? serviceInfo.compiletime.gitHeadCommit.slice(0, 7)
      : serviceInfo.compiletime.version
    : null

  const backendVersionUrl = serviceInfo?.compiletime
    ? serviceInfo.compiletime.version === serviceInfo.compiletime.gitHeadCommit
      ? `https://github.com/maproulette/maproulette-backend/commit/${serviceInfo.compiletime.gitHeadCommit}`
      : `https://github.com/maproulette/maproulette-backend/releases/tag/v${serviceInfo.compiletime.version}`
    : '#'

  return (
    <footer className="w-full bg-white px-3 py-8 text-sm md:px-5 md:py-12 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid gap-8 md:grid-cols-5 md:items-start">
          <div className="md:col-span-1">
            <h3 className="mb-2 font-medium text-sm">SUPPORTED BY</h3>
            <a
              href="https://www.openstreetmap.org"
              target="_blank"
              rel="noopener noreferrer"
              className="link-nav block"
              aria-label="OpenStreetMap"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-black dark:bg-white">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-white dark:text-black"
                  >
                    <title>OpenStreetMap US logo</title>
                    <path
                      d="M10 20a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm2-2.25a8 8 0 0 0 4-2.46V9a2 2 0 0 1-2-2V3.07a7.95 7.95 0 0 0-3-1V3a2 2 0 0 1-2 2v1a2 2 0 0 1-2 2v2h3a2 2 0 0 1 2 2v5.75zm-4 0V15a2 2 0 0 1-2-2v-1h-.5A1.5 1.5 0 0 1 4 10.5V8H2.25A8.01 8.01 0 0 0 8 17.75z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <span className="font-bold">OpenStreetMap US</span>
              </div>
            </a>
          </div>

          <div className="md:col-span-1">
            <h3 className="mb-4 font-medium text-sm">VERSIONS</h3>
            <div className="space-y-2 text-sm">
              <p>MapRoulette {frontendVersion}</p>
              {backendVersion && (
                <p>
                  MaprouletteAPI{' '}
                  <a
                    href={backendVersionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-nav font-mono"
                  >
                    {backendVersion}
                  </a>
                </p>
              )}
            </div>
          </div>

          <div className="md:col-span-1">
            <h3 className="mb-4 font-medium text-sm">INFO</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://learn.maproulette.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-nav flex items-center gap-2"
                >
                  <HelpCircle className="h-4 w-4" />
                  Get Help
                </a>
              </li>
              <li>
                <a
                  href="https://maproulette.org/blog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-nav flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Read the Blog
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/maproulette/maproulette4/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-nav flex items-center gap-2"
                >
                  <Github className="h-4 w-4" />
                  Report a Bug
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-1">
            <h3 className="mb-4 font-medium text-sm">SUPPORT US</h3>
            <a
              href="https://openstreetmap.app.neoncrm.com/forms/maproulette"
              target="_blank"
              rel="noopener noreferrer"
              className="link-nav inline-flex items-center gap-2 text-sm"
            >
              <Heart className="h-4 w-4" />
              Donate to Maproulette
            </a>
          </div>

          <div className="md:col-span-1">
            <h3 className="mb-4 font-medium text-sm">FOLLOW US</h3>
            <a
              href="https://en.osm.town/@MapRoulette"
              target="_blank"
              rel="noopener noreferrer"
              className="link-nav inline-flex items-center gap-2 text-sm"
            >
              <Globe className="h-4 w-4" />
              Mastodon @maproulette
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
