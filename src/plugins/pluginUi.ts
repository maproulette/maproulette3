import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'

/** Stable UI surface exposed to runtime plugins via PluginApiContext.ui */
export const pluginUi = {
  Button,
  Label,
  Textarea,
} as const
