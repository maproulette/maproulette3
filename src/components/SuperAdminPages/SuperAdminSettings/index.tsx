import { Settings, Save, Globe, Mail, Database, Shield, Bell, Palette } from 'lucide-react'
import { SuperAdminGuard } from '@/components/shared/SuperAdminGuard'
import { BackLink } from '@/components/shared/BackLink'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Switch } from '@/components/ui/Switch'
import { Textarea } from '@/components/ui/Textarea'

export const SuperAdminSettings = () => {
  return (
    <SuperAdminGuard>
      <div className="container mx-auto px-4">
        <BackLink to="/super-admin">Back to Super Admin</BackLink>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <Settings className="h-8 w-8 text-zinc-600 dark:text-zinc-400" />
            <h1 className="font-bold text-3xl text-zinc-900 dark:text-zinc-50">
              Platform Settings
            </h1>
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
                <Label htmlFor="siteName">Site Name</Label>
                <Input id="siteName" defaultValue="MapRoulette" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  defaultValue="A platform for collaborative mapping and data validation"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="siteUrl">Site URL</Label>
                <Input id="siteUrl" defaultValue="https://maproulette.org" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenance">Maintenance Mode</Label>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Enable maintenance mode to prevent user access
                  </p>
                </div>
                <Switch id="maintenance" />
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
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input id="smtpHost" defaultValue="smtp.example.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input id="smtpPort" type="number" defaultValue="587" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fromEmail">From Email Address</Label>
                <Input id="fromEmail" type="email" defaultValue="noreply@maproulette.org" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailEnabled">Enable Email Notifications</Label>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Send email notifications to users
                  </p>
                </div>
                <Switch id="emailEnabled" defaultChecked />
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
                  <Label htmlFor="requireVerification">Require Email Verification</Label>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Users must verify their email before accessing the platform
                  </p>
                </div>
                <Switch id="requireVerification" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="twoFactor">Enable Two-Factor Authentication</Label>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Allow users to enable 2FA for their accounts
                  </p>
                </div>
                <Switch id="twoFactor" defaultChecked />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input id="sessionTimeout" type="number" defaultValue="60" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="passwordPolicy">Strict Password Policy</Label>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Require strong passwords (min 12 chars, special chars)
                  </p>
                </div>
                <Switch id="passwordPolicy" defaultChecked />
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
                <Label htmlFor="dbHost">Database Host</Label>
                <Input id="dbHost" defaultValue="localhost" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dbPort">Database Port</Label>
                <Input id="dbPort" type="number" defaultValue="5432" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoBackup">Automatic Backups</Label>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Enable daily automatic database backups
                  </p>
                </div>
                <Switch id="autoBackup" defaultChecked />
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  Run Maintenance
                </Button>
                <Button variant="outline">
                  Create Backup
                </Button>
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
                  <Label htmlFor="notifyNewUser">New User Notifications</Label>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Notify admins when new users sign up
                  </p>
                </div>
                <Switch id="notifyNewUser" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifyNewProject">New Project Notifications</Label>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Notify admins when new projects are created
                  </p>
                </div>
                <Switch id="notifyNewProject" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifyErrors">Error Notifications</Label>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Notify admins when system errors occur
                  </p>
                </div>
                <Switch id="notifyErrors" defaultChecked />
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
                  <Label htmlFor="darkMode">Default to Dark Mode</Label>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Set dark mode as the default theme for new users
                  </p>
                </div>
                <Switch id="darkMode" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="primaryColor">Primary Brand Color</Label>
                <div className="flex gap-2">
                  <Input id="primaryColor" type="color" defaultValue="#3b82f6" className="w-20" />
                  <Input defaultValue="#3b82f6" className="flex-1" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input id="logoUrl" defaultValue="/logo.svg" />
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
    </SuperAdminGuard>
  )
}

