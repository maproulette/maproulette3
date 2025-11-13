import { Puzzle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { FieldDescription, FieldLegend, FieldSet } from '@/components/ui/Field'
import { Label } from '@/components/ui/Label'
import { Separator } from '@/components/ui/Separator'
import { Switch } from '@/components/ui/Switch'
import { usePluginContext } from '@/contexts/PluginContext'
import { RemotePluginManager } from './RemotePluginManager'

export const PluginSettings = () => {
  const { getAvailablePlugins, isPluginEnabled, togglePlugin, loading } = usePluginContext()
  const availablePlugins = getAvailablePlugins()

  if (loading) {
    return (
      <FieldSet>
        <FieldLegend>Plugins</FieldLegend>
        <FieldDescription>Loading plugins...</FieldDescription>
      </FieldSet>
    )
  }

  return (
    <FieldSet>
      <FieldLegend>Plugins</FieldLegend>
      <FieldDescription>
        Enable or disable plugins to customize your MapRoulette experience. Plugin navigation items
        will appear in the main navigation menu.
      </FieldDescription>

      {/* Remote Plugin Manager */}
      <div className="mb-6">
        <RemotePluginManager />
      </div>

      <Separator className="my-6" />

      <div className="space-y-4">
        {availablePlugins.map((plugin) => {
          const enabled = isPluginEnabled(plugin.metadata.id)
          
          return (
            <div key={plugin.metadata.id}>
              <div className="flex items-start justify-between gap-4 rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900">
                <div className="flex gap-3">
                  <div className="mt-1 flex size-10 items-center justify-center rounded-lg bg-lime-100 text-lime-600 dark:bg-lime-900/20">
                    <Puzzle className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`plugin-${plugin.metadata.id}`} className="font-semibold">
                        {plugin.metadata.name}
                      </Label>
                      <Badge variant={enabled ? 'default' : 'outline'} className="text-xs">
                        {enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                      <span className="text-xs text-zinc-500">v{plugin.metadata.version}</span>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {plugin.metadata.description}
                    </p>
                    {plugin.metadata.author && (
                      <p className="text-xs text-zinc-500">by {plugin.metadata.author}</p>
                    )}
                  </div>
                </div>
                <Switch
                  id={`plugin-${plugin.metadata.id}`}
                  checked={enabled}
                  onCheckedChange={(checked) => togglePlugin(plugin.metadata.id, checked)}
                  aria-label={`Toggle ${plugin.metadata.name}`}
                />
              </div>
              {plugin.metadata.id !== availablePlugins[availablePlugins.length - 1]?.metadata.id && (
                <Separator className="my-4" />
              )}
            </div>
          )
        })}
      </div>
    </FieldSet>
  )
}

