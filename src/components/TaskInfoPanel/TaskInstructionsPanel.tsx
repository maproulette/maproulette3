import { BookOpen, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useChallengeContext } from '@/components/Pages/TaskEditPage/contexts/ChallengeContext'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/Collapsible'
import { cn } from '@/lib/utils'

export const TaskInstructionsPanel = () => {
  const [isOpen, setIsOpen] = useState(true)
  const { challenge } = useChallengeContext()

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-blue-600">
                <BookOpen className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                Instructions
              </span>
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-zinc-500 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
            />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pt-0 pb-4">
            {challenge?.instruction ? (
              <div className="markdown-content text-sm text-zinc-700 leading-relaxed dark:text-zinc-300 [&_blockquote]:my-4 [&_blockquote]:border-zinc-300 [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:dark:border-zinc-600 [&_code]:rounded [&_code]:bg-zinc-200 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:dark:bg-zinc-800 [&_em]:italic [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:font-bold [&_h1]:text-xl [&_h1]:text-zinc-900 [&_h1]:dark:text-zinc-50 [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:font-bold [&_h2]:text-lg [&_h2]:text-zinc-900 [&_h2]:dark:text-zinc-50 [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:font-semibold [&_h3]:text-base [&_h3]:text-zinc-900 [&_h3]:dark:text-zinc-50 [&_hr]:my-4 [&_hr]:border-zinc-300 [&_hr]:dark:border-zinc-600 [&_li]:my-1 [&_ol]:my-3 [&_ol]:ml-5 [&_ol]:list-decimal [&_p]:my-3 [&_p]:text-zinc-700 [&_p]:first:mt-0 [&_p]:dark:text-zinc-300 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-zinc-200 [&_pre]:p-3 [&_pre]:dark:bg-zinc-800 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_strong]:font-semibold [&_strong]:text-zinc-900 [&_strong]:dark:text-zinc-50 [&_ul]:my-3 [&_ul]:ml-5 [&_ul]:list-disc">
                <ReactMarkdown
                  components={{
                    a: (props) => (
                      <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      />
                    ),
                  }}
                >
                  {challenge.instruction}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm text-zinc-500 italic dark:text-zinc-400">
                No instructions available for this challenge.
              </p>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
