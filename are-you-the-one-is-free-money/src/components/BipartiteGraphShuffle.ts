import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { shuffle } from '../helpers/shuffle';
import { simpleButtonStyles } from '../styles/button-styles.js';
import { ScoresController } from '../controllers/scores-controller.js';

@customElement('o-bipartite-graph-shuffle')
export class BipartiteGraph extends LitElement {

  static readonly styles = [
    simpleButtonStyles,
    css`
      .footer {
        display: flex;
        margin-top: 16px;
        justify-content: center;
        gap: 8px;
        font-family: monospace;
        font-size: 14px;
      }
    `
  ];

  @property({ type: Number })
  nodes: number;

  @state()
  numbers: number[] = [];

  private readonly scoresController = new ScoresController(this);

  @state()
  isPlaying: boolean = false;

  private intervalId?: number;

  connectedCallback(): void {
    super.connectedCallback();
    this.numbers = shuffle(Array.from({ length: this.nodes }, (_, i) => i + 1));
    this.updateScores();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.stopPlaying();
  }

  render() {
    return html`<div>
      <o-bipartite-graph .numbers=${this.numbers}></o-bipartite-graph>
      <div class="footer">
        <div>Score: ${this.scoresController.lastScore ?? 0}</div>
      </div>
      <div class="footer">
        ${this.isPlaying 
          ? html`<button @click=${this.pause}>Pause</button>`
          : html`<button @click=${this.play}>Play</button>`
        }
        <button @click=${this.shuffleGraph}>Shuffle</button>
        <button @click=${this.reset}>Reset</button>
      </div>
    </div>`;
  }

  shuffleGraph() {
    this.numbers = shuffle(this.numbers);
    this.updateScores();
  }

  reset() {
    this.numbers = shuffle(Array.from({ length: this.nodes }, (_, i) => i + 1));
    this.scoresController.clearScores();
    this.updateScores();
  }

  updateScores() {
    const score = this.numbers.filter((n, i) => n === i + 1).length;
    this.scoresController.addScore(score);
  }

  play() {
    this.isPlaying = true;
    this.intervalId = globalThis.setInterval(() => {
      this.shuffleGraph();
    }, 400);
  }

  pause() {
    this.stopPlaying();
  }

  private stopPlaying() {
    this.isPlaying = false;
    if (this.intervalId !== undefined) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }
}