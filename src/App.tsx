import { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  AuthProvider,
  QueryProvider,
  PreferredChallengesProvider,
} from "./context";
import { Header, Dashboard } from "./components";
import { TaskPage } from "./pages";

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
              <Header />
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/tasks/:taskId" element={<TaskPage />} />
              </Routes>
            </AuthProvider>
          </PreferredChallengesProvider>
        </QueryProvider>
      </BrowserRouter>
    </Suspense>
  );
};
