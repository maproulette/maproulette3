import type { Meta, StoryObj } from '@storybook/react-vite';
import { Loader } from './Loader';

const meta = {
  title: 'Components/Loader',
  component: Loader,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'A loading spinner component that displays an animated spinner with a customizable message. Built with accessibility in mind and consistent styling for the MapRoulette 4 application.'
      }
    }
  },
  argTypes: {
    message: {
      control: 'text',
      description: 'The loading message to display below the spinner'
    }
  }
} satisfies Meta<typeof Loader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: 'Loading...'
  },
  parameters: {
    docs: {
      description: {
        story: 'Default loader with a simple loading message.'
      }
    }
  }
};

export const DataLoading: Story = {
  args: {
    message: 'Loading your data...'
  },
  parameters: {
    docs: {
      description: {
        story: 'Loader for data fetching operations.'
      }
    }
  }
};

export const SavingData: Story = {
  args: {
    message: 'Saving your changes...'
  },
  parameters: {
    docs: {
      description: {
        story: 'Loader for save operations with user feedback.'
      }
    }
  }
};

export const Uploading: Story = {
  args: {
    message: 'Uploading files...'
  },
  parameters: {
    docs: {
      description: {
        story: 'Loader for file upload operations.'
      }
    }
  }
};

export const Processing: Story = {
  args: {
    message: 'Processing your request...'
  },
  parameters: {
    docs: {
      description: {
        story: 'Loader for processing operations that may take time.'
      }
    }
  }
};

export const LongMessage: Story = {
  args: {
    message: 'This is a very long loading message that demonstrates how the component handles extended text content while maintaining good readability and layout.'
  },
  parameters: {
    docs: {
      description: {
        story: 'Loader with a long message to test text wrapping and layout.'
      }
    }
  }
};

export const ShortMessage: Story = {
  args: {
    message: 'Loading'
  },
  parameters: {
    docs: {
      description: {
        story: 'Loader with a minimal message to test compact layout.'
      }
    }
  }
};

export const EmptyMessage: Story = {
  args: {
    message: ''
  },
  parameters: {
    docs: {
      description: {
        story: 'Loader with no message (will show default "Loading..." text).'
      }
    }
  }
};

export const AllVariants: Story = {
  args: {
    message: 'Loading your data...'
  },
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Data Loading</h3>
        <Loader message="Loading your data..." />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Saving Changes</h3>
        <Loader message="Saving your changes..." />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">File Upload</h3>
        <Loader message="Uploading files..." />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Processing</h3>
        <Loader message="Processing your request..." />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All loader variants displayed together for comparison.'
      }
    }
  }
};

export const InContext: Story = {
  args: {
    message: 'Loading content...'
  },
  render: () => (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Sample Application</h2>
      <p className="text-gray-600 mb-4">
        This demonstrates how the loader looks within a typical application context.
      </p>
      <div className="border rounded-lg p-4 bg-gray-50">
        <Loader message="Loading content..." />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Loader component displayed within a realistic application context to show how it integrates with other UI elements.'
      }
    }
  }
};
