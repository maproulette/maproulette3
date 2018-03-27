import Cache from 'stale-lru-cache'

/**
 * The primary purpose of the cache is simply to reduce duplicate requests to
 * the serverf that can naturally occur during a single user action from
 * decoupled components that don't know anything about data other components
 * might already have retrieved. So the maxAge of the cache is set very low.
 */
export const cache = new Cache({
  maxSize: 100,
  maxAge: 10, // seconds
})

export const resetCache = () => {
  cache.reset()
}
