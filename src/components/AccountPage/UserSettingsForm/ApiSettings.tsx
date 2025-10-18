import { FieldDescription, FieldGroup, FieldLegend, FieldSet } from '@/components/ui/Field'
import type { User } from '@/types/User'
import { FieldApiKey } from '../FieldApiKey'

export const ApiSettings = ({ user }: { user: User }) => {
  return (
    <FieldSet>
      <FieldLegend>API</FieldLegend>
      <FieldDescription>Manage your API preferences.</FieldDescription>
      <FieldGroup>
        <FieldApiKey apiKey={user.apiKey} />
      </FieldGroup>
    </FieldSet>
  )
}
