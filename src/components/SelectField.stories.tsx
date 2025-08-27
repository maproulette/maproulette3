import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { SelectField } from './SelectField';

const meta = {
  title: 'Components/SelectField',
  component: SelectField,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'A reusable select field component built with Headless UI for accessibility and consistent styling across the MapRoulette 4 application.'
      }
    }
  },
  argTypes: {
    name: {
      control: 'text',
      description: 'The name attribute for the select field'
    },
    value: {
      control: 'text',
      description: 'The current value of the select field'
    },
    onChange: {
      action: 'changed',
      description: 'Callback function when the value changes'
    },
    options: {
      control: 'object',
      description: 'Array of options for the select field'
    },
    label: {
      control: 'text',
      description: 'Label text for the field'
    },
    description: {
      control: 'text',
      description: 'Optional description text below the label'
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the field is disabled'
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required'
    }
  }
} satisfies Meta<typeof SelectField>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample options for different use cases
const editorOptions = [
  { value: -1, label: 'Select an editor' },
  { value: 1, label: 'iD Editor' },
  { value: 2, label: 'JOSM' },
  { value: 3, label: 'Potlatch 2' },
  { value: 4, label: 'Rapid' }
];

const basemapOptions = [
  { value: 0, label: 'Bing Aerial' },
  { value: 1, label: 'Bing Streets' },
  { value: 2, label: 'OpenStreetMap' },
  { value: 3, label: 'Custom' }
];

const localeOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' },
  { value: 'pt', label: 'Português' }
];

const themeOptions = [
  { value: 0, label: 'Light' },
  { value: 1, label: 'Dark' },
  { value: 2, label: 'Auto' }
];

export const Default: Story = {
  args: {
    name: 'editor',
    value: -1,
    onChange: fn(),
    options: editorOptions,
    label: 'Default Editor',
    description: 'Choose your preferred editor for mapping tasks'
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic select field with label and description.'
      }
    }
  }
};

export const WithValue: Story = {
  args: {
    name: 'basemap',
    value: 2,
    onChange: fn(),
    options: basemapOptions,
    label: 'Default Basemap',
    description: 'Select the default map background for your tasks'
  },
  parameters: {
    docs: {
      description: {
        story: 'Select field with a pre-selected value.'
      }
    }
  }
};

export const Required: Story = {
  args: {
    name: 'locale',
    value: 'en',
    onChange: fn(),
    options: localeOptions,
    label: 'Language',
    description: 'Choose your preferred language for the interface',
    required: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Required select field with visual indicator (red asterisk).'
      }
    }
  }
};

export const Disabled: Story = {
  args: {
    name: 'theme',
    value: 0,
    onChange: fn(),
    options: themeOptions,
    label: 'Theme',
    description: 'Choose your preferred visual theme for the interface',
    disabled: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled select field that cannot be interacted with.'
      }
    }
  }
};

export const NoDescription: Story = {
  args: {
    name: 'simple',
    value: 'option1',
    onChange: fn(),
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' }
    ],
    label: 'Simple Select'
  },
  parameters: {
    docs: {
      description: {
        story: 'Select field without a description, showing minimal styling.'
      }
    }
  }
};

export const LongOptions: Story = {
  args: {
    name: 'longOptions',
    value: 'option1',
    onChange: fn(),
    options: [
      { value: 'option1', label: 'This is a very long option label that might wrap to multiple lines' },
      { value: 'option2', label: 'Another long option with lots of descriptive text' },
      { value: 'option3', label: 'Short option' },
      { value: 'option4', label: 'Yet another extremely long option that demonstrates how the component handles text overflow' }
    ],
    label: 'Long Options',
    description: 'Testing how the component handles long option labels'
  },
  parameters: {
    docs: {
      description: {
        story: 'Select field with very long option labels to test text handling.'
      }
    }
  }
};

export const AllStates: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <SelectField
        name="default"
        value={-1}
        onChange={fn()}
        options={editorOptions}
        label="Default State"
        description="Normal select field"
      />
      
      <SelectField
        name="required"
        value={0}
        onChange={fn()}
        options={basemapOptions}
        label="Required Field"
        description="Required field with asterisk"
        required={true}
      />
      
      <SelectField
        name="disabled"
        value={1}
        onChange={fn()}
        options={themeOptions}
        label="Disabled Field"
        description="Disabled field that cannot be interacted with"
        disabled={true}
      />
    </div>
  ),
  args: {
    name: 'allStates',
    value: 'demo',
    onChange: fn(),
    options: [{ value: 'demo', label: 'Demo' }],
    label: 'All States'
  },
  parameters: {
    docs: {
      description: {
        story: 'All select field states displayed together for comparison.'
      }
    }
  }
};
