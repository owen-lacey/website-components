import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { poissonPMF } from '../helpers/poisson.js';

/**
 * A reusable histogram component that displays frequency distribution of scores.
 * Can optionally show a theoretical distribution overlay (ghost bars).
 */
@customElement('o-histogram')
export class Histogram extends LitElement {
  static readonly styles = css`
    :host {
      display: flex;
      width: 100%;
    }

    .chart-container {
      width: 100%;
      height: 200px;
      padding: 20px;
      position: relative;
      display: flex;
      align-items: flex-end;
      gap: 8px;
    }

    .bar-wrapper {
      flex: 1;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
    }

    .bar-container {
      width: 100%;
      flex: 1;
      position: relative;
      display: flex;
      align-items: flex-end;
    }

    .bar {
      width: 100%;
      background: var(--tertiary);
      transition: height 0.5s ease-out, background-color 0.3s ease;
      position: relative;
      border-top-right-radius: 4px;
      border-top-left-radius: 4px;
    }

    .bar.selected {
      background: var(--secondary);
    }

    .ghost-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      border: 2px dashed var(--green);
      box-sizing: border-box;
      pointer-events: none;
      transition: height 0.5s ease-out;
      border-top-right-radius: 4px;
      border-top-left-radius: 4px;
    }

    .bar-label {
      margin-top: 5px;
      font-family: monospace;
      font-size: 10px;
      color: var(--primary);
      text-align: center;
    }

    .bar-count {
      position: absolute;
      top: -20px;
      left: 50%;
      transform: translateX(-50%);
      font-family: monospace;
      font-size: 11px;
      color: var(--secondary);
      white-space: nowrap;
      text-shadow: 0 0 3px var(--entry), 0 0 3px var(--entry);
    }
  `;

  /** Array of score values to display in the histogram */
  @property({ type: Array })
  scores: number[] = [];

  /** Number of bars to display */
  @property({ type: Number })
  barCount: number = 7;

  /** Starting value for the first bar (default: 0) */
  @property({ type: Number })
  barStart: number = 0;

  /** The currently selected/highlighted score (optional) */
  @property({ type: Number })
  selectedScore?: number;

  /** Whether to show ghost bars representing theoretical distribution */
  @property({ type: Boolean })
  showGhostBars: boolean = true;

  /** Lambda parameter for Poisson distribution (used for ghost bars) */
  @property({ type: Number })
  lambda: number = 1;

  @state()
  private frequencies: number[] = [];

  @state()
  private pmfValues: number[] = [];

  updated(changedProperties: Map<string, any>): void {
    super.updated(changedProperties);
    
    // Recalculate frequencies if scores or bar parameters changed
    if (
      changedProperties.has('scores') ||
      changedProperties.has('barCount') ||
      changedProperties.has('barStart') ||
      changedProperties.has('lambda')
    ) {
      this.updateFrequencies();
    }
  }

  private updateFrequencies(): void {
    const effectiveBarCount = this.barCount;
    let totalBins: number;
    let hasOverflowBin: boolean;

    if (effectiveBarCount <= 10) {
      totalBins = effectiveBarCount;
      hasOverflowBin = false;
    } else if (effectiveBarCount === 11) {
      totalBins = 11;
      hasOverflowBin = false;
    } else {
      totalBins = 11;
      hasOverflowBin = true;
    }

    const freq = Array(totalBins).fill(0);

    // Count occurrences of each score
    for (const score of this.scores) {
      if (hasOverflowBin && score >= 10) {
        freq[totalBins - 1]++;
      } else if (score >= this.barStart && score < this.barStart + (hasOverflowBin ? totalBins - 1 : totalBins)) {
        freq[score - this.barStart]++;
      }
    }

    this.frequencies = freq;

    // Calculate Poisson PMF values for ghost bars (regular bins only)
    if (this.showGhostBars) {
      const pmf: number[] = [];
      const regularBinCount = hasOverflowBin ? totalBins - 1 : totalBins;
      for (let k = this.barStart; k < this.barStart + regularBinCount; k++) {
        pmf.push(poissonPMF(k, this.lambda));
      }
      this.pmfValues = pmf;
    }
  }

  render() {
    const totalCount = this.frequencies.reduce((a, b) => a + b, 0) || 1;
    const effectiveBarCount = this.barCount;
    let totalBins: number;
    let hasOverflowBin: boolean;

    if (effectiveBarCount <= 10) {
      totalBins = effectiveBarCount;
      hasOverflowBin = false;
    } else if (effectiveBarCount === 11) {
      totalBins = 11;
      hasOverflowBin = false;
    } else {
      totalBins = 11;
      hasOverflowBin = true;
    }

    return html`
      <div class="chart-container">
        ${Array.from({ length: totalBins }, (_, i) => {
          const isLastBin = hasOverflowBin && i === totalBins - 1;
          const score = isLastBin ? '>=10' : (this.barStart + i).toString();

          let freq: number;
          if (hasOverflowBin && isLastBin) {
            freq = this.scores.filter(s => s >= 10).length;
          } else {
            freq = this.frequencies[i] || 0;
          }
          
          // Scale frequency bars by proportion
          const proportion = freq / totalCount;
          const heightPercent = proportion * 100;
          
          // Ghost bars only for regular bins
          const ghostHeightPercent = (!isLastBin && this.showGhostBars) ? this.pmfValues[i] * 100 : 0;
          
          const isSelected = !isLastBin && this.selectedScore === (this.barStart + i);

          return html`
            <div class="bar-wrapper">
              <div class="bar-container">
                <div 
                  class="bar ${isSelected ? 'selected' : ''}" 
                  style="height: ${heightPercent}%"
                >
                  ${freq > 0 ? html`<div class="bar-count">${freq.toLocaleString()}</div>` : ''}
                </div>
                ${ghostHeightPercent > 0 ? html`
                  <div 
                    class="ghost-bar" 
                    style="height: ${ghostHeightPercent}%"
                  ></div>
                ` : ''}
              </div>
              <div class="bar-label">${score}</div>
            </div>
          `;
        })}
      </div>
    `;
  }
}
