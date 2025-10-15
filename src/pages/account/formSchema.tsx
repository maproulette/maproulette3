import z from 'zod'
import { baseMapOptions, editorOptions, localeOptions } from './const'

export const formSchema = z.object({
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
