import type { ComponentType } from 'react'
import { TaskSelectionMap as HostTaskSelectionMap } from '@/components/Pages/TaskEditPage/TaskNearbyMap'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Label } from '@/components/ui/Label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup'
import { Separator } from '@/components/ui/Separator'
import { StatCard, StatCardGrid } from '@/components/ui/StatCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Textarea } from '@/components/ui/Textarea'
import type { PluginTaskMapItem } from '@/types/Plugin'

const TaskSelectionMap = HostTaskSelectionMap as unknown as ComponentType<{
  currentTask: PluginTaskMapItem
  tasks: PluginTaskMapItem[]
  selectedTaskId: number | null
  onTaskSelect: (taskId: number | null) => void
}>

/** Stable UI surface exposed to runtime plugins via PluginApiContext.ui */
export const pluginUi = {
  Button,
  Badge,
  Alert,
  AlertTitle,
  AlertDescription,
  Separator,
  StatCard,
  StatCardGrid,
  ProgressBar,
  Label,
  Textarea,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  RadioGroup,
  RadioGroupItem,
  TaskSelectionMap,
} as const
