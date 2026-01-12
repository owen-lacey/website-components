import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './lineGraph';
import type { LineData } from './lineGraph';

const meta: Meta = {
  title: 'Are You The One/Primitives/LineGraph',
  component: 'o-line-graph',
  tags: ['autodocs'],
  argTypes: {
    lines: {
      control: 'object',
      description: 'Array of line data to display'
    },
    xLabel: {
      control: 'text',
      description: 'Label for the x-axis'
    },
    yLabel: {
      control: 'text',
      description: 'Label for the y-axis'
    },
    showAxisTicks: {
      control: 'boolean',
      description: 'Whether to show axis tick marks'
    }
  },
  args: {
    lines: [],
    xLabel: '',
    yLabel: '',
    showAxisTicks: false
  }
};

export default meta;
type Story = StoryObj;

export const SingleLine: Story = {
  args: {
    lines: [
      {
        points: [
          { value: 5 },
          { value: 8 },
          { value: 12 },
          { value: 9 },
          { value: 15 },
          { value: 11 },
          { value: 18 }
        ],
        color: '#3498db',
        legend: 'Data Series'
      }
    ],
    xLabel: 'Time',
    yLabel: 'Value'
  }
};

export const MultiLine: Story = {
  args: {
    lines: [
      {
        points: [
          { value: 5 },
          { value: 8 },
          { value: 12 },
          { value: 9 },
          { value: 15 }
        ],
        color: '#3498db',
        legend: 'Series A'
      },
      {
        points: [
          { value: 3 },
          { value: 6 },
          { value: 4 },
          { value: 11 },
          { value: 8 }
        ],
        color: '#e74c3c',
        legend: 'Series B'
      },
      {
        points: [
          { value: 7 },
          { value: 5 },
          { value: 9 },
          { value: 6 },
          { value: 12 }
        ],
        color: '#27ae60',
        legend: 'Series C'
      }
    ],
    xLabel: 'Round',
    yLabel: 'Score'
  }
};

export const DashedLine: Story = {
  args: {
    lines: [
      {
        points: [
          { value: 10 },
          { value: 15 },
          { value: 13 },
          { value: 18 },
          { value: 20 }
        ],
        color: '#9b59b6',
        legend: 'Predicted',
        dashed: true
      },
      {
        points: [
          { value: 10 },
          { value: 14 },
          { value: 12 },
          { value: 17 },
          { value: 19 }
        ],
        color: '#3498db',
        legend: 'Actual'
      }
    ],
    xLabel: 'Time Period',
    yLabel: 'Metric'
  }
};

export const WithAxisTicks: Story = {
  args: {
    lines: [
      {
        points: [
          { value: 100 },
          { value: 150 },
          { value: 175 },
          { value: 160 },
          { value: 200 }
        ],
        color: '#1abc9c'
      }
    ],
    xLabel: 'Days',
    yLabel: 'Revenue ($)',
    showAxisTicks: true
  }
};

export const VaryingLineWidths: Story = {
  args: {
    lines: [
      {
        points: [
          { value: 5 },
          { value: 10 },
          { value: 8 },
          { value: 12 }
        ],
        color: '#3498db',
        legend: 'Thin Line',
        lineWidth: 1
      },
      {
        points: [
          { value: 7 },
          { value: 9 },
          { value: 11 },
          { value: 10 }
        ],
        color: '#e74c3c',
        legend: 'Medium Line',
        lineWidth: 3
      },
      {
        points: [
          { value: 3 },
          { value: 6 },
          { value: 5 },
          { value: 8 }
        ],
        color: '#27ae60',
        legend: 'Thick Line',
        lineWidth: 5
      }
    ],
    xLabel: 'Index',
    yLabel: 'Value'
  }
};

export const ManyDataPoints: Story = {
  args: {
    lines: [
      {
        points: Array.from({ length: 50 }, (_, i) => ({
          value: 50 + Math.sin(i / 5) * 30 + Math.random() * 10
        })),
        color: '#3498db',
        legend: 'Oscillating Data'
      }
    ],
    xLabel: 'Sample',
    yLabel: 'Measurement'
  }
};
