import ReactMarkdown from 'react-markdown'
import { ScrollArea } from '@/components/ui/ScrollArea'

interface ChallengeDescriptionProps {
  description?: string | null
  blurb?: string | null
}

export const ChallengeDescription = ({ description, blurb }: ChallengeDescriptionProps) => {
  return (
    <div className="mb-6 flex flex-col gap-3">
      <ScrollArea className="max-h-96">
        <div className="markdown-content text-sm text-zinc-700 leading-relaxed dark:text-zinc-300 [&_blockquote]:my-2 [&_blockquote]:border-zinc-300 [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:dark:border-zinc-600 [&_code]:rounded [&_code]:bg-zinc-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:dark:bg-zinc-800 [&_em]:italic [&_h1]:mt-4 [&_h1]:mb-3 [&_h1]:font-semibold [&_h1]:text-xl [&_h1]:text-zinc-900 [&_h1]:dark:text-zinc-50 [&_h2]:mt-3 [&_h2]:mb-2 [&_h2]:font-semibold [&_h2]:text-lg [&_h2]:text-zinc-900 [&_h2]:dark:text-zinc-50 [&_h3]:mt-3 [&_h3]:mb-2 [&_h3]:font-semibold [&_h3]:text-base [&_h3]:text-zinc-900 [&_h3]:dark:text-zinc-50 [&_h4]:mt-2 [&_h4]:mb-1 [&_h4]:font-semibold [&_h4]:text-sm [&_h4]:text-zinc-900 [&_h4]:dark:text-zinc-50 [&_hr]:my-4 [&_hr]:border-zinc-300 [&_hr]:dark:border-zinc-600 [&_li]:my-1 [&_ol]:my-2 [&_ol]:ml-6 [&_ol]:list-decimal [&_p]:my-2 [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-zinc-100 [&_pre]:p-3 [&_pre]:dark:bg-zinc-800 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_strong]:font-semibold [&_strong]:text-zinc-900 [&_strong]:dark:text-zinc-50 [&_ul]:my-2 [&_ul]:ml-6 [&_ul]:list-disc">
          {description && (
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
              {description}
            </ReactMarkdown>
          )}
          {blurb && <div className="mt-3 text-zinc-600 italic dark:text-zinc-400">{blurb}</div>}
        </div>
      </ScrollArea>
    </div>
  )
}
