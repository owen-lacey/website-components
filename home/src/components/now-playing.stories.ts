import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./now-playing";

const meta: Meta = {
  title: "Home/Components/Now Playing",
  component: "o-now-playing",
  tags: ["autodocs"],
  argTypes: {
    startOpen: { control: "boolean" },
    preview: { control: "object" }
  },
  args: {
    startOpen: true,
    preview: {
      name: "Little Late",
      artist: "Busty and the Bass",
      url: "https://open.spotify.com/track/1AS3Ab7roAUdFlEXJQUdb4?si=2367b1ac2d934941"
    }
  },
  render: (args) => html`
    <o-now-playing
      style="--now-playing-bg: #111111; --now-playing-icon: #f5f5f5;"
      .startOpen=${args.startOpen}
      .preview=${args.preview}
    ></o-now-playing>
  `
};

export default meta;

type Story = StoryObj;

export const Default: Story = {};
