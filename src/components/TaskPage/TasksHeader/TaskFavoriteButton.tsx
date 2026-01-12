import { Star } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'

export const TaskFavoriteButton = () => {
  const [isFavorited, setIsFavorited] = useState(false)

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited)
    toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites')
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggleFavorite}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      className={`h-9 w-9 hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
        isFavorited ? 'text-yellow-500 hover:text-yellow-600 dark:text-yellow-400' : ''
      }`}
    >
      <Star className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
    </Button>
  )
}
