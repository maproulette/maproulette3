import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Header } from './Header';
import { AuthContext } from '../context/AuthContext';
import type { User } from '../types';

// Mock user data with all required properties
const mockUser: User = {
  id: 1,
  achievements: [],
  apiKey: 'mock-api-key',
  created: new Date('2024-01-01'),
  modified: new Date('2024-01-01'),
  grants: [],
  guest: false,
  osmProfile: {
    id: 12345,
    displayName: 'John Doe',
    description: 'Mock user description',
    avatarURL: '',
    homeLocation: {
      latitude: 0,
      longitude: 0
    },
    created: new Date('2024-01-01'),
    requestToken: 'mock-token'
  },
  properties: {
    mr3Frontend: {
      meta: {
        revision: 1
      },
      settings: {
        isEditMode: false,
        tallied: {},
        taskBundleFilters: '',
        workspaces: {
          projects: {},
          challenge: {},
          taskCompletion: {},
          userDashboard: {},
          project: {},
          globalActivity: {},
          reviewOverview: {},
          taskReview: {}
        }
      }
    },
    score: 100
  },
  settings: {
    defaultEditor: 1,
    defaultBasemap: 1,
    defaultBasemapId: 'default',
    locale: 'en',
    email: 'john@example.com',
    emailOptIn: false,
    leaderboardOptOut: false,
    needsReview: 0,
    isReviewer: false,
    allowFollowing: true,
    theme: 1,
    seeTagFixSuggestions: true,
    disableTaskConfirm: false
  },
  score: 100
};

// Mock authentication context
const MockAuthProvider = ({ children, isAuthenticated = false, user = null }: {
  children: React.ReactNode;
  isAuthenticated?: boolean;
  user?: User | null;
}) => (
  <AuthContext.Provider value={{
    isAuthenticated,
    user,
    login: fn(),
    logout: fn(),
    updateSettings: fn()
  }}>
    {children}
  </AuthContext.Provider>
);

const meta = {
  title: 'Components/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'The main header component for MapRoulette 4, featuring authentication status and user information. Uses Headless UI components for accessibility and smooth interactions.'
      }
    }
  },
  decorators: [
    (Story, context) => {
      const { isAuthenticated, user } = context.args as { isAuthenticated?: boolean; user?: User | null };
      return (
        <MockAuthProvider 
          isAuthenticated={isAuthenticated} 
          user={user}
        >
          <Story />
        </MockAuthProvider>
      );
    }
  ],
  argTypes: {
    isAuthenticated: {
      control: 'boolean',
      description: 'Whether the user is currently authenticated'
    },
    user: {
      control: 'object',
      description: 'User object with profile information'
    }
  }
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedOut: Story = {
  args: {
    isAuthenticated: false,
    user: null
  },
  parameters: {
    docs: {
      description: {
        story: 'Header when no user is logged in, showing the sign in button.'
      }
    }
  }
};

export const LoggedIn: Story = {
  args: {
    isAuthenticated: true,
    user: mockUser
  },
  parameters: {
    docs: {
      description: {
        story: 'Header when a user is logged in, showing user profile with dropdown menu containing Profile, Settings, and Sign out options.'
      }
    }
  }
};

export const LoggedInNoDisplayName: Story = {
  args: {
    isAuthenticated: true,
    user: {
      ...mockUser,
      osmProfile: {
        ...mockUser.osmProfile,
        displayName: ''
      }
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Header when a user is logged in but has no display name, showing fallback "User" text in the dropdown.'
      }
    }
  }
};

export const LongDisplayName: Story = {
  args: {
    isAuthenticated: true,
    user: {
      ...mockUser,
      osmProfile: {
        ...mockUser.osmProfile,
        displayName: 'Very Long User Display Name That Might Overflow'
      }
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Header with a very long display name to test text overflow handling.'
      }
    }
  }
};
