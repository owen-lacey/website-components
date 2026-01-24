import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./activity-graph";

const meta: Meta = {
  title: "Home/Components/Activity Graph",
  component: "o-activity-graph",
  tags: ["autodocs"],
  argTypes: {
    endpoint: {
      control: "text",
      description: "API endpoint URL for activity data"
    },
    animated: {
      control: "boolean",
      description: "Whether to animate the lines on scroll"
    }
  },
  args: {
    endpoint: "http://localhost:57605/wubu2",
    animated: true
  },
  render: (args) => html`
    <div style="padding: 2rem; border-radius: 8px;">
      <o-activity-graph
        style="--primary: #f5f5f5; --secondary: #666;"
        .endpoint=${args.endpoint}
        .animated=${args.animated}
      ></o-activity-graph>
    </div>
  `
};

export default meta;

type Story = StoryObj;

export const Default: Story = {};

export const NoAnimation: Story = {
  args: {
    animated: false
  }
};

export const WithScrollContainer: Story = {
  render: (args) => html`
    <div style="height: 400px; overflow-y: scroll; background: #222; padding: 1rem; border-radius: 8px;">
      <div style="height: 500px; display: flex; align-items: center; justify-content: center; color: #666; font-family: monospace;">
        Scroll down to see the animation trigger
      </div>
      <div style="padding: 2rem; border-radius: 8px;">
        <o-activity-graph
          style="--primary: #f5f5f5; --secondary: #666;"
          .endpoint=${args.endpoint}
          .animated=${args.animated}
        ></o-activity-graph>
      </div>
      <div style="height: 200px;"></div>
    </div>
  `
};
