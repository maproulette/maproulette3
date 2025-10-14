import { zodResolver } from '@hookform/resolvers/zod'
import { Check, CopyCheck, RotateCcwKey } from 'lucide-react'
import { useId } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Field, FieldDescription, FieldGroup, FieldLegend, FieldSet } from '@/components/ui/Field'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/InputGroup'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Spinner } from '@/components/ui/Spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import type { User } from '@/types/User'
import { ButtonGroup } from './ui/ButtonGroup'

const editorOptions = [
  { value: -1, label: 'None' },
  { value: 0, label: 'Edit in iD (web editor)' },
  { value: 1, label: 'Edit in JOSM' },
  { value: 2, label: 'Edit in new JOSM layer' },
  { value: 3, label: 'Edit in level0' },
  { value: 4, label: 'Edit just features in JOSM' },
  { value: 5, label: 'Edit in Rapid' },
]

const baseMapOptions = [
  { value: -1, label: 'None' },
  { value: 'Bing', label: 'Bing Maps Aerial' },
  { value: 'EsriWorldImagery', label: 'Esri World Imagery' },
  { value: 'EsriWorldImageryClarity', label: 'Esri World Imagery (Clarity) Beta' },
  { value: 'Mapbox', label: 'Mapbox Satellite' },
  { value: 'OpenAerialMapMosaic', label: 'OpenAerialMap Mosaic, by Kontur.io' },
  { value: 'MAPNIK', label: 'OpenStreetMap (Standard)' },
  { value: 'tf-cycle', label: 'Thunderforest OpenCycleMap' },
]

const localeOptions = [
  { value: 'en-US', label: 'English (U.S.)' },
  { value: 'af', label: 'Afrikaans' },
  { value: 'cs-CZ', label: 'Čeština' },
  { value: 'de', label: 'Deutsch' },
  { value: 'es', label: 'Español' },
  { value: 'fa-IR', label: 'فارسی' },
  { value: 'fr', label: 'Français' },
  { value: 'it', label: 'Italiano' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'nl', label: 'Nederlands' },
  { value: 'pl', label: 'Polski' },
  { value: 'pt-BR', label: 'Português Brasileiro' },
  { value: 'pt-PT', label: 'Português Portugal' },
  { value: 'ru-RU', label: 'Русский' },
  { value: 'sr', label: 'Српски' },
  { value: 'tr', label: 'Türkçe' },
  { value: 'uk', label: 'Українська' },
  { value: 'vi', label: 'tiếng Việt' },
  { value: 'zh-TW', label: '國語' },
]

const formSchema = z.object({
  defaultEditor: z
    .number()
    .refine((val) => editorOptions.some((option) => option.value === val), {
      message: 'Invalid editor option',
    })
    .optional(),
  defaultBasemap: z.refine((val) => baseMapOptions.some((option) => option.value === val), {
    message: 'Invalid basemap option',
  }),
  defaultBasemapId: z.string().optional(),
  locale: z
    .string()
    .refine((val) => localeOptions.some((option) => option.value === val), {
      message: 'Invalid language option',
    })
    .optional(),
  email: z.email().optional().or(z.literal('')),
  emailOptIn: z.boolean().optional(),
  leaderboardOptOut: z.boolean().optional(),
  needsReview: z.number().min(0).optional(),
  isReviewer: z.boolean().optional(),
  allowFollowing: z.boolean().optional(),
  theme: z.number().min(0).max(2).optional(),
  seeTagFixSuggestions: z.boolean().optional(),
  disableTaskConfirm: z.boolean().optional(),
})

