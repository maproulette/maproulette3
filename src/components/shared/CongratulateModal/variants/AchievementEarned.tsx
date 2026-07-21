import { AchievementBadge } from '@/components/shared/AchievementBadge'
import { useIntl } from '@/i18n'
import { getAchievement } from '@/types/Achievement'

interface Props {
  achievementId: number
}

export const AchievementEarnedContent = ({ achievementId }: Props) => {
  const { t } = useIntl()
  const def = getAchievement(achievementId)
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <AchievementBadge achievement={achievementId} size="lg" showTooltip={false} />
      <div>
        <h2 className="font-bold text-xl">
          {t('congratulateModal.achievement.title', undefined, 'Achievement unlocked!')}
        </h2>
        <p className="text-zinc-600 dark:text-slate-400">
          {def
            ? `${def.title} — ${def.description}`
            : t('congratulateModal.achievement.fallback', undefined, 'You earned a new badge.')}
        </p>
      </div>
    </div>
  )
}
