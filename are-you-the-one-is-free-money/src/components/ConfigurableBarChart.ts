import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { shuffle } from '../helpers/shuffle';
import { poissonPMF } from '../helpers/poisson.js';
import { simpleButtonStyles } from '../styles/button-styles.js';
import '../primitives/Histogram.js';

/**
 * Displays a histogram showing the frequency distribution of scores (0-6).
 * Manages scores locally as state, with play/pause/shuffle/reset functionality.
 * This is a wrapper around the Histogram primitive component.
 */
@customElement('o-configurable-bar-chart')
export class ConfigurableBarChart extends LitElement {
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

      .nodes-slider-container {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
      }

      .nodes-slider-container label {
        flex-shrink: 0;
        color: var(--primary);
        font-family: monospace;
        font-size: 14px;
      }

      .nodes-slider-container input[type="range"] {
        flex: 1;
        width: 100%;
        height: 6px;
        background: linear-gradient(to right, var(--blue) 0%, var(--blue) var(--progress), var(--tertiary) var(--progress), var(--tertiary) 100%);
        border-radius: 3px;
        outline: none;
        -webkit-appearance: none;
        appearance: none;
      }

      .nodes-slider-container input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        background: var(--blue);
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        transition: background-color 0.2s ease;
      }

      .nodes-slider-container input[type="range"]::-webkit-slider-thumb:hover {
        background: var(--tertiary);
      }

      .nodes-slider-container input[type="range"]::-moz-range-thumb {
        width: 20px;
        height: 20px;
        background: var(--blue);
        border-radius: 50%;
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        transition: background-color 0.2s ease;
      }

      .nodes-slider-container input[type="range"]::-moz-range-thumb:hover {
        background: var(--tertiary);
      }

      .nodes-value {
        min-width: 24px;
        text-align: center;
        color: var(--primary);
        font-family: monospace;
        font-size: 14px;
        font-weight: bold;
      }

      .probabilities-table {
        margin-top: 16px;
        border-collapse: collapse;
        width: 100%;
        font-family: monospace;
        font-size: 12px;
      }

      .probabilities-table th,
      .probabilities-table td {
        border: 1px solid var(--border);
        padding: 4px;
        text-align: center;
        color: var(--primary);
      }

      .probabilities-table th {
        background-color: var(--entry);
        font-weight: bold;
      }
    `
  ];

  /** Number of nodes for shuffling and bars to show. */
  @property({ type: Number })
  nodes: number = 6;

  @state()
  private numbers: number[] = [];

  @state()
  private scores: number[] = [];

  connectedCallback(): void {
    super.connectedCallback();
    this.numbers = shuffle(Array.from({ length: this.nodes }, (_, i) => i + 1));
  }

  render() {
    const lastScore = this.scores[this.scores.length - 1];
    const average = this.scores.length > 0 ? this.scores.reduce((a, b) => a + b, 0) / this.scores.length : 0;
    const min = 6;
    const max = 100;
    const percentage = ((this.nodes - min) / (max - min)) * 100;

    const probabilities = this.calculateProbabilities();

    return html`
      <o-histogram
        .scores=${this.scores}
        .barCount=${this.nodes + 1}
        .barStart=${0}
        .selectedScore=${lastScore}
        .showGhostBars=${true}
        .lambda=${1}
      ></o-histogram>
      <div class="nodes-slider-container">
        <label># couples:</label>
        <input type="range" min="6" max="100" .value=${this.nodes.toString()} @input=${this.onNodesChange} style="--progress: ${percentage}%">
        <span class="nodes-value">${this.nodes}</span>
      </div>
      <table class="probabilities-table">
        <thead>
          <tr>
            <th>Score</th>
            <th>Probability</th>
          </tr>
        </thead>
        <tbody>
          ${probabilities.map(([score, prob]) => html`
            <tr>
              <td>${score}</td>
              <td>${prob < 0.001 ? '<0.001' : prob.toFixed(4)}</td>
            </tr>
          `)}
        </tbody>
      </table>
      <div class="footer">
        <div># simulations: ${this.scores.length.toLocaleString()} &nbsp; Average: ${average.toFixed(2)}</div>
      </div>
      <div class="footer">
        <button @click=${this.shuffleX10}>Shuffle x100</button>
        <button @click=${this.reset}>Reset</button>
      </div>
    `;
  }

  shuffleScores() {
    this.numbers = shuffle(this.numbers);
    this.updateScores();
  }

  shuffleX10() {
    for (let i = 0; i < 100; i++) {
      this.shuffleScores();
    }
  }

  reset() {
    this.numbers = shuffle(Array.from({ length: this.nodes }, (_, i) => i + 1));
    this.scores = [];
  }

  updateScores() {
    const score = this.numbers.filter((n, i) => n === i + 1).length;
    this.scores = [...this.scores, score];
  }

  calculateProbabilities(): [string | number, number][] {
    const lambda = 1; // For random permutations, expected fixed points is 1
    const probabilities: [string | number, number][] = [];
    
    // Show probabilities for scores 0 to min(9, nodes)
    const maxScore = Math.min(9, this.nodes);
    for (let score = 0; score <= maxScore; score++) {
      probabilities.push([score, poissonPMF(score, lambda)]);
    }
    
    // If nodes > 9, add a row for >=10
    if (this.nodes > 9) {
      let probGE10 = 0;
      for (let score = 10; score <= this.nodes; score++) {
        probGE10 += poissonPMF(score, lambda);
      }
      probabilities.push(['>=10', probGE10]);
    }
    
    return probabilities;
  }

  onNodesChange(e: Event) {
    const target = e.target as HTMLInputElement;
    this.nodes = parseInt(target.value);
    this.reset();
  }
}