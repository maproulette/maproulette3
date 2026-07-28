import type { TranslateFn } from '@/i18n'

export const getParentInfo = (parent: unknown) => {
  if (typeof parent === 'object' && parent !== null) {
    const parentObj = parent as { id?: number; name?: string }
    return { id: parentObj.id ?? null, name: parentObj.name || 'Unknown Project' }
  }
  if (typeof parent === 'number' || typeof parent === 'string') {
    return { id: parent, name: 'Unknown Project' }
  }
  return { id: null, name: 'Unknown Project' }
}

export const getGitHubErrorMessage = (t: TranslateFn, status: number, message: string) => {
  if (message.includes('Bad credentials') || status === 401) {
    return t(
      'browsedChallengePage.challengeModals.reportModal.githubAuthError',
      undefined,
      'GitHub authentication failed. Please check that your GitHub token is valid and has the necessary permissions.'
    )
  }
  if (status === 403) {
    return t(
      'browsedChallengePage.challengeModals.reportModal.githubForbiddenError',
      undefined,
      'GitHub API access forbidden. The token may not have the required permissions or the repository may be private.'
    )
  }
  if (status === 404) {
    return t(
      'browsedChallengePage.challengeModals.reportModal.githubNotFoundError',
      undefined,
      'GitHub repository not found. Please check that the repository exists and is accessible.'
    )
  }
  return message
}
