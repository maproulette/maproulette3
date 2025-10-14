import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function initials(fullName: string): string {
  // Trim leading/trailing spaces and split the string by one or more spaces
  const words = fullName.trim().split(/\s+/)

  // Map each word to its first character and convert to uppercase
  const initials = words.map((word) => word.charAt(0).toUpperCase())

  // Join the initials together to form the final string
  return initials.join('')
}

export { cn, initials }
