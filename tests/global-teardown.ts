import { stopBackend } from './utils/backend.js'
import { stopDatabase } from './utils/database.js'

export default async function globalTeardown() {
  stopBackend()
  stopDatabase()
}
