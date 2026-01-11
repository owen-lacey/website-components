import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './Histogram';

const meta: Meta = {
  title: 'Are You The One/Primitives/Histogram',
  component: 'o-histogram',
  tags: ['autodocs'],
  argTypes: {
    scores: {
      control: 'object',
      description: 'Array of score values to display in the histogram'
    },
    barCount: {
      control: { type: 'number', min: 5, max: 15, step: 1 },
      description: 'Number of bars to display'
    },
    barStart: {
      control: { type: 'number', min: 0, max: 5, step: 1 },
      description: 'Starting value for the first bar'
    },
    selectedScore: {
      control: { type: 'number', min: 0, max: 10 },
      description: 'The currently selected/highlighted score'
    },
    showGhostBars: {
      control: 'boolean',
      description: 'Whether to show ghost bars representing theoretical distribution'
    },
    lambda: {
      control: { type: 'number', min: 0.5, max: 5, step: 0.5 },
      description: 'Lambda parameter for Poisson distribution (used for ghost bars)'
    }
  },
  args: {
    scores: [],
    barCount: 7,
    barStart: 0,
    showGhostBars: true,
    lambda: 1
  }
};

export default meta;
type Story = StoryObj;

export const Empty: Story = {
  args: {
    scores: [],
    barCount: 7,
    showGhostBars: false
  }
};

export const WithData: Story = {
  args: {
    scores: [1, 2, 1, 3, 2, 1, 4, 2, 3, 1, 5, 2, 3, 4, 1, 2, 1],
    barCount: 7,
    showGhostBars: false
  }
};

export const WithGhostBars: Story = {
  args: {
    scores: [1, 2, 1, 3, 2, 1, 4, 2, 3, 1, 5, 2, 3, 4, 1, 2, 1],
    barCount: 7,
    showGhostBars: true,
    lambda: 2
  }
};

export const ManyBars: Story = {
  args: {
    scores: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6, 7],
    barCount: 11,
    showGhostBars: false
  }
};

export const SelectedScore: Story = {
  args: {
    scores: [1, 2, 1, 3, 2, 1, 4, 2, 3, 1, 5, 2, 3, 4, 1, 2, 1],
    barCount: 7,
    selectedScore: 2,
    showGhostBars: false
  }
};

export const LargeDataset: Story = {
  args: {
    scores: Array.from({ length: 100 }, () => Math.floor(Math.random() * 7)),
    barCount: 7,
    showGhostBars: true,
    lambda: 3
  }
};
