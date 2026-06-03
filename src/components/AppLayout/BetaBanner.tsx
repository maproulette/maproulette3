import { DismissibleBanner } from './DismissibleBanner'

export const BetaBanner = () => (
  <DismissibleBanner storageKey="mr-beta-banner-dismissed">
    This is a beta version of MapRoulette and is actively being worked on. Some features may be
    incomplete or unavailable.
  </DismissibleBanner>
)
