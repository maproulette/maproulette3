import { ChallengeForm } from '@/components/Pages/ManagementPages/ManageChallengeNew/ChallengeForm'
import { ManageFormLayout } from '@/components/shared/ManageFormLayout'
import { CreateChallengeFormProvider } from '@/contexts/ChallengeFormContext'

interface ManageChallengeNewProps {
  projectId?: number
}

export const ManageChallengeNew = ({ projectId }: ManageChallengeNewProps) => {
  return (
    <CreateChallengeFormProvider projectId={projectId}>
      <ManageFormLayout
        backTo={projectId ? '/manage/project/$projectId' : '/manage/challenges'}
        backParams={projectId ? { projectId: projectId.toString() } : undefined}
        backLabel={projectId ? 'Back to Project' : 'Back to Challenges'}
        pageTitle="Create New Challenge"
        pageDescription="Create a new MapRoulette challenge"
        cardTitle="Challenge Details"
        cardDescription="Fill in the information below to create your new challenge"
        guidanceTitle="Challenge Authoring Tips"
        guidanceDescription="Aim for clear, repeatable task instructions and data quality."
        guidanceItems={[
          'Write mapper instructions with exact pass/fail criteria.',
          'Validate task data source and geometry quality before publishing.',
          'Set realistic difficulty to match expected contributor skill.',
        ]}
        guidanceLinks={[
          {
            label: 'Challenge Creation Guide',
            href: 'https://learn.maproulette.org/en-US/documentation/creating-a-challenge/',
          },
          {
            label: 'Overpass Query Docs',
            href: 'https://learn.maproulette.org/documentation/overpass-queries/',
          },
        ]}
      >
        <ChallengeForm />
      </ManageFormLayout>
    </CreateChallengeFormProvider>
  )
}
