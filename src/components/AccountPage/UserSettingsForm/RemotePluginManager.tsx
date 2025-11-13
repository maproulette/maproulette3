import { AlertCircle, Download, ExternalLink, Plus, Trash2 } from 'lucide-react'
import { useId, useState } from 'react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { usePluginContext } from '@/contexts/PluginContext'

export const RemotePluginManager = () => {
  const { registerPluginFromUrl, removeRemotePlugin, getAvailablePlugins, getRemotePluginUrls } =
    usePluginContext()
  const [moduleUrl, setModuleUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const inputId = useId()

  const remotePluginUrls = getRemotePluginUrls()
  const availablePlugins = getAvailablePlugins()
  const remotePlugins = availablePlugins.filter((plugin) =>
    remotePluginUrls.has(plugin.metadata.id)
  )

  const validateUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url)
      if (!parsed.protocol.startsWith('http')) {
        setValidationError('Only HTTP(S) URLs are supported')
        return false
      }
      setValidationError(null)
      return true
    } catch {
      setValidationError('Invalid URL format')
      return false
    }
  }

  const handleAddPlugin = async () => {
    if (!moduleUrl.trim()) {
      setValidationError('Please enter a module URL')
      return
    }

    if (!validateUrl(moduleUrl)) {
      return
    }

    setIsLoading(true)
    setValidationError(null)

    try {
      const result = await registerPluginFromUrl(moduleUrl)

      if (result.success && result.plugin) {
        toast.success(`Plugin "${result.plugin.metadata.name}" loaded successfully!`)
        setModuleUrl('')
      } else {
        setValidationError(result.error || 'Failed to load plugin')
        toast.error(`Failed to load plugin: ${result.error}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load plugin'
      setValidationError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemovePlugin = async (pluginId: string, pluginName: string) => {
    if (!confirm(`Are you sure you want to remove the plugin "${pluginName}"?`)) {
      return
    }

    try {
      await removeRemotePlugin(pluginId)
      toast.success(`Plugin "${pluginName}" removed successfully`)
    } catch (error) {
      toast.error('Failed to remove plugin')
      console.error('Failed to remove plugin:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 font-semibold text-lg">Remote Plugins</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Load plugins dynamically from external URLs. Make sure you trust the source before adding
          any plugin.
        </p>
      </div>

      <Alert variant="warning">
        <AlertCircle className="size-4" />
        <AlertTitle>Security Warning</AlertTitle>
        <AlertDescription>
          Only load plugins from trusted sources. Remote plugins have access to your application and
          data. Always verify the source before adding a plugin.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor={inputId}>Plugin Module URL</Label>
        <div className="flex gap-2">
          <Input
            id={inputId}
            type="url"
            placeholder="https://example.com/my-plugin.js"
            value={moduleUrl}
            onChange={(e) => {
              setModuleUrl(e.target.value)
              setValidationError(null)
            }}
            className="flex-1"
            disabled={isLoading}
          />
          <Button onClick={handleAddPlugin} disabled={isLoading || !moduleUrl.trim()}>
            {isLoading ? (
              <>
                <Download className="mr-2 size-4 animate-pulse" />
                Loading...
              </>
            ) : (
              <>
                <Plus className="mr-2 size-4" />
                Add Plugin
              </>
            )}
          </Button>
        </div>
        {validationError && (
          <p className="flex items-center gap-1 text-red-600 text-sm dark:text-red-400">
            <AlertCircle className="size-3" />
            {validationError}
          </p>
        )}
        <p className="text-xs text-zinc-500">
          Enter the full URL to a plugin module (ESM format). The plugin will be loaded and
          registered automatically.
        </p>
      </div>

      {remotePlugins.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Loaded Remote Plugins</h4>
          <div className="space-y-2">
            {remotePlugins.map((plugin) => {
              const moduleUrl = remotePluginUrls.get(plugin.metadata.id)
              return (
                <div
                  key={plugin.metadata.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{plugin.metadata.name}</span>
                      <span className="text-xs text-zinc-500">v{plugin.metadata.version}</span>
                    </div>
                    {moduleUrl && (
                      <a
                        href={moduleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 text-xs hover:underline dark:text-blue-400"
                      >
                        <ExternalLink className="size-3" />
                        {moduleUrl.length > 60 ? `${moduleUrl.substring(0, 60)}...` : moduleUrl}
                      </a>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePlugin(plugin.metadata.id, plugin.metadata.name)}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
