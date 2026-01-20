interface OverlapTaskPinProps {
  tasks: Array<{ id: number }>
}

export const OverlapTaskPin = ({ tasks }: OverlapTaskPinProps) => {
  const taskCount = tasks.length
  const displayText = taskCount > 20 ? '20+' : String(taskCount)
  const fontSize = taskCount >= 10 ? '9' : '10'
  const textY = taskCount >= 10 ? '15' : '16'
  // Dark blue color - using a darker shade for better visibility
  const darkBlue = '#1e3a8a'

  return (
    <svg width="32" height="44" viewBox="-4 -4 32 44" xmlns="http://www.w3.org/2000/svg">
      <title>Overlapping task pins marker</title>
      <path
        d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z"
        fill={darkBlue}
        stroke="white"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="7" fill="white" />
      <text
        x="12"
        y={textY}
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize={fontSize}
        fontWeight="bold"
        fill={darkBlue}
      >
        {displayText}
      </text>
    </svg>
  )
}
