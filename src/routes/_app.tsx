import { createFileRoute, Outlet } from '@tanstack/react-router';
import {
  AuthProvider,
  NotificationsProvider,
  PreferredChallengesProvider,
  WebSocketProvider,
} from '../contexts';
import Header from '../components/Header.tsx';

export const Route = createFileRoute('/_app')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PreferredChallengesProvider>
      <AuthProvider>
        <WebSocketProvider>
          <NotificationsProvider>
            <Header />
            <Outlet />
          </NotificationsProvider>
        </WebSocketProvider>
      </AuthProvider>
    </PreferredChallengesProvider>
  );
}
