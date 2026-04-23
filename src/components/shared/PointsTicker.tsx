import { Link } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import { useAuthContext } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { DigitDisplay, type DigitDisplaySize } from './DigitDisplay'

interface Props {
  size?: DigitDisplaySize
  minDigits?: number
  linkToProfile?: boolean
  className?: string
}

export const PointsTicker = ({
  size = 'md',
  minDigits = 4,
  linkToProfile = false,
  className,
}: Props) => {
  const { user } = useAuthContext()

  if (!user) return null

  const score = user.score ?? 0

  const ticker = (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={score}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        transition={{ duration: 0.2 }}
        className={cn('inline-flex items-center', className)}
      >
        <DigitDisplay value={score} size={size} minDigits={minDigits} />
      </motion.span>
    </AnimatePresence>
  )

  if (linkToProfile) {
    return (
      <Link
        to="/profile"
        aria-label={`${score} points — view profile`}
        className="inline-flex items-center rounded-sm hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300"
      >
        {ticker}
      </Link>
    )
  }

  return ticker
}
