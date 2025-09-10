import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A versatile button component built with Headless UI for accessibility and consistent styling across the MapRoulette 4 application.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'ghost'],
      description: 'The visual style variant of the button',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'The size of the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler for the button',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
    onClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Primary button used for main actions and call-to-action elements.',
      },
    },
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
    onClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Secondary button used for supporting actions.',
      },
    },
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Danger Button',
    onClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Danger button used for destructive actions like delete or remove.',
      },
    },
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
    onClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Ghost button with minimal visual impact, often used in toolbars or secondary actions.',
      },
    },
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
    onClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Small button size for compact layouts.',
      },
    },
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
    onClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Large button size for prominent actions.',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
    onClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled button state for when the action is not available.',
      },
    },
  },
};

export const AllVariants: Story = {
  args: {
    children: 'Button',
    onClick: fn(),
  },
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All button variants displayed together for comparison.',
      },
    },
  },
};

export const AllSizes: Story = {
  args: {
    children: 'Button',
    onClick: fn(),
  },
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All button sizes displayed together for comparison.',
      },
    },
  },
};
