import { z } from 'zod'

export const teamFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Keep it under 100 characters'),
  description: z.string().max(1000, 'Keep it under 1000 characters').optional(),
  avatarURL: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

export type TeamFormValues = z.infer<typeof teamFormSchema>
