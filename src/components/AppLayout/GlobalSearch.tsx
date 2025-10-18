import { Search } from 'lucide-react'
import { motion } from 'motion/react'
import { type RefObject, useEffect, useId, useRef, useState } from 'react'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { cn } from '@/lib/utils'
import { DropdownMenuShortcut } from '@/components/ui/DropdownMenu'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/InputGroup'

export const GlobalSearch = ({
  className,
  placeholder = 'Search for challenges, tasks or projects...',
  ...props
}: React.ComponentProps<'search'> & {
  placeholder?: string
}) => {
  const id = useId()
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [inputValue, setInputValue] = useState<string>('')
  const [debouncedValue, setDebouncedValue] = useState<string>('')
  const [results, setResults] = useState<string | null>(null)

  // Ref for the search results dropdown
  const targetRef = useRef<HTMLDivElement>(null)

  // Ref for the search input element
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Function to handle clicks outside the targetRef element
  const handleClickOutside = () => {
    setIsOpen(false)
  }

  // Hook to detect clicks outside the targetRef element
  useOnClickOutside(targetRef as RefObject<HTMLElement>, handleClickOutside)

  // Effect to handle keyboard shortcut (Cmd+K or Ctrl+K) to focus the search input
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

  // Effect to handle debouncing the input value
  useEffect(() => {
    // Set a timeout to update the debouncedValue after a delay
    const handler = setTimeout(() => {
      setDebouncedValue(inputValue)
    }, 250) // 250ms delay

    // Cleanup function: Clear the timeout if inputValue changes before the delay
    return () => {
      clearTimeout(handler)
    }
  }, [inputValue]) // Re-run effect only when inputValue changes

  // Effect to perform search when debouncedValue changes
  useEffect(() => {
    if (debouncedValue) {
      // Open the search results dropdown
      setIsOpen(true)
      // Indicate loading state
      setIsLoading(true)
      // Perform search operation here with debouncedValue
      fetchSearchResults(debouncedValue)
        .then((results) => {
          // Update results state
          setResults(results as string)
        })
        .finally(() => {
          // Clear loading state
          setIsLoading(false)
        })
    } else {
      // Close the search results dropdown if input is cleared
      setIsOpen(false)
      // Clear results
      setResults(null)
    }
  }, [debouncedValue])

  // Mock function to simulate fetching search results
  async function fetchSearchResults(query: string) {
    // Simulate an API call
    return new Promise<string>((resolve) => {
      setTimeout(() => resolve(`Search results for ${query}`), 500)
    })
  }

  return (
    <search className={cn('relative', className)} {...props}>
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
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={(e) => {
              // Only open if there's already input
              if (e.target.value) {
                setIsOpen(true)
              }
            }}
            aria-expanded={!!debouncedValue}
            aria-haspopup="listbox"
            aria-controls={`${id}-results`}
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
        className="absolute inset-x-0 top-0 rounded-b-2xl bg-white px-5 pt-20 pb-5 shadow-xl dark:bg-zinc-950"
        role="listbox"
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        hidden={!isOpen}
        ref={targetRef}
      >
        <p className="font-mono text-xs tracking-wide">
          {results || (isLoading ? 'Loading...' : 'No results')}
        </p>
      </motion.div>
    </search>
  )
}
