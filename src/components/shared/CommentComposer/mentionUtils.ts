export interface MentionMatch {
  start: number
  end: number
  query: string
}

const mentionTokenPattern = /(^|\s)@([A-Za-z0-9_-]{0,})$/

export const findMention = (text: string, cursorPos: number): MentionMatch | null => {
  const before = text.slice(0, cursorPos)
  const match = before.match(mentionTokenPattern)
  if (!match) return null
  const prefix = match[1] ?? ''
  const query = match[2] ?? ''
  const start = cursorPos - query.length - 1
  return {
    start: start + (prefix.length === 0 && before[0] === '@' ? 0 : 0),
    end: cursorPos,
    query,
  }
}

export const insertMention = (
  text: string,
  match: MentionMatch,
  displayName: string
): { text: string; newCursor: number } => {
  const replacement = `@${displayName} `
  const newText = text.slice(0, match.start) + replacement + text.slice(match.end)
  return { text: newText, newCursor: match.start + replacement.length }
}
