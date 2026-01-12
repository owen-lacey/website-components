import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './node';

const meta: Meta = {
  title: 'Are You The One/Primitives/Node',
  component: 'o-node',
  tags: ['autodocs'],
  argTypes: {
    gender: {
      control: { type: 'radio' },
      options: ['male', 'female'],
      description: 'Gender representation (determines icon shape)'
    },
    size: {
      control: { type: 'number', min: 20, max: 100, step: 5 },
      description: 'Size of the node in pixels'
    }
  },
  args: {
    gender: 'male',
    size: 40
  }
};

export default meta;
type Story = StoryObj;

export const MaleNode: Story = {
  render: (args) => html`
    <o-node
      .gender=${'male'}
      .size=${args.size}
    ></o-node>
  `,
  args: {
    size: 40
  },
  parameters: {
    docs: {
      description: {
        story: 'Default male node representation.'
      }
    }
  }
};

export const FemaleNode: Story = {
  render: (args) => html`
    <o-node
      .gender=${'female'}
      .size=${args.size}
    ></o-node>
  `,
  args: {
    size: 40
  },
  parameters: {
    docs: {
      description: {
        story: 'Female node representation with different icon.'
      }
    }
  }
};

export const CustomSize: Story = {
  render: () => html`
    <div style="display: flex; gap: 20px; align-items: center;">
      <o-node .gender=${'male'} .size=${20}></o-node>
      <o-node .gender=${'male'} .size=${40}></o-node>
      <o-node .gender=${'male'} .size=${60}></o-node>
      <o-node .gender=${'male'} .size=${80}></o-node>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Nodes at different sizes (20px, 40px, 60px, 80px).'
      }
    }
  }
};

export const MiniNode: Story = {
  args: {
    gender: 'male',
    size: 20
  },
  parameters: {
    docs: {
      description: {
        story: 'Small node at minimum recommended size.'
      }
    }
  }
};

export const WithCustomColor: Story = {
  render: (args) => html`
    <div style="display: flex; gap: 20px; align-items: center;">
      <o-node
        .gender=${'male'}
        .size=${args.size}
        style="--node-color: var(--red)"
      ></o-node>
      <o-node
        .gender=${'female'}
        .size=${args.size}
        style="--node-color: var(--blue)"
      ></o-node>
      <o-node
        .gender=${'male'}
        .size=${args.size}
        style="--node-color: var(--green)"
      ></o-node>
      <o-node
        .gender=${'female'}
        .size=${args.size}
        style="--node-color: var(--purple)"
      ></o-node>
    </div>
  `,
  args: {
    size: 40
  },
  parameters: {
    docs: {
      description: {
        story: 'Nodes with custom colors using the --node-color CSS variable.'
      }
    }
  }
};
