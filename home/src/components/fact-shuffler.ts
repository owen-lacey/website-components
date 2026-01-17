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

  scrollFactsCount = 1000;

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
      margin: 0 2rem;
      display: flex;
      border-radius: 5px;
      border: 3px dashed rgba(var(--color, 0, 0, 0), 0.2);
      font-size: 1rem;
      max-width: 90%;
      color: rgb(var(--color, 0, 0, 0));
    }

    .facts-scroller {
      height: 3.5rem;
      flex: 1;
      overflow: hidden;
      padding: 0.25em 0.5em;
    }

    .facts-scroller > div {
      top: 0;
      position: relative;
    }

    .facts-scroller > div > div {
      word-wrap: break-word;
      height: 3.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .facts-scroller > div.scrolling {
      transition: top var(--transition-duration) cubic-bezier(0, 0, 0, 1);
      top: calc(3.5rem * -1 * var(--facts-count));
    }

    .shuffle-fact {
      flex: 0 1 3.5rem;
      border-left: 3px dashed rgba(var(--color, 0, 0, 0), 0.2);
    }

    button {
      padding: 10px;
      width: 100%;
      height: 100%;
      background: none;
      display: flex;
      align-items: center;
      border: none;
      cursor: pointer;
      color: inherit;
    }

    button:disabled {
      cursor: progress;
    }

    svg {
      width: 100%;
      height: 100%;
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