import { Bell, Database, Globe, Mail, Palette, Save, Settings, Shield } from 'lucide-react'
import { useId } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Switch } from '@/components/ui/Switch'
import { Textarea } from '@/components/ui/Textarea'

export const SuperAdminSettings = () => {
  const siteNameId = useId()
  const siteDescriptionId = useId()
  const siteUrlId = useId()
  const maintenanceId = useId()
  const smtpHostId = useId()
  const smtpPortId = useId()
  const fromEmailId = useId()
  const emailEnabledId = useId()
  const requireVerificationId = useId()
  const twoFactorId = useId()
  const sessionTimeoutId = useId()
  const passwordPolicyId = useId()
  const dbHostId = useId()
  const dbPortId = useId()
  const autoBackupId = useId()
  const notifyNewUserId = useId()
  const notifyNewProjectId = useId()
  const notifyErrorsId = useId()
  const darkModeId = useId()
  const primaryColorId = useId()
  const logoUrlId = useId()

  return (
    <div className="mx-auto px-4">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <Settings className="h-8 w-8 text-zinc-600 dark:text-zinc-400" />
          <h1 className="font-bold text-base text-zinc-900 dark:text-zinc-50">Platform Settings</h1>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400">
          Configure platform-wide settings and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
              <CardTitle>General Settings</CardTitle>
            </div>
            <CardDescription>Basic platform configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor={siteNameId}>Site Name</Label>
              <Input id={siteNameId} defaultValue="MapRoulette" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={siteDescriptionId}>Site Description</Label>
              <Textarea
                id={siteDescriptionId}
                defaultValue="A platform for collaborative mapping and data validation"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={siteUrlId}>Site URL</Label>
              <Input id={siteUrlId} defaultValue="https://maproulette.org" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={maintenanceId}>Maintenance Mode</Label>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Enable maintenance mode to prevent user access
                </p>
              </div>
              <Switch id={maintenanceId} />
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
              <CardTitle>Email Settings</CardTitle>
            </div>
            <CardDescription>Configure email notifications and SMTP</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor={smtpHostId}>SMTP Host</Label>
              <Input id={smtpHostId} defaultValue="smtp.example.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={smtpPortId}>SMTP Port</Label>
              <Input id={smtpPortId} type="number" defaultValue="587" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={fromEmailId}>From Email Address</Label>
              <Input id={fromEmailId} type="email" defaultValue="noreply@maproulette.org" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={emailEnabledId}>Enable Email Notifications</Label>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Send email notifications to users
                </p>
              </div>
              <Switch id={emailEnabledId} defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
              <CardTitle>Security Settings</CardTitle>
            </div>
            <CardDescription>Configure security and authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={requireVerificationId}>Require Email Verification</Label>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Users must verify their email before accessing the platform
                </p>
              </div>
              <Switch id={requireVerificationId} defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={twoFactorId}>Enable Two-Factor Authentication</Label>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Allow users to enable 2FA for their accounts
                </p>
              </div>
              <Switch id={twoFactorId} defaultChecked />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={sessionTimeoutId}>Session Timeout (minutes)</Label>
              <Input id={sessionTimeoutId} type="number" defaultValue="60" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={passwordPolicyId}>Strict Password Policy</Label>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Require strong passwords (min 12 chars, special chars)
                </p>
              </div>
              <Switch id={passwordPolicyId} defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Database Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
              <CardTitle>Database Settings</CardTitle>
            </div>
            <CardDescription>Database configuration and maintenance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor={dbHostId}>Database Host</Label>
              <Input id={dbHostId} defaultValue="localhost" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={dbPortId}>Database Port</Label>
              <Input id={dbPortId} type="number" defaultValue="5432" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={autoBackupId}>Automatic Backups</Label>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Enable daily automatic database backups
                </p>
              </div>
              <Switch id={autoBackupId} defaultChecked />
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Run Maintenance</Button>
              <Button variant="outline">Create Backup</Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
              <CardTitle>Notification Settings</CardTitle>
            </div>
            <CardDescription>Configure platform notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={notifyNewUserId}>New User Notifications</Label>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Notify admins when new users sign up
                </p>
              </div>
              <Switch id={notifyNewUserId} defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={notifyNewProjectId}>New Project Notifications</Label>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Notify admins when new projects are created
                </p>
              </div>
              <Switch id={notifyNewProjectId} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={notifyErrorsId}>Error Notifications</Label>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Notify admins when system errors occur
                </p>
              </div>
              <Switch id={notifyErrorsId} defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
              <CardTitle>Appearance Settings</CardTitle>
            </div>
            <CardDescription>Customize the platform appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={darkModeId}>Default to Dark Mode</Label>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Set dark mode as the default theme for new users
                </p>
              </div>
              <Switch id={darkModeId} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={primaryColorId}>Primary Brand Color</Label>
              <div className="flex gap-2">
                <Input id={primaryColorId} type="color" defaultValue="#3b82f6" className="w-20" />
                <Input defaultValue="#3b82f6" className="flex-1" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor={logoUrlId}>Logo URL</Label>
              <Input id={logoUrlId} defaultValue="/logo.svg" />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button size="lg">
            <Save className="mr-2 h-5 w-5" />
            Save All Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
