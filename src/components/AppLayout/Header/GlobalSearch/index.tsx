import { Search } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useId, useRef, useState } from 'react'
import { DropdownMenuShortcut } from '@/components/ui/DropdownMenu'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/InputGroup'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { cn } from '@/lib/utils'
import type { SearchType } from '@/types/GlobalSearch'
import { SearchTypeFilters } from './GlobalSearchDropdown/SearchTypeFilters'
import { SearchTypeSelector } from './GlobalSearchDropdown/SearchTypeSelector'

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

  const handleSelectSearchType = (searchType: {
    id: SearchType
    label: string
    description: string
  }) => {
    setSelectedSearchTypeLabel(searchType.id as SearchType)
    setInputValue(searchType.label)
  }

  const handleClearSearchType = () => {
    setSelectedSearchTypeLabel(null)
    setInputValue('')
    setIsOpen(true)
  }

  const handleResultSelect = () => {
    setIsOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasSelectedSearchType) {
      setInputValue(e.target.value)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && hasSelectedSearchType) {
      e.preventDefault()
      handleClearSearchType()
    }
  }

  const hasSelectedSearchType = Boolean(selectedSearchTypeLabel)

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
              readOnly={hasSelectedSearchType}
              className={hasSelectedSearchType ? 'cursor-default' : ''}
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
          className="fixed top-[88px] right-0 left-0 mx-2 max-h-[calc(100vh-100px)] overflow-y-auto rounded-b-2xl bg-white px-5 py-5 shadow-xl md:absolute md:top-full md:right-auto md:left-0 md:mx-0 md:w-full md:max-w-[600px] dark:bg-zinc-950"
          role="listbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          hidden={!isOpen}
        >
          {!hasSelectedSearchType ? (
            <SearchTypeSelector
              searchQuery={inputValue}
              onSelectSearchType={handleSelectSearchType}
            />
          ) : (
            <SearchTypeFilters
              searchType={selectedSearchTypeLabel as SearchType}
              onResultSelect={handleResultSelect}
            />
          )}
        </motion.div>
      </search>
    </>
  )
}
