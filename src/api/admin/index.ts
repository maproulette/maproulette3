import { adminRebuild } from './rebuild'
import { adminSnapshots } from './snapshots'

export const admin = {
  ...adminSnapshots,
  ...adminRebuild,
}
