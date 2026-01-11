import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './BipartiteGraph';
// Import dependencies
import '../primitives/svg-drawable';
import '../primitives/node';

const meta: Meta = {
  title: 'Are You The One/Components/BipartiteGraph',
  component: 'o-bipartite-graph',
  tags: ['autodocs'],
  argTypes: {
    nodes: {
      control: { type: 'number', min: 3, max: 10, step: 1 },
      description: 'Number of nodes on each side of the graph'
    },
    numbers: {
      control: 'object',
      description: 'Array of numbers representing connections (optional, auto-generated if not provided)'
    }
  },
  args: {
    nodes: 6,
    numbers: []
  }
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    nodes: 10,
    numbers: [1, 2]
  },

  render: (args) => html`
    <o-bipartite-graph
      .nodes=${args.nodes}
      .numbers=${args.numbers}
    ></o-bipartite-graph>
  `
};

export const SmallGraph: Story = {
  args: {
    nodes: 4
  }
};

export const LargeGraph: Story = {
  args: {
    nodes: 8
  }
};

export const CustomNumbers: Story = {
  args: {
    nodes: 6,
    numbers: [3, 1, 5, 2, 6, 4]
  }
};

export const SequentialMapping: Story = {
  args: {
    nodes: 5,
    numbers: [1, 2, 3, 4, 5]
  }
};

export const ReverseMapping: Story = {
  args: {
    nodes: 5,
    numbers: [5, 4, 3, 2, 1]
  }
};
