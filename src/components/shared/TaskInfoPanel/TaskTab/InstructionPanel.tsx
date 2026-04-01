import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/utils/utils'

const markdownClasses =
  'text-sm text-zinc-700 leading-relaxed dark:text-zinc-300 [&_a]:text-blue-600 [&_a]:hover:underline [&_a]:dark:text-blue-400 [&_blockquote]:my-2 [&_blockquote]:border-zinc-300 [&_blockquote]:border-l-2 [&_blockquote]:pl-2 [&_blockquote]:italic [&_blockquote]:dark:border-zinc-600 [&_code]:rounded [&_code]:bg-zinc-200 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:dark:bg-zinc-800 [&_li]:my-0.5 [&_ol]:my-1 [&_ol]:ml-4 [&_ol]:list-decimal [&_p]:my-1 [&_p]:first:mt-0 [&_ul]:my-1 [&_ul]:ml-4 [&_ul]:list-disc'

type InstructionView = 'task' | 'challenge'

/** Convert bare URLs in text to markdown links so ReactMarkdown renders them */
const autoLinkUrls = (text: string): string =>
  text.replace(/(?<!\]\()(?<!\()(https?:\/\/[^\s)<>]+)/g, (url) => `[${url}](${url})`)

const InstructionContent = ({ content }: { content: string }) => (
  <div className={markdownClasses}>
    <ReactMarkdown
      components={{
        a: ({ node, ...props }) => (
          <a
            {...props}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline dark:text-blue-400"
          />
        ),
      }}
    >
      {autoLinkUrls(content)}
    </ReactMarkdown>
  </div>
)

interface InstructionPanelProps {
  taskInstruction?: string
  challengeDescription?: string
}

export const InstructionPanel = ({
  taskInstruction,
  challengeDescription,
}: InstructionPanelProps) => {
  const hasTaskInstruction = !!taskInstruction
  const hasChallengeInstruction = !!challengeDescription
  const [instructionView, setInstructionView] = useState<InstructionView>('task')

  if (!hasTaskInstruction && !hasChallengeInstruction) return null

  return (
    <div>
      <div className="mb-3 flex rounded-lg bg-zinc-100 p-0.5 dark:bg-zinc-800">
        <button
          type="button"
          onClick={() => setInstructionView('task')}
          className={cn(
            'flex-1 rounded-md px-3 py-1.5 font-medium text-xs transition-colors',
            instructionView === 'task'
              ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100'
              : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
          )}
        >
          Task
        </button>
        <button
          type="button"
          onClick={() => setInstructionView('challenge')}
          className={cn(
            'flex-1 rounded-md px-3 py-1.5 font-medium text-xs transition-colors',
            instructionView === 'challenge'
              ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100'
              : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
          )}
        >
          Challenge
        </button>
      </div>

      {instructionView === 'task' ? (
        hasTaskInstruction ? (
          <InstructionContent content={taskInstruction} />
        ) : (
          <p className="text-sm text-zinc-500 italic dark:text-zinc-400">
            No task instructions available.
          </p>
        )
      ) : hasChallengeInstruction ? (
        <InstructionContent content={challengeDescription ?? ''} />
      ) : (
        <p className="text-sm text-zinc-500 italic dark:text-zinc-400">
          No challenge description available.
        </p>
      )}
    </div>
  )
}
