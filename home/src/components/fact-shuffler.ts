import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

@customElement('o-fact-shuffler')
export class FactShuffler extends LitElement {
  static override properties = {
    facts: { type: Array },
    scrollFactsCount: { type: Number, attribute: "scroll-facts-count" },
    transitionDuration: { type: Number, attribute: "transition-duration" },
    scrolling: { state: true },
    factToShow: { state: true },
    nextFactToShow: { state: true },
    scrollFacts: { state: true }
  };

  facts: string[] = [
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
  ];

  scrollFactsCount = 30;

  transitionDuration = 1000;

  private scrolling = false;

  private factToShow = 0;

  private nextFactToShow = 1;

  private scrollFacts: number[] = this.createScrollFacts();

  static override styles = css`
    :host {
      display: block;
      box-sizing: border-box;
    }

    .fact {
      --ink: rgb(var(--color, 0, 0, 0));
      margin: 0 2rem;
      display: flex;
      border-radius: var(--radius, 8px);
      border: 1px solid rgba(var(--color, 0, 0, 0), 0.08);
      font-size: 1.05rem;
      max-width: 92%;
      color: var(--ink);
      background: linear-gradient(135deg, rgba(var(--color, 0, 0, 0), 0.05), rgba(var(--color, 0, 0, 0), 0.015));
      box-shadow: 0 12px 30px rgba(var(--color, 0, 0, 0), 0.08), inset 0 1px 0 rgba(var(--color, 0, 0, 0), 0.06);
      position: relative;
      overflow: hidden;
    }

    .facts-scroller {
      height: 3.75rem;
      flex: 1;
      overflow: hidden;
      padding: 0.25em 0.75em;
      position: relative;
    }

    .facts-scroller > div {
      top: 0;
      position: relative;
      transform: translateY(0);
      will-change: transform;
    }

    .facts-scroller > div > div {
      word-wrap: break-word;
      height: 3.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      letter-spacing: 0.01em;
      font-weight: 500;
      transition: opacity 220ms ease;
    }

    .facts-scroller > div.scrolling {
      animation: fact-scroll var(--transition-duration) cubic-bezier(0.16, 0.9, 0.2, 1) both;
    }

    .fact::after {
      content: "";
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 20% 0%, rgba(var(--color, 0, 0, 0), 0.08), transparent 55%);
      pointer-events: none;
    }

    .shuffle-fact {
      flex: 0 0 3.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem;
    }

    button {
      width: 2.6rem;
      height: 2.6rem;
      border-radius: 999px;
      background: rgba(var(--color, 0, 0, 0), 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      cursor: pointer;
      color: var(--ink);
      transition: transform 180ms ease, background 180ms ease, box-shadow 180ms ease;
      box-shadow: 0 6px 14px rgba(var(--color, 0, 0, 0), 0.15);
    }

    button:disabled {
      cursor: progress;
      opacity: 0.6;
    }

    button:hover:not(:disabled) {
      transform: translateY(-1px) rotate(-6deg);
      background: rgba(var(--color, 0, 0, 0), 0.16);
      box-shadow: 0 10px 20px rgba(var(--color, 0, 0, 0), 0.18);
    }

    button:active:not(:disabled) {
      transform: translateY(0) rotate(0);
      box-shadow: 0 6px 14px rgba(var(--color, 0, 0, 0), 0.15);
    }

    svg {
      width: 1.25rem;
      height: 1.25rem;
    }

    @keyframes fact-scroll {
      0% {
        transform: translateY(0);
      }
      82% {
        transform: translateY(calc(3.75rem * -1 * var(--facts-count) - 6px));
      }
      100% {
        transform: translateY(calc(3.75rem * -1 * var(--facts-count)));
      }
    }
  `;

  protected override updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has("facts")) {
      this.factToShow = 0;
      this.nextFactToShow = this.facts.length > 1 ? 1 : 0;
      this.scrollFacts = this.createScrollFacts();
    }
  }

  private createScrollFacts() {
    if (this.facts.length === 0) {
      return [];
    }

    return Array.from({ length: this.scrollFactsCount }, () =>
      Math.floor(Math.random() * this.facts.length)
    );
  }

  private async shuffleFact() {
    if (this.scrolling || this.facts.length === 0) {
      return;
    }

    this.scrolling = true;
    await new Promise((resolve) => setTimeout(resolve, this.transitionDuration));
    this.factToShow = this.nextFactToShow;
    this.scrolling = false;
    this.scrollFacts = this.createScrollFacts();
    this.nextFactToShow = (this.nextFactToShow + 1) % this.facts.length;
  }

  override render() {
    const styleVars = {
      "--facts-count": String(this.scrollFactsCount + 1),
      "--transition-duration": `${this.transitionDuration}ms`
    };

    return html`
      <div class="fact">
        <div class="facts-scroller">
          <div class=${this.scrolling ? "scrolling" : ""} style=${styleMap(styleVars)}>
            <div>${this.facts[this.factToShow] ?? ""}</div>
            ${this.scrollFacts.map(
              (factIndex) => html`<div>${this.facts[factIndex] ?? ""}</div>`
            )}
            <div>${this.facts[this.nextFactToShow] ?? ""}</div>
          </div>
        </div>
        <div class="shuffle-fact">
          <button @click=${this.shuffleFact} ?disabled=${this.scrolling} aria-label="Shuffle fact">
            <svg
              fill="currentColor"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 230.055 230.055"
              xml:space="preserve"
            >
              <path
                d="M199.419,124.497c-3.516-3.515-9.213-3.515-12.729,0c-3.515,3.515-3.515,9.213,0,12.728l12.637,12.636h-8.406
c-8.177,0-16.151-2.871-22.453-8.083l-32.346-26.751l32.345-26.751c6.303-5.212,14.277-8.083,22.454-8.083h8.406L186.69,92.83
c-3.515,3.515-3.515,9.213,0,12.728c1.758,1.757,4.061,2.636,6.364,2.636s4.606-0.879,6.364-2.636l28-28
c3.515-3.515,3.515-9.213,0-12.728l-28-28c-3.516-3.515-9.213-3.515-12.729,0c-3.515,3.515-3.515,9.213,0,12.728l12.637,12.636
h-8.406c-12.354,0-24.403,4.337-33.926,12.211L122,103.348L82.564,70.733c-6.658-5.507-15.084-8.54-23.724-8.54H9
c-4.971,0-9,4.029-9,9s4.029,9,9,9h49.841c4.462,0,8.813,1.566,12.252,4.411l36.786,30.423L71.094,145.45
c-3.439,2.844-7.791,4.411-12.253,4.411H9c-4.971,0-9,4.029-9,9s4.029,9,9,9h49.841c8.64,0,17.065-3.033,23.725-8.54L122,126.707
l34.996,28.943c9.521,7.875,21.57,12.211,33.925,12.211h8.406l-12.637,12.636c-3.515,3.515-3.515,9.213,0,12.728
c1.758,1.757,4.061,2.636,6.364,2.636s4.606-0.879,6.364-2.636l28-28c3.515-3.515,3.515-9.213,0-12.728L199.419,124.497z"
              />
            </svg>
          </button>
        </div>
      </div>
    `;
  }
}
