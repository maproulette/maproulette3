import { useSyncExternalStore } from 'react'

const getSnapshot = () => typeof navigator !== 'undefined' && typeof navigator.share === 'function'

const subscribe = () => () => {}

export const useShareSupport = () => useSyncExternalStore(subscribe, getSnapshot, () => false)
