import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { Challenges } from '@/components/ExploreChallengesPage'

const challengesSearchSchema = z.object({
  viewMode: z.enum(['grid', 'list', 'grid-map']).optional().catch('grid-map'),
  difficulty: z.enum(['Any', 'Easy', 'Normal', 'Expert']).optional().catch('Any'),
  workOn: z
    .enum([
      'Anything',
      'Roads / Pedestrian / Cycleways',
      'Water',
      'Points / Areas of Interest',
      'Buildings',
      'Land Use / Administrative Boundaries',
      'Transit',
    ])
    .optional()
    .catch('Anything'),
  categories: z.string().optional(), // comma-separated string
  sortBy: z
    .enum(['name', 'created', 'modified', 'popularity', 'difficulty'])
    .optional()
    .catch('name'),
  global: z.boolean().optional().catch(false),
  location_id: z.number().optional(),
  bounds: z.string().optional(), // format: "minLon,minLat,maxLon,maxLat"
})

export const Route = createFileRoute('/_app/')({
  validateSearch: challengesSearchSchema,
  staticData: { pageTitle: 'Explore Challenges' },
  head: () => ({
    meta: [
      {
        title: 'Challenges',
      },
    ],
  }),
  component: Challenges,
})
