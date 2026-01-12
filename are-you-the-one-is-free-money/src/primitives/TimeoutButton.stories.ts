import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './TimeoutButton';

const meta: Meta = {
  title: 'Are You The One/Primitives/TimeoutButton',
  component: 'o-timeout-button',
  tags: ['autodocs'],
  argTypes: {
    timeout: {
      control: { type: 'number', min: 1000, max: 10000, step: 500 },
      description: 'Timeout duration in milliseconds before the button auto-triggers'
    },
    label: {
      control: 'text',
      description: 'Button label text'
    }
  },
  args: {
    timeout: 3000,
    label: 'Click me'
  }
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: (args) => html`
    <o-timeout-button
      .timeout=${args.timeout}
      .label=${args.label}
      @timeout=${() => console.log('Timeout triggered!')}
    ></o-timeout-button>
  `
};

export const FastTimeout: Story = {
  args: {
    timeout: 1000,
    label: 'Fast button (1s)'
  }
};

export const LongTimeout: Story = {
  args: {
    timeout: 8000,
    label: 'Slow button (8s)'
  }
};

export const CustomLabel: Story = {
  args: {
    timeout: 3000,
    label: 'Wait for it...'
  }
};
