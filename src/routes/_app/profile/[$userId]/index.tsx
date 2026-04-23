import { createFileRoute } from '@tanstack/react-router'
import { ProfilePage } from '@/components/Pages/ProfilePage'

const PublicProfilePage = () => {
  const { userId } = Route.useParams()
  return <ProfilePage userId={Number(userId)} />
}

export const Route = createFileRoute('/_app/profile/$userId/')({
  staticData: { pageTitle: 'Profile' },
  head: () => ({
    meta: [{ title: 'Profile' }],
  }),
  component: PublicProfilePage,
})
