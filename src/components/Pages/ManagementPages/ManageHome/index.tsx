import { Link } from '@tanstack/react-router'
import { CheckSquare, FolderKanban, ListChecks } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuthContext } from '@/contexts/AuthContext'
import { useIntl } from '@/i18n'
import { isSuperUser } from '@/lib/SuperAdminGuard'

export const ManageHome = () => {
  const { t } = useIntl()
  const { user } = useAuthContext()
  const showTasksCard = user && isSuperUser(user)

  return (
    <div className="mx-auto h-full overflow-auto p-4">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Link to="/manage/projects">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                <FolderKanban className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>{t('manageHome.projectsTitle', undefined, 'Projects')}</CardTitle>
              <CardDescription>
                {t(
                  'manageHome.projectsDescription',
                  undefined,
                  'Create and manage your MapRoulette projects'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                {t('manageHome.viewProjects', undefined, 'View Projects')}
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link to="/manage/challenges">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                <ListChecks className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>{t('manageHome.challengesTitle', undefined, 'Challenges')}</CardTitle>
              <CardDescription>
                {t(
                  'manageHome.challengesDescription',
                  undefined,
                  'Browse and manage all your challenges'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                {t('manageHome.viewChallenges', undefined, 'View Challenges')}
              </Button>
            </CardContent>
          </Card>
        </Link>

        {showTasksCard && (
          <Link to="/manage/tasks">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                  <CheckSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>{t('manageHome.tasksTitle', undefined, 'Tasks')}</CardTitle>
                <CardDescription>
                  {t(
                    'manageHome.tasksDescription',
                    undefined,
                    'Open a task by ID to view or edit it'
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  {t('manageHome.openTaskById', undefined, 'Open task by ID')}
                </Button>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>
    </div>
  )
}
