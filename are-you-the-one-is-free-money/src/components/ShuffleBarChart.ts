import { html, LitElement, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ScoresController } from '../controllers/scores-controller.js';
import '../primitives/Histogram.js';

/**
 * Displays a histogram showing the frequency distribution of scores (0-6).
 * Uses the shared ScoresController to access scores across components.
 * This is a wrapper around the Histogram primitive component.
 */
@customElement('o-shuffle-bar-chart')
export class ShuffleBarChart extends LitElement {
  /** Number of bars (scores) to show. */
  @property({ type: Number })
  barCount: number = 7;

  private scoresController!: ScoresController;

  @state()
  private currentScores: number[] = [];

  @state()
  private currentLastScore?: number;

  constructor() {
    super();
    this.scoresController = new ScoresController(this);
  }

  render() {

    this.currentScores = [...this.scoresController.scores];
    this.currentLastScore = this.scoresController.lastScore;

    return html`
      <o-histogram
        .scores=${this.currentScores}
        .barCount=${this.barCount}
        .barStart=${0}
        .selectedScore=${this.currentLastScore}
        .showGhostBars=${true}
        .lambda=${1}
      ></o-histogram>
    `;
  }
}
