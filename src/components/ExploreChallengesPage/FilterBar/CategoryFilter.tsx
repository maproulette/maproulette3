import { ChevronDown, X } from 'lucide-react'
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
          <Button
            variant="outline"
            className="h-9 w-36 justify-between px-3 text-sm font-normal"
          >
            <span>{selectedCategories.length === 0 ? 'All' : `${selectedCategories.length} selected`}</span>
            <ChevronDown className="size-4 opacity-50" />
          </Button>
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
