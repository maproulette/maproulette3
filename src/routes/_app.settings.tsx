import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useAuth } from '../contexts';
import type { UserSettings } from '../types';
import { SelectField } from '../components/SelectField';

const EDITOR_OPTIONS = [
  { value: -1, label: 'None' },
  { value: 0, label: 'ID' },
  { value: 1, label: 'JOSM' },
  { value: 2, label: 'Potlatch 2' },
  { value: 3, label: 'Field Papers' },
  { value: 4, label: 'Custom' },
  { value: 5, label: 'Rapid' },
];

const BASEMAP_OPTIONS = [
  { value: 0, label: 'None' },
  { value: 1, label: 'OpenStreetMap' },
  { value: 2, label: 'Satellite' },
  { value: 3, label: 'Custom' },
];

const THEME_OPTIONS = [
  { value: 0, label: 'Light' },
  { value: 1, label: 'Dark' },
  { value: 2, label: 'System' },
];

const LOCALE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'pt', label: 'Português' },
  { value: 'ru', label: 'Русский' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
];

const REVIEW_LEVEL_OPTIONS = [
  { value: 0, label: 'None' },
  { value: 1, label: 'Basic' },
  { value: 2, label: 'Intermediate' },
  { value: 3, label: 'Advanced' },
];

export const Route = createFileRoute('/_app/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const { user, updateSettings } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState<UserSettings>({
    defaultEditor: user?.settings?.defaultEditor ?? -1,
    defaultBasemap: user?.settings?.defaultBasemap ?? 0,
    defaultBasemapId: user?.settings?.defaultBasemapId ?? '',
    locale: user?.settings?.locale ?? 'en',
    email: user?.settings?.email ?? '',
    emailOptIn: user?.settings?.emailOptIn ?? false,
    leaderboardOptOut: user?.settings?.leaderboardOptOut ?? false,
    needsReview: user?.settings?.needsReview ?? 0,
    isReviewer: user?.settings?.isReviewer ?? false,
    allowFollowing: user?.settings?.allowFollowing ?? true,
    theme: user?.settings?.theme ?? 0,
    seeTagFixSuggestions: user?.settings?.seeTagFixSuggestions ?? true,
    disableTaskConfirm: user?.settings?.disableTaskConfirm ?? false,
  });

  const handleInputChange = (field: keyof UserSettings, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsLoading(true);
    setMessage(null);

    try {
      await updateSettings(formData);
      setMessage({ type: 'success', text: 'Settings updated successfully!' });
    } catch (error) {
      console.error('Failed to update settings:', error);
      setMessage({ type: 'error', text: 'Failed to update settings. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
          <p className="text-gray-600">Please log in to view and edit your settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">User Settings</h1>
            <p className="mt-1 text-sm text-gray-600">
              Customize your MapRoulette experience and preferences
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-8">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Editor Preferences</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SelectField
                  name="defaultEditor"
                  value={formData.defaultEditor}
                  onChange={(value) =>
                    handleInputChange(
                      'defaultEditor',
                      typeof value === 'string' ? parseInt(value) : value
                    )
                  }
                  options={EDITOR_OPTIONS}
                  label="Default Editor"
                  description="Choose your preferred editor for mapping tasks"
                />

                <SelectField
                  name="defaultBasemap"
                  value={formData.defaultBasemap}
                  onChange={(value) =>
                    handleInputChange(
                      'defaultBasemap',
                      typeof value === 'string' ? parseInt(value) : value
                    )
                  }
                  options={BASEMAP_OPTIONS}
                  label="Default Basemap"
                  description="Select the default map background for your tasks"
                />

                {formData.defaultBasemap === 3 && (
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="defaultBasemapId"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Custom Basemap URL
                    </label>
                    <input
                      type="text"
                      id="defaultBasemapId"
                      value={formData.defaultBasemapId}
                      onChange={(e) => handleInputChange('defaultBasemapId', e.target.value)}
                      placeholder="https://example.com/tiles/{z}/{x}/{y}.png"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Settings</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <SelectField
                  name="locale"
                  value={formData.locale}
                  onChange={(value) => handleInputChange('locale', String(value))}
                  options={LOCALE_OPTIONS}
                  label="Language"
                  description="Choose your preferred language for the interface"
                />

                <SelectField
                  name="theme"
                  value={formData.theme}
                  onChange={(value) =>
                    handleInputChange('theme', typeof value === 'string' ? parseInt(value) : value)
                  }
                  options={THEME_OPTIONS}
                  label="Theme"
                  description="Choose your preferred visual theme for the interface"
                />

                <SelectField
                  name="needsReview"
                  value={formData.needsReview}
                  onChange={(value) =>
                    handleInputChange(
                      'needsReview',
                      typeof value === 'string' ? parseInt(value) : value
                    )
                  }
                  options={REVIEW_LEVEL_OPTIONS}
                  label="Review Level"
                  description="Set your preferred review level for mapping tasks"
                />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Privacy & Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="emailOptIn"
                    checked={formData.emailOptIn}
                    onChange={(e) => handleInputChange('emailOptIn', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="emailOptIn" className="ml-2 block text-sm text-gray-900">
                    Receive email notifications
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="leaderboardOptOut"
                    checked={formData.leaderboardOptOut}
                    onChange={(e) => handleInputChange('leaderboardOptOut', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="leaderboardOptOut" className="ml-2 block text-sm text-gray-900">
                    Opt out of leaderboards
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isReviewer"
                    checked={formData.isReviewer}
                    onChange={(e) => handleInputChange('isReviewer', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isReviewer" className="ml-2 block text-sm text-gray-900">
                    Enable reviewer mode
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowFollowing"
                    checked={formData.allowFollowing}
                    onChange={(e) => handleInputChange('allowFollowing', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="allowFollowing" className="ml-2 block text-sm text-gray-900">
                    Allow other users to follow me
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="seeTagFixSuggestions"
                    checked={formData.seeTagFixSuggestions}
                    onChange={(e) => handleInputChange('seeTagFixSuggestions', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="seeTagFixSuggestions"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Show tag fix suggestions
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="disableTaskConfirm"
                    checked={formData.disableTaskConfirm}
                    onChange={(e) => handleInputChange('disableTaskConfirm', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="disableTaskConfirm" className="ml-2 block text-sm text-gray-900">
                    Disable task completion confirmation
                  </label>
                </div>
              </div>
            </div>

            {message && (
              <div
                className={`p-4 rounded-md ${
                  message.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Updating...' : 'Update Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
