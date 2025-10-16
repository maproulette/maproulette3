export const getDifficultyLabel = (difficulty: number) => {
  switch (difficulty) {
    case 1:
      return 'Easy'
    case 2:
      return 'Normal'
    case 3:
      return 'Expert'
    default:
      return 'Normal'
  }
}

export const getDifficultyColor = (difficulty: number) => {
  switch (difficulty) {
    case 1:
      return 'text-green-600'
    case 2:
      return 'text-yellow-600'
    case 3:
      return 'text-red-600'
    default:
      return 'text-yellow-600'
  }
}
