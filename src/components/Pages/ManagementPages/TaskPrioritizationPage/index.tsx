import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/api'
import { TaskPropertyQueryBuilder } from '@/components/shared/TaskPropertyQueryBuilder'
import type { BinaryNode } from '@/components/shared/TaskPropertyQueryBuilder/propertyRuleTypes'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { logger } from '@/lib/logger'

type Tier = 'high' | 'medium' | 'low'

const tierLabel: Record<Tier, string> = {
  high: 'High priority',
  medium: 'Medium priority',
  low: 'Low priority',
}

const tierColor: Record<Tier, string> = {
  high: 'border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/40',
  medium: 'border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40',
  low: 'border-blue-300 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40',
}

const tierToField: Record<Tier, 'highPriorityRule' | 'mediumPriorityRule' | 'lowPriorityRule'> = {
  high: 'highPriorityRule',
  medium: 'mediumPriorityRule',
  low: 'lowPriorityRule',
}

interface Props {
  challengeId: number
  initialRules?: Partial<Record<Tier, BinaryNode | null>>
  defaultPriority?: number
}

export const TaskPrioritizationPage = ({
  challengeId,
  initialRules,
  defaultPriority = 1,
}: Props) => {
  const [rules, setRules] = useState<Record<Tier, BinaryNode | null>>({
    high: initialRules?.high ?? null,
    medium: initialRules?.medium ?? null,
    low: initialRules?.low ?? null,
  })
  const mutation = api.challenge.useUpdatePriorities()

  const handleSave = async () => {
    try {
      await mutation.mutateAsync({
        challengeId,
        priorities: {
          defaultPriority,
          [tierToField.high]: rules.high ? JSON.stringify(rules.high) : undefined,
          [tierToField.medium]: rules.medium ? JSON.stringify(rules.medium) : undefined,
          [tierToField.low]: rules.low ? JSON.stringify(rules.low) : undefined,
        },
      })
      toast.success('Priorities saved')
    } catch (error) {
      logger.error('Priority save failed', { error })
      toast.error('Could not save priorities')
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl">Task prioritization</h1>
          <p className="text-sm text-zinc-500 dark:text-slate-400">
            Challenge #{challengeId} — rules run top-down; the first tier to match wins.
          </p>
        </div>
        <Button onClick={handleSave} disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving…' : 'Save'}
        </Button>
      </header>
      {(Object.keys(rules) as Tier[]).map((tier) => (
        <Card key={tier} className={`border ${tierColor[tier]}`}>
          <CardHeader>
            <CardTitle className="text-base">{tierLabel[tier]}</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskPropertyQueryBuilder
              value={rules[tier]}
              onChange={(next) => setRules((prev) => ({ ...prev, [tier]: next }))}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