function AccountForm({ user }: { user: User }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      defaultEditor: user?.settings?.defaultEditor ?? -1,
      defaultBasemap: user?.settings?.defaultBasemap ?? -1,
      defaultBasemapId: user?.settings?.defaultBasemapId,
      email: user?.settings?.email,
      // emailOptIn: user?.settings?.emailOptIn ?? false,
      locale: user?.settings?.locale ?? 'en-US',
      // leaderboardOptOut: user?.settings?.leaderboardOptOut ?? false,
      // needsReview: user?.settings?.needsReview ?? 0,
      // isReviewer: user?.settings?.isReviewer ?? false,
      // allowFollowing: user?.settings?.allowFollowing ?? true,
      // theme: user?.settings?.theme ?? 0,
      // seeTagFixSuggestions: user?.settings?.seeTagFixSuggestions ?? true,
      // disableTaskConfirm: user?.settings?.disableTaskConfirm ?? false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
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
    <div className="px-4 pt-24 md:pt-32">
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
                  <FieldSet>
                    <FieldLegend>General</FieldLegend>
                    <FieldDescription>
                      Update your general account settings and preferences.
                    </FieldDescription>
                    <FieldGroup>
                      <FormField
                        control={form.control}
                        name="locale"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Language</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={String(field.value)}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select a default language" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {localeOptions.map((option) => (
                                  <SelectItem key={option.value} value={String(option.value)}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Choose your preferred language (locale) for the interface.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid gap-6 lg:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="defaultEditor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Default Editor</FormLabel>
                              <Select
                                onValueChange={(value) => field.onChange(Number(value))}
                                defaultValue={String(field.value)}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a default editor" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {editorOptions.map((option) => (
                                    <SelectItem key={option.value} value={String(option.value)}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Choose your preferred editor for mapping tasks.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="defaultBasemap"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Default Basemap</FormLabel>
                              <Select
                                onValueChange={(value) =>
                                  field.onChange(
                                    Number.isNaN(Number(value)) ? value : Number(value)
                                  )
                                }
                                defaultValue={String(field.value)}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a default basemap" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {baseMapOptions.map((option) => (
                                    <SelectItem key={option.value} value={String(option.value)}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Choose the default map background for your tasks.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="defaultBasemapId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom Basemap URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://example.com/tiles/{z}/{x}/{y}.png"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </FieldGroup>
                    <FieldSubmit isSubmitting={form.formState.isSubmitting} />
                  </FieldSet>
                </TabsContent>
                <TabsContent value="notifications">
                  <FieldSet>
                    <FieldLegend>Notifications</FieldLegend>
                    <FieldDescription>Manage your notification preferences.</FieldDescription>
                    <FieldGroup>
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormDescription>
                              If you request emails in your Notification Subscriptions, they will be
                              sent here.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FieldSet>
                        <FieldLegend>Notification Subscriptions</FieldLegend>
                        <FieldDescription>
                          Decide which MapRoulette notifications you would like to receive, along
                          with whether you would like to be sent an email informing you of the
                          notification (either immediately or as a daily digest)
                        </FieldDescription>
                        <FieldGroup>
                          {/* Placeholder for future notification subscription options */}
                        </FieldGroup>
                      </FieldSet>
                    </FieldGroup>
                    <FieldSubmit isSubmitting={form.formState.isSubmitting} />
                  </FieldSet>
                </TabsContent>
                <TabsContent value="api">
                  <FieldSet>
                    <FieldLegend>API</FieldLegend>
                    <FieldDescription>Manage your API preferences.</FieldDescription>
                    <FieldGroup>
                      <FieldApiKey apiKey={user.apiKey} />
                    </FieldGroup>
                  </FieldSet>
                </TabsContent>
              </FieldGroup>
            </div>
          </Tabs>
        </form>
      </Form>
    </div>
  )
}

function FieldApiKey({ apiKey }: React.ComponentProps<typeof FormItem> & { apiKey: string }) {
  const id = useId()
  const { copy, isCopied } = useCopyToClipboard()
  return (
    <FormItem>
      <FormLabel htmlFor={id}>Key</FormLabel>
      <FormControl>
        <ButtonGroup className="w-full">
          <InputGroup>
            <InputGroupInput id={id} placeholder={apiKey} readOnly />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                aria-label="Copy"
                title="Copy"
                size="icon-xs"
                onClick={() => {
                  copy(apiKey)
                }}
              >
                {isCopied ? <Check /> : <CopyCheck />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <Button type="button" variant="outline" aria-label="Reset API key">
            <RotateCcwKey aria-hidden="true" />
          </Button>
        </ButtonGroup>
      </FormControl>
      <FormMessage />
    </FormItem>
  )
}

function FieldSubmit({
  className,
  isSubmitting,
  ...props
}: React.ComponentProps<typeof Field> & {
  isSubmitting: boolean
}) {
  return (
    <Field className={className} orientation="horizontal" {...props}>
      <Button disabled={isSubmitting} type="submit" size="lg">
        {isSubmitting ? (
          <>
            <Spinner />
            Submitting...
          </>
        ) : (
          'Submit'
        )}
      </Button>
    </Field>
  )
}

export { AccountForm }
