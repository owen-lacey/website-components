import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./fact-shuffler";

const meta: Meta = {
  title: "Home/Components/Fact Shuffler",
  component: "o-fact-shuffler",
  tags: ["autodocs"],
  argTypes: {
    facts: {
      control: "object",
      description: "Array of facts to shuffle through."
    }
  },
  args: {
    facts: [
      "I'm a full stack developer.",
      "I'm a husband & dad.",
      "I think maths is cool.",
      "I have a bernese mountain dog called Toby.",
      "I play trombone in a brass band.",
      "I support LFC (for my sins).",
      "I love escaping from escape rooms.",
      "I have 3 older brothers",
      "I can (slowly) solve a Rubik's cube",
      "I'm an expert bird caller"
    ]
  },
  render: (args) => html`<o-fact-shuffler .facts=${args.facts}></o-fact-shuffler>`
};

export default meta;

type Story = StoryObj;

export const Default: Story = {};
