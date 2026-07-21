import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'
import { api } from '@/api'
import { FieldGroup } from '@/components/ui/Field'
import { Form } from '@/components/ui/Form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import type { User, UserSettings } from '@/types/User'
import { ApiSettings } from './ApiSettings'
import { formSchema } from './formSchema'
import { GeneralSettings } from './GeneralSettings'
import { NotificationsSettings } from './NotificationsSettings'
import { PluginSettings } from './PluginSettings'

export const UserSettingsForm = ({ user }: { user: User }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      defaultEditor: user.settings.defaultEditor ?? -1,
      defaultBasemap: user.settings.defaultBasemap ?? -1,
      defaultBasemapId: user.settings.defaultBasemapId ?? '',
      email: user.settings.email ?? '',
      locale: user.settings.locale ?? 'en-US',
    },
  })

  const { mutateAsync: updateUserSettings } = api.user.useUpdateUserSettings()

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // `defaultBasemap`'s zod schema is a bare `.refine()` with no base type, so
    // it infers as `unknown` even though the form only ever produces a number
    // (see formSchema.ts) — narrow it back to the shape the API expects.
    await updateUserSettings({
      userId: user.id,
      settings: values as UserSettings,
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
