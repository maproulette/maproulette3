import { Search } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { DropdownMenuShortcut } from '@/components/ui/DropdownMenu'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/InputGroup'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { cn } from '@/lib/utils'
import type { SearchType } from '@/types/GlobalSearch'
import { UnifiedSearchList } from './GlobalSearchDropdown/UnifiedSearchList'
import { SearchTypeFilters } from './GlobalSearchDropdown/SearchTypeFilters'
import { parseSearchInput, SEARCH_TYPE_PREFIXES } from './shared/searchTypes'

export const GlobalSearch = ({
  className,
  placeholder = 'Search for challenges, tasks or projects...',
  ...props
}: React.ComponentProps<'search'> & {
  placeholder?: string
}) => {
  const id = useId()
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [selectedSearchTypeLabel, setSelectedSearchTypeLabel] = useState<SearchType | null>(null)
  const [inputValue, setInputValue] = useState<string>('')

  const searchInputRef = useRef<HTMLInputElement>(null)

  const searchContainerRef = useRef<HTMLElement>(null) as React.RefObject<HTMLElement>

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        if (searchInputRef.current) {
          searchInputRef.current.focus()
        }
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useOnClickOutside(searchContainerRef, (event) => {
    const target = event.target as HTMLElement
    const isSelectPortal = target.closest('[data-radix-popper-content-wrapper]')

    if (!isSelectPortal) {
      setIsOpen(false)
    }
  })

  // Parse the input to get the search type and query
  const { searchType: parsedSearchType, query: searchQuery } = useMemo(
    () => parseSearchInput(inputValue),
    [inputValue]
  )
  const activeSearchType = selectedSearchTypeLabel || parsedSearchType
  const hasSelectedSearchType = Boolean(activeSearchType)

  const handleSelectSearchType = (searchType: {
    id: SearchType
    label: string
    description: string
    prefix: string
  }) => {
    setSelectedSearchTypeLabel(searchType.id as SearchType)
    setInputValue(searchType.prefix)
    // Focus the input and move cursor to end
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus()
        searchInputRef.current.setSelectionRange(searchType.prefix.length, searchType.prefix.length)
      }
    }, 0)
  }

  const handleClearSearchType = () => {
    setSelectedSearchTypeLabel(null)
    setInputValue('')
    setIsOpen(true)
  }

  const handleResultSelect = () => {
    setIsOpen(false)
    setInputValue('')
    setSelectedSearchTypeLabel(null)
    // Deselect/blur the input
    if (searchInputRef.current) {
      searchInputRef.current.blur()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    // Check if user deleted the prefix, clear search type
    if (selectedSearchTypeLabel) {
      const prefix = SEARCH_TYPE_PREFIXES[selectedSearchTypeLabel]
      if (!newValue.startsWith(prefix)) {
        setSelectedSearchTypeLabel(null)
      }
    } else {
      // Check if user typed a prefix, set the search type
      const parsed = parseSearchInput(newValue)
      if (parsed.searchType && parsed.searchType !== selectedSearchTypeLabel) {
        setSelectedSearchTypeLabel(parsed.searchType)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (activeSearchType && searchInputRef.current) {
      const prefix = SEARCH_TYPE_PREFIXES[activeSearchType]
      const cursorPos = searchInputRef.current.selectionStart || 0
      
      // Prevent deleting the prefix
      if (e.key === 'Backspace' && cursorPos <= prefix.length) {
        e.preventDefault()
        handleClearSearchType()
      }
    }
  }

  return (
    <>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={() => setIsOpen(false)}
        />
      )}
      <search ref={searchContainerRef} className={cn('relative z-10', className)} {...props}>
        <div className="relative z-10">
          <InputGroup className="rounded-full py-5">
            <label htmlFor={id} className="sr-only">
              {placeholder}
            </label>
            <InputGroupInput
              ref={searchInputRef}
              id={id}
              type="search"
              placeholder={placeholder}
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => {
                setIsOpen(true)
              }}
              onKeyDown={handleKeyDown}
              readOnly={false}
              aria-haspopup="listbox"
              aria-controls={`${id}-results`}
              autoComplete="off"
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">
              <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
            </InputGroupAddon>
          </InputGroup>
        </div>
        <motion.div
          id={`${id}-results`}
          className="fixed top-[88px] right-0 left-0 mx-2 max-h-[calc(100vh-100px)] overflow-y-auto rounded-b-xl bg-white px-3 py-3 shadow-xl md:absolute md:top-full md:right-auto md:left-0 md:mx-0 md:w-full md:max-w-[600px] dark:bg-zinc-950"
          role="listbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          hidden={!isOpen}
        >
          {!hasSelectedSearchType ? (
            <UnifiedSearchList
              searchQuery={inputValue}
              onResultSelect={handleResultSelect}
              onSelectSearchType={handleSelectSearchType}
            />
          ) : (
            <SearchTypeFilters
              searchType={activeSearchType as SearchType}
              searchQuery={searchQuery}
              onResultSelect={handleResultSelect}
            />
          )}
        </motion.div>
      </search>
    </>
  )
}
