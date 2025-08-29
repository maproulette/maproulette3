import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ErrorComponent } from './Error';

const meta = {
  title: 'Components/Error',
  component: ErrorComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'An error display component that shows error messages with optional retry functionality. Built with accessibility in mind and consistent styling for the MapRoulette 4 application.'
      }
    }
  },
  argTypes: {
    message: {
      control: 'text',
      description: 'The error message to display to the user'
    },
    onRetry: {
      action: 'retry',
      description: 'Callback function called when the retry button is clicked'
    },
    showRetry: {
      control: 'boolean',
      description: 'Whether to show the retry button (only visible when onRetry is provided)'
    }
  }
} satisfies Meta<typeof ErrorComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: 'An unexpected error occurred while loading your data. Please try again.',
    onRetry: fn(),
    showRetry: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Default error component with a retry button for recoverable errors.'
      }
    }
  }
};

export const NetworkError: Story = {
  args: {
    message: 'Unable to connect to the server. Please check your internet connection and try again.',
    onRetry: fn(),
    showRetry: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Network error message with retry functionality for connection issues.'
      }
    }
  }
};

export const ValidationError: Story = {
  args: {
    message: 'The form contains invalid data. Please review your input and submit again.',
    onRetry: fn(),
    showRetry: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Validation error message for form submission issues.'
      }
    }
  }
};

export const NoRetry: Story = {
  args: {
    message: 'This action cannot be completed at this time. Please contact support if the problem persists.',
    showRetry: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Error message without retry functionality for non-recoverable errors.'
      }
    }
  }
};

export const LongMessage: Story = {
  args: {
    message: 'This is a very long error message that demonstrates how the component handles extended text content. It should wrap properly and maintain good readability while providing comprehensive information about what went wrong and how the user might resolve the issue.',
    onRetry: fn(),
    showRetry: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Error component with a long message to test text wrapping and layout.'
      }
    }
  }
};

export const ShortMessage: Story = {
  args: {
    message: 'Error occurred.',
    onRetry: fn(),
    showRetry: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Error component with a minimal message to test compact layout.'
      }
    }
  }
};

export const WithoutRetryCallback: Story = {
  args: {
    message: 'An error occurred but no retry action is available.',
    showRetry: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Error component with showRetry enabled but no callback provided.'
      }
    }
  }
};

export const AllVariants: Story = {
  args: {
    message: 'This error can be retried',
    onRetry: fn(),
    showRetry: true
  },
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">With Retry Button</h3>
        <ErrorComponent
          message="This error can be retried"
          onRetry={fn()}
          showRetry={true}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Without Retry Button</h3>
        <ErrorComponent
          message="This error cannot be retried"
          showRetry={false}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">No Retry Callback</h3>
        <ErrorComponent
          message="This error has showRetry enabled but no callback"
          showRetry={true}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All error component variants displayed together for comparison.'
      }
    }
  }
};
