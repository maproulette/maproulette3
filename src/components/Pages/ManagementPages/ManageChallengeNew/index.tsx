import { ChallengeForm } from '@/components/Pages/ManagementPages/ManageChallengeNew/ChallengeForm'
import { FormCard, ManageFormLayout } from '@/components/shared/ManageFormLayout'
import { CreateChallengeFormProvider } from '@/contexts/ChallengeFormContext'

interface ManageChallengeNewProps {
  projectId?: number
}

export const ManageChallengeNew = ({ projectId }: ManageChallengeNewProps) => {
  return (
    <CreateChallengeFormProvider projectId={projectId}>
      <ManageFormLayout>
        <FormCard
          title="Challenge Details"
          description="Fill in the information below to create your new challenge"
        >
          <ChallengeForm />
        </FormCard>
      </ManageFormLayout>
    </CreateChallengeFormProvider>
  )
}
