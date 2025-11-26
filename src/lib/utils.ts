import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function initials(fullName: string): string {
  const words = fullName.trim().split(/\s+/)

  const initials = words.map((word) => word.charAt(0).toUpperCase())

  return initials.join('')
}

export { cn, initials }
