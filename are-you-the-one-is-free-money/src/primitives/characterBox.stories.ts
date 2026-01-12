import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './characterBox';

const meta: Meta = {
  title: 'Are You The One/Primitives/CharacterBox',
  component: 'o-character-box',
  tags: ['autodocs'],
  argTypes: {
    shape: {
      control: { type: 'radio' },
      options: ['triangle', 'circle', 'square', 'star'],
      description: 'Shape of the character icon'
    },
    color: {
      control: 'text',
      description: 'Color of the shape (use CSS color values or CSS variables like var(--red))'
    },
    isOpaque: {
      control: 'boolean',
      description: 'Whether the shape is filled (true) or outlined (false)'
    },
    name: {
      control: 'text',
      description: 'Name of the character'
    },
    width: {
      control: { type: 'number', min: 16, max: 200, step: 4 },
      description: 'Width of the character box in pixels'
    },
    height: {
      control: { type: 'number', min: 16, max: 280, step: 4 },
      description: 'Height of the character box in pixels (defaults to width * 1.4 if not set)'
    },
    borderRadius: {
      control: { type: 'number', min: 0, max: 20, step: 1 },
      description: 'Border radius in pixels'
    },
    borderColor: {
      control: 'text',
      description: 'Border color'
    },
    borderWidth: {
      control: { type: 'number', min: 0, max: 10, step: 1 },
      description: 'Border width in pixels'
    },
    showName: {
      control: 'boolean',
      description: 'Whether to display the character name below the icon'
    },
    flipped: {
      control: 'boolean',
      description: 'Whether the card is flipped to show the back face'
    },
    clickable: {
      control: 'boolean',
      description: 'Whether the card can be clicked (dispatches flip-requested event)'
    },
    animationDuration: {
      control: { type: 'number', min: 100, max: 2000, step: 100 },
      description: 'Duration of flip animation in milliseconds'
    }
  },
  args: {
    shape: 'triangle',
    color: 'var(--red)',
    isOpaque: true,
    name: 'Character',
    width: 80,
    height: 112,
    borderRadius: 6,
    borderColor: '#999',
    borderWidth: 2,
    showName: false,
    flipped: false,
    clickable: false,
    animationDuration: 600
  }
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: (args) => html`
    <o-character-box
      .shape=${args.shape}
      .color=${args.color}
      .isOpaque=${args.isOpaque}
      .name=${args.name}
      .width=${args.width}
      .height=${args.height}
      .borderRadius=${args.borderRadius}
      .borderColor=${args.borderColor}
      .borderWidth=${args.borderWidth}
      .showName=${args.showName}
      .flipped=${args.flipped}
      .clickable=${args.clickable}
      .animationDuration=${args.animationDuration}
    ></o-character-box>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Basic character box with default styling. Try the controls to customize the appearance.'
      }
    }
  }
};

export const AllShapes: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(4, 100px); gap: 20px; justify-content: start;">
      <div style="text-align: center;">
        <o-character-box
          .shape=${'triangle'}
          .color=${'var(--red)'}
          .isOpaque=${true}
          .width=${80}
          .showName=${true}
          .name=${'Triangle'}
        ></o-character-box>
      </div>
      <div style="text-align: center;">
        <o-character-box
          .shape=${'circle'}
          .color=${'var(--blue)'}
          .isOpaque=${true}
          .width=${80}
          .showName=${true}
          .name=${'Circle'}
        ></o-character-box>
      </div>
      <div style="text-align: center;">
        <o-character-box
          .shape=${'square'}
          .color=${'var(--green)'}
          .isOpaque=${true}
          .width=${80}
          .showName=${true}
          .name=${'Square'}
        ></o-character-box>
      </div>
      <div style="text-align: center;">
        <o-character-box
          .shape=${'star'}
          .color=${'var(--yellow)'}
          .isOpaque=${true}
          .width=${80}
          .showName=${true}
          .name=${'Star'}
        ></o-character-box>
      </div>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Displays all four available shapes: triangle, circle, square, and star.'
      }
    }
  }
};

export const OpaqueVsOutlined: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(2, 100px); gap: 20px; justify-content: start;">
      <div style="text-align: center;">
        <o-character-box
          .shape=${'triangle'}
          .color=${'var(--red)'}
          .isOpaque=${true}
          .width=${80}
          .showName=${true}
          .name=${'Opaque'}
        ></o-character-box>
      </div>
      <div style="text-align: center;">
        <o-character-box
          .shape=${'triangle'}
          .color=${'var(--red)'}
          .isOpaque=${false}
          .width=${80}
          .showName=${true}
          .name=${'Outlined'}
        ></o-character-box>
      </div>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Comparison of opaque (filled) vs outlined shapes.'
      }
    }
  }
};

export const FlippedCard: Story = {
  args: {
    flipped: true,
    width: 80
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the back face of the card when flipped is true.'
      }
    }
  }
};

export const ClickableCard: Story = {
  render: (args) => html`
    <o-character-box
      .shape=${args.shape}
      .color=${args.color}
      .isOpaque=${args.isOpaque}
      .width=${args.width}
      .clickable=${true}
      @flip-requested=${(e: CustomEvent) => {
        console.log('Flip requested:', e.detail);
        alert(`Flip requested for: ${e.detail.character.name}`);
      }}
    ></o-character-box>
  `,
  args: {
    width: 80,
    name: 'Click me!'
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive card that dispatches a flip-requested event when clicked. Check the console and watch for the alert.'
      }
    }
  }
};

export const WithName: Story = {
  args: {
    showName: true,
    name: 'Alice',
    width: 80
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays the character name below the icon when showName is true.'
      }
    }
  }
};

export const CustomDimensions: Story = {
  render: () => html`
    <div style="display: flex; gap: 20px; align-items: end;">
      <o-character-box
        .shape=${'star'}
        .color=${'var(--purple)'}
        .width=${40}
        .showName=${true}
        .name=${'Small'}
      ></o-character-box>
      <o-character-box
        .shape=${'star'}
        .color=${'var(--purple)'}
        .width=${80}
        .showName=${true}
        .name=${'Medium'}
      ></o-character-box>
      <o-character-box
        .shape=${'star'}
        .color=${'var(--purple)'}
        .width=${120}
        .showName=${true}
        .name=${'Large'}
      ></o-character-box>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Character boxes at different sizes to demonstrate width/height customization.'
      }
    }
  }
};
