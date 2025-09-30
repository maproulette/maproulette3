import { createFileRoute } from '@tanstack/react-router';
import { ChallengesProvider, useChallenges } from '../contexts';
import {
  FunnelIcon,
  MapPinIcon,
  GlobeAltIcon,
  BookmarkIcon,
  ChevronUpDownIcon,
} from '@heroicons/react/24/outline';
import { Listbox, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { Challenge } from '../types';

const sortOptions = [
  { name: 'Default', value: 'default' },
  { name: 'Popularity', value: 'popularity' },
  { name: 'Created', value: 'created' },
  { name: 'Modified', value: 'modified' },
  { name: 'Name', value: 'name' },
];

const difficultyLabels = {
  1: 'Easy',
  2: 'Normal',
  3: 'Hard',
  4: 'Expert',
};

interface ChallengeCardProps {
  challenge: Challenge;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge }) => {
  const navigate = useNavigate();
  const difficulty =
    difficultyLabels[challenge.difficulty as keyof typeof difficultyLabels] || 'Normal';
  const progressPercentage = Math.round(challenge.completionPercentage || 0);

  const handleChallengeClick = () => {
    navigate({ to: `/challenges/${challenge.id}` });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Popular Label */}
          {challenge.featured && (
            <div className="inline-block mb-2">
              <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded">
                POPULAR
              </span>
            </div>
          )}

          {/* Title */}
          <button type="button" onClick={handleChallengeClick} className="text-left w-full">
            <h3
              className="text-lg font-semibold text-gray-900 mb-2 overflow-hidden hover:text-blue-600 transition-colors"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {challenge.name}
            </h3>
          </button>

          {/* Project/Source */}
          <div className="mb-3">
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-800 underline bg-transparent border-none p-0 cursor-pointer"
            >
              {challenge.tags?.[0] || 'MapRoulette Project'}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right side - Difficulty and Bookmark */}
        <div className="flex flex-col items-end gap-3 ml-4">
          <button type="button" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <BookmarkIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>
          <div className="text-sm text-gray-600">
            Difficulty: <span className="font-medium">{difficulty}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

function BrowseChallengesPageInternal() {
  const { extendedFindChallenges } = useChallenges();
  const [showOnMap, setShowOnMap] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [showGlobal, setShowGlobal] = useState(true);
  const [selectedSort, setSelectedSort] = useState(sortOptions[0]);

  const challenges = extendedFindChallenges || [];

  return (
    <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Challenges</h1>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FunnelIcon className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Navigation and Options */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              {/* Show on Map / Anywhere Toggle */}
              <div className="flex bg-white rounded-lg border border-gray-300 p-1">
                <button
                  type="button"
                  onClick={() => setShowOnMap(true)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    showOnMap ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <MapPinIcon className="w-4 h-4" />
                  Show on Map
                </button>
                <button
                  type="button"
                  onClick={() => setShowOnMap(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    !showOnMap ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <GlobeAltIcon className="w-4 h-4" />
                  Anywhere
                </button>
              </div>

              {/* Checkboxes */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={showArchived}
                    onChange={(e) => setShowArchived(e.target.checked)}
                    className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                  />
                  Archived
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={showGlobal}
                    onChange={(e) => setShowGlobal(e.target.checked)}
                    className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                  />
                  Global Challenges
                </label>
              </div>
            </div>

            {/* Results count and Sort */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{challenges.length} results</span>

              <Listbox value={selectedSort} onChange={setSelectedSort}>
                <div className="relative">
                  <Listbox.Button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                    <span className="text-sm">{selectedSort.name}</span>
                    <ChevronUpDownIcon className="w-4 h-4" />
                  </Listbox.Button>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute right-0 mt-1 w-40 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                      {sortOptions.map((option) => (
                        <Listbox.Option
                          key={option.value}
                          value={option}
                          className={({ active }) =>
                            `relative cursor-pointer select-none py-2 px-3 text-sm ${
                              active ? 'bg-gray-100' : 'text-gray-900'
                            }`
                          }
                        >
                          {option.name}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>
          </div>
        </div>

        {/* Challenges List */}
        <div className="space-y-4">
          {challenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/_app/browse/challenges')({
  component: () => (
    <ChallengesProvider>
      <BrowseChallengesPageInternal />
    </ChallengesProvider>
  ),
});
