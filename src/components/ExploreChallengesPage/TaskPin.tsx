import { STATUS_CONFIG } from '@/components/shared/TaskMarkers/const'

interface TaskPinProps {
  status: number
  priority?: number
  difficulty?: number
}

export const TaskPin = ({ status, priority = 0, difficulty = 1 }: TaskPinProps) => {
  const statusConfig = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG[0]
  const color = statusConfig.color

  const DIFFICULTY_LETTERS: Record<number, string> = {
    0: 'H',
    1: 'M',
    6: 'L',
  }
  const letter = DIFFICULTY_LETTERS[difficulty] || 'M'

  return (
    <svg width="32" height="44" viewBox="-4 -4 32 44" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z"
        fill={color}
        stroke="white"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="7" fill="white" />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="10"
        fontWeight="bold"
        fill={color}
      >
        {letter}
      </text>
    </svg>
  )
}
