import { useParams } from '@tanstack/react-router'
import { ChallengeForm } from '@/components/Pages/ManagementPages/ManageChallengeNew/ChallengeForm'
import { ManageFormLayout } from '@/components/shared/ManageFormLayout'
import { EditChallengeFormProvider, useChallengeFormContext } from '@/contexts/ChallengeFormContext'

const EditChallengeLayout = () => {
  const { challenge, challengeId, isLoading } = useChallengeFormContext()
  const challengeIdString = String(challengeId)

  return (
    <ManageFormLayout
      backTo="/manage/challenge/$challengeId"
      backParams={{ challengeId: challengeIdString }}
      backLabel="Back to Challenge"
      pageTitle={isLoading ? '' : `Edit ${challenge?.name}`}
      pageDescription="Update the challenge information below"
      cardTitle="Challenge Details"
      cardDescription="Modify the information below to update your challenge"
      isLoading={isLoading}
      guidanceTitle="Challenge Update Tips"
      guidanceDescription="Use edits to improve clarity and reduce mapper confusion."
      guidanceItems={[
        'When changing instructions, confirm they still match task geometry.',
        'Revisit difficulty and featured status after major data updates.',
        'If data source changes, test generated tasks before enabling discoverable.',
      ]}
      guidanceLinks={[
        {
          label: 'Challenge Creation Guide',
          href: 'https://learn.maproulette.org/en-US/documentation/creating-a-challenge/',
        },
      ]}
    >
      <ChallengeForm />
    </ManageFormLayout>
  )
}

export const ManageChallengeEdit = () => {
  const { challengeId } = useParams({ from: '/_app/manage/challenge/$challengeId/edit' })
  return (
    <EditChallengeFormProvider challengeId={Number(challengeId)}>
      <EditChallengeLayout />
    </EditChallengeFormProvider>
  )
}
