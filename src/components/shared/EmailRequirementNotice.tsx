import { Link } from '@tanstack/react-router'
import { AlertTriangle } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useIntl } from '@/i18n'
import { getEmailEnforcement, isMissingEmail } from '@/lib/emailEnforcement'

export const EmailRequirementNotice = () => {
  const { user } = useAuthContext()
  const { t } = useIntl()
  const enforcement = getEmailEnforcement()

  if (enforcement === 'none' || !isMissingEmail(user)) return null

  const required = enforcement === 'required'

  return (
    <div
      role={required ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-md border p-3 text-sm ${
        required
          ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200'
          : 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
      }`}
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="flex-1">
        <p className="font-medium">
          {t('shared.emailRequirementNotice.title', undefined, 'Email address required')}
        </p>
        <p>
          {required
            ? t(
                'shared.emailRequirementNotice.required',
                undefined,
                'You must set an email address before performing admin actions.'
              )
            : t(
                'shared.emailRequirementNotice.recommended',
                undefined,
                'We recommend setting an email so we can reach you about your challenges.'
              )}{' '}
          <Link to="/settings" className="underline">
            {t('shared.emailRequirementNotice.goToSettings', undefined, 'Go to settings')}
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
