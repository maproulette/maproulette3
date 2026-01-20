/**
 * Cookie utility functions for persisting user preferences
 */

const COOKIE_PREFIX = 'mr4_'
const COOKIE_EXPIRY_DAYS = 365 // 1 year

/**
 * Set a cookie with the given name and value
 */
export const setCookie = (name: string, value: string, days: number = COOKIE_EXPIRY_DAYS): void => {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API is async and not widely supported; document.cookie is the standard synchronous approach
  document.cookie = `${COOKIE_PREFIX}${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

/**
 * Get a cookie value by name
 */
export const getCookie = (name: string): string | null => {
  const nameEQ = `${COOKIE_PREFIX}${name}=`
  const cookies = document.cookie.split(';')
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i]
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length)
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length))
    }
  }
  return null
}

/**
 * Remove a cookie by name
 */
export const removeCookie = (name: string): void => {
  // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API is async and not widely supported; document.cookie is the standard synchronous approach
  document.cookie = `${COOKIE_PREFIX}${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
}

/**
 * Set a JSON cookie (serializes object to JSON string)
 */
export const setJSONCookie = (name: string, value: unknown, days?: number): void => {
  try {
    const jsonString = JSON.stringify(value)
    setCookie(name, jsonString, days)
  } catch (error) {
    console.error(`Failed to set cookie ${name}:`, error)
  }
}

/**
 * Get a JSON cookie (deserializes JSON string to object)
 */
export const getJSONCookie = <T>(name: string): T | null => {
  try {
    const cookieValue = getCookie(name)
    if (!cookieValue) return null
    return JSON.parse(cookieValue) as T
  } catch (error) {
    console.error(`Failed to get cookie ${name}:`, error)
    return null
  }
}
