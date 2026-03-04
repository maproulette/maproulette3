import { X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/api'
import { useExploreChallengesSearchContext } from '@/components/ExploreChallengesPage/ExploreChallengesSearchContext'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useAuthContext } from '@/contexts/AuthContext'
import { parseUserProperties } from './filterUtils'

export const CategoryFilter = () => {
  const { selectedCategories, setSelectedCategories } = useExploreChallengesSearchContext()
  const { user } = useAuthContext()
  const [newCategoryInput, setNewCategoryInput] = useState('')

  const updateSettingsMutation = api.user.useUpdateUserSettings()

  const availableCategories = useMemo(() => {
    const properties = parseUserProperties(user)
    return properties?.mr4?.settings?.categorizationKeys || []
  }, [user])

  const handleAddCategory = async () => {
    if (!user?.id) {
      toast.error('Please sign in to add custom categories')
      return
    }

    const newCategory = newCategoryInput.trim()

    if (newCategory === '' || availableCategories.length >= 6) {
      if (availableCategories.length >= 6) {
        toast.error('Maximum of 6 categories allowed. Please delete one to add a new category.')
      }
      return
    }

    if (availableCategories.includes(newCategory)) {
      toast.info('Category already exists')
      return
    }

    setSelectedCategories([...selectedCategories, newCategory])
    setNewCategoryInput('')

    try {
      const existingProperties = parseUserProperties(user)

      const updatedProperties = {
        ...existingProperties,
        mr4: {
          ...(existingProperties.mr4 || {}),
          settings: {
            ...(existingProperties.mr4?.settings || {}),
            categorizationKeys: [...availableCategories, newCategory],
          },
        },
      }

      updateSettingsMutation.mutate(
        { userId: user.id, settings: user.settings, properties: updatedProperties },
        {
          onSuccess: () => {
            toast.success(`Category "${newCategory}" added to your settings`)
          },
        }
      )
    } catch (error) {
      console.error('Failed to save category:', error)
      toast.error('Failed to save category to settings')
    }
  }

  const handleRemoveKeyword = async (keyword: string) => {
    if (!user?.id) {
      return
    }

    if (selectedCategories.includes(keyword)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== keyword))
    }

    try {
      const existingProperties = parseUserProperties(user)

      const updatedCategorizationKeys = availableCategories.filter((cat: string) => cat !== keyword)

      const updatedProperties = {
        ...existingProperties,
        mr4: {
          ...(existingProperties.mr4 || {}),
          settings: {
            ...(existingProperties.mr4?.settings || {}),
            categorizationKeys: updatedCategorizationKeys,
          },
        },
      }

      updateSettingsMutation.mutate(
        { userId: user.id, settings: user.settings, properties: updatedProperties },
        {
          onSuccess: () => {
            toast.success(`Category "${keyword}" removed from your settings`)
          },
        }
      )
    } catch (error) {
      console.error('Failed to remove category:', error)
      toast.error('Failed to remove category from settings')
    }
  }

  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category))
    } else {
      setSelectedCategories([...selectedCategories, category])
    }
  }

  const handleClearAllFilters = () => {
    setSelectedCategories([])
  }

  return (
    <div className="flex items-center gap-2">
      <Label className="font-medium text-sm text-zinc-700 dark:text-zinc-300">Category</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex h-9 w-36 items-center justify-between gap-2 whitespace-nowrap rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-2 text-sm shadow-xs outline-none dark:border-[rgba(30,41,59,1)] dark:bg-[rgba(15,23,42,1)] dark:text-zinc-50"
          >
            <span>{selectedCategories.length === 0 ? 'All' : `${selectedCategories.length} selected`}</span>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="size-4 opacity-50"><path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-64"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DropdownMenuCheckboxItem
            checked={selectedCategories.length === 0}
            onCheckedChange={handleClearAllFilters}
            onSelect={(e) => e.preventDefault()}
          >
            Anything
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          {availableCategories.map((category: string) => (
            <div key={category} className="flex items-center">
              <DropdownMenuCheckboxItem
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => handleCategoryToggle(category)}
                onSelect={(e) => e.preventDefault()}
                className="flex-1"
              >
                {category}
              </DropdownMenuCheckboxItem>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleRemoveKeyword(category)
                }}
                className="mr-2 h-6 w-6 text-zinc-400 hover:text-red-500"
                title="Remove category"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <DropdownMenuSeparator />
          <div className="p-2">
            {!user ? (
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                Sign in to add custom categories
              </div>
            ) : availableCategories.length === 0 ? (
              <div className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
                Set up your categories below
              </div>
            ) : null}
            <Label className="text-xs text-zinc-600 dark:text-zinc-400">
              {availableCategories.length >= 6 ? 'Max categories (6)' : 'Add custom:'}
            </Label>
            <div className="mt-1.5">
              <Input
                placeholder={
                  availableCategories.length >= 6
                    ? 'Delete one to add more'
                    : 'Type and press Enter'
                }
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddCategory()
                  }
                }}
                className="h-8 text-xs"
                disabled={availableCategories.length >= 6 || !user}
              />
            </div>
            {availableCategories.length >= 6 && (
              <div className="mt-1 text-amber-600 text-xs dark:text-amber-400">
                Delete a category above to add a new one
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
