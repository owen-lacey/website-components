import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './ConfigurableBarChart';
// Import dependencies
import '../primitives/Histogram';

const meta: Meta = {
  title: 'Are You The One/Components/ConfigurableBarChart',
  component: 'o-configurable-bar-chart',
  tags: ['autodocs'],
  argTypes: {
    nodes: {
      control: { type: 'number', min: 6, max: 100, step: 1 },
      description: 'Number of couples/nodes for the simulation'
    }
  },
  args: {
    nodes: 6
  }
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: (args) => html`
    <o-configurable-bar-chart
      .nodes=${args.nodes}
    ></o-configurable-bar-chart>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Default configuration with 6 couples. Use the controls (Play, Shuffle, Reset) to interact with the simulation.'
      }
    }
  }
};

export const SmallDataset: Story = {
  args: {
    nodes: 8
  },
  parameters: {
    docs: {
      description: {
        story: 'Smaller dataset with 8 couples for faster simulation.'
      }
    }
  }
};

export const MediumDataset: Story = {
  args: {
    nodes: 20
  },
  parameters: {
    docs: {
      description: {
        story: 'Medium-sized dataset with 20 couples.'
      }
    }
  }
};

export const LargeDataset: Story = {
  args: {
    nodes: 50
  },
  parameters: {
    docs: {
      description: {
        story: 'Large dataset with 50 couples to see probability distribution at scale.'
      }
    }
  }
};

export const VeryLargeDataset: Story = {
  args: {
    nodes: 100
  },
  parameters: {
    docs: {
      description: {
        story: 'Very large dataset with 100 couples. The probability table will show how the distribution changes with scale.'
      }
    }
  }
};
