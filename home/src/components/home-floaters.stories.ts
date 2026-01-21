import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./home-floaters";

const meta: Meta = {
  title: "Home/Components/Home Floaters",
  component: "o-home-floaters",
  tags: ["autodocs"],
  argTypes: {
    count: { control: "number" },
    minSize: { control: "number" },
    maxSize: { control: "number" },
    speed: { control: "number" },
    opacity: { control: "number" },
    shape: { control: "inline-radio", options: ["triangles", "cubes", "both"] }
  },
  args: {
    count: 36,
    minSize: 24,
    maxSize: 56,
    speed: 1,
    opacity: 0.45,
    shape: "triangles"
  },
  render: (args) => html`
    <div
      style="min-height: 60vh; position: relative; background: radial-gradient(circle at 20% 15%, rgba(0, 0, 0, 0.06), transparent 65%);"
    >
      <o-home-floaters
        style="--penrose-stroke: #1c1c1c; --penrose-dark: #b4b4b4; --penrose-light: #efefef;"
        .count=${args.count}
        .minSize=${args.minSize}
        .maxSize=${args.maxSize}
        .speed=${args.speed}
        .opacity=${args.opacity}
        .shape=${args.shape}
      ></o-home-floaters>
    </div>
  `
};

export default meta;

type Story = StoryObj;

export const Default: Story = {};
