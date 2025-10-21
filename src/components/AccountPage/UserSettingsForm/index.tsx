import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'
import { FieldGroup } from '@/components/ui/Field'
import { Form } from '@/components/ui/Form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import type { User } from '@/types/User'
import { ApiSettings } from './ApiSettings'
import { formSchema } from './formSchema'
import { GeneralSettings } from './GeneralSettings'
import { NotificationsSettings } from './NotificationsSettings'

export const UserSettingsForm = ({ user }: { user: User }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      defaultEditor: user.settings.defaultEditor ?? -1,
      defaultBasemap: user.settings.defaultBasemap ?? -1,
      defaultBasemapId: user.settings.defaultBasemapId ?? '',
      email: user.settings.email ?? '',
      // emailOptIn: user.settings.emailOptIn ?? false,
      locale: user.settings.locale ?? 'en-US',
      // leaderboardOptOut: user.settings.leaderboardOptOut ?? false,
      // needsReview: user.settings.needsReview ?? 0,
      // isReviewer: user.settings.isReviewer ?? false,
      // allowFollowing: user.settings.allowFollowing ?? true,
      // theme: user.settings.theme ?? 0,
      // seeTagFixSuggestions: user.settings.seeTagFixSuggestions ?? true,
      // disableTaskConfirm: user.settings.disableTaskConfirm ?? false,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    // add a timeout to simulate a network request
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, 1000)
    }).then(() => {
      toast('User settings updated')
      console.log(values)
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-3xl space-y-4">
        <h1 className="font-bold text-2xl md:text-3xl">Account</h1>
        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
          </TabsList>
          <div className="rounded-lg bg-zinc-50 p-4 lg:p-8 dark:bg-zinc-950">
            <FieldGroup>
              <TabsContent value="general">
                <GeneralSettings form={form} />
              </TabsContent>
              <TabsContent value="notifications">
                <NotificationsSettings form={form} />
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
