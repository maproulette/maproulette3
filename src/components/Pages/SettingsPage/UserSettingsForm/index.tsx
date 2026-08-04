import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'
import { api } from '@/api'
import { FieldGroup } from '@/components/ui/Field'
import { Form } from '@/components/ui/Form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useIntl } from '@/i18n'
import type { User, UserSettings } from '@/types/User'
import { ApiSettings } from './ApiSettings'
import { formSchema } from './formSchema'
import { GeneralSettings } from './GeneralSettings'
import { NotificationsSettings } from './NotificationsSettings'
import { PluginSettings } from './PluginSettings'

export const UserSettingsForm = ({ user }: { user: User }) => {
  const { locale } = useIntl()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      defaultEditor: user.settings.defaultEditor ?? -1,
      defaultBasemap: user.settings.defaultBasemap ?? -1,
      defaultBasemapId: user.settings.defaultBasemapId ?? '',
      email: user.settings.email ?? '',
      locale: user.settings.locale ?? locale,
    },
  })

  const { mutateAsync: updateUserSettings } = api.user.useUpdateUserSettings()

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await updateUserSettings({
      userId: user.id,
      // UserSettings is generated from an OpenAPI spec that only types defaultBasemap
      // as number | null, but the backend also accepts string basemap ids (see
      // formSchema.ts / GeneralSettings.tsx) — the generated type is stale, not `values`.
      settings: values as unknown as UserSettings,
    })
    toast('User settings updated')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-3xl space-y-4">
        <h1 className="font-bold text-base">Account</h1>
        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="plugins">Plugins</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
          </TabsList>
          <div className="rounded-lg bg-zinc-50 p-4 lg:p-6 dark:bg-slate-900">
            <FieldGroup>
              <TabsContent value="general">
                <GeneralSettings form={form} />
              </TabsContent>
              <TabsContent value="notifications">
                <NotificationsSettings form={form} />
              </TabsContent>
              <TabsContent value="plugins">
                <PluginSettings />
              </TabsContent>
              <TabsContent value="api">
                <ApiSettings />
              </TabsContent>
            </FieldGroup>
          </div>
        </Tabs>
      </form>
    </Form>
  )
}
