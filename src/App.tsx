import { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import {
  ChallengePage,
  Dashboard,
  SettingsPage,
  TaskPage,
  BrowseChallengesPage,
  LearnPage,
  DonatePage,
} from './pages';
import {
  AuthProvider,
  NotificationsProvider,
  PreferredChallengesProvider,
  QueryProvider,
  WebSocketProvider,
} from './context';
import { Header } from './layout/Header';

export const App = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <BrowserRouter>
        <QueryProvider>
          <PreferredChallengesProvider>
            <AuthProvider>
              <WebSocketProvider>
                <NotificationsProvider>
                  <Header />
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/browse/challenges" element={<BrowseChallengesPage />} />
                    <Route path="/challenges/:challengeId" element={<ChallengePage />} />
                    <Route path="/tasks/:taskId" element={<TaskPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/learn" element={<LearnPage />} />
                    <Route path="/donate" element={<DonatePage />} />
                  </Routes>
                </NotificationsProvider>
              </WebSocketProvider>
            </AuthProvider>
          </PreferredChallengesProvider>
        </QueryProvider>
      </BrowserRouter>
    </Suspense>
  );
};
