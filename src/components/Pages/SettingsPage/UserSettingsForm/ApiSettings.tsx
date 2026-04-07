import { useAuthContext } from '@/components/AuthContext'
import { FieldDescription, FieldGroup, FieldLegend, FieldSet } from '@/components/ui/Field'
import { FieldApiKey } from './FieldApiKey'

export const ApiSettings = () => {
  const { user } = useAuthContext()

  return (
    <FieldSet>
      <FieldLegend>API</FieldLegend>
      <FieldDescription>Manage your API preferences.</FieldDescription>
      <FieldGroup>
        <FieldApiKey apiKey={user?.apiKey ?? ''} />
      </FieldGroup>
    </FieldSet>
  )
}
