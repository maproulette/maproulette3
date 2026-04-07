import { useState } from 'react'

const FALLBACK_AVATAR =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNEOUQ5REUiLz4KPHBhdGggZD0iTTIwIDEwQzIyLjc2MTQgMTAgMjUgMTIuMjM4NiAyNSAxNUMgMjUgMTcuNzYxNCAyMi43NjE0IDIwIDIwIDIwQzE3LjIzODYgMjAgMTUgMTcuNzYxNCAxNSAxNUMgMTUgMTIuMjM4NiAxNy4yMzg2IDEwIDIwIDEwWk0yMCAyMkMyMy4zMTM3IDIyIDI2IDI0LjY4NjMgMjYgMjhWMjlIMTZWMjhDMTYgMjQuNjg2MyAxOC42ODYzIDIyIDIyIDIySDIwWiIgZmlsbD0iIzk5OTk5OSIvPgo8L3N2Zz4K'

export const useAvatarFallback = () => {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  const handleImageError = (avatarUrl: string) => {
    if (!failedImages.has(avatarUrl)) {
      setFailedImages((prev) => new Set(prev).add(avatarUrl))
    }
  }

  const getImageSrc = (avatarUrl?: string) => {
    if (!avatarUrl || failedImages.has(avatarUrl) || avatarUrl.includes('user_no_image')) {
      return FALLBACK_AVATAR
    }
    return avatarUrl
  }

  return { handleImageError, getImageSrc }
}
