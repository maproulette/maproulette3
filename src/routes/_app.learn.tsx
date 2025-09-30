import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/learn')({
  component: LearnPage,
});

function LearnPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Learn</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600">
              Learn about MapRoulette and how to contribute to mapping projects.
            </p>
            <p className="text-gray-500 mt-4">This page is coming soon!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
