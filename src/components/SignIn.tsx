import { UserLock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/Empty'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

export const SignIn = ({ className, ...props }: React.ComponentProps<typeof Empty>) => {
  const { login } = useAuth()
  return (
    <Empty className={cn('min-h-svh', className)} {...props}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <UserLock />
        </EmptyMedia>
        <EmptyTitle>Please sign in</EmptyTitle>
        <EmptyDescription>You need to be signed in to manage your account.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="lg" onClick={login}>
          Sign in
        </Button>
      </EmptyContent>
    </Empty>
  )
}
