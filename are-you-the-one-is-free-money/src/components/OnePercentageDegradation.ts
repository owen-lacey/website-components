import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import "../primitives/lineGraph";
import { SeasonEvent } from "../models/seasonEvent";

@customElement('o-one-percentage-degradation')
export class OnePercentageDegradation extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 1rem;
    }
    h3 {
      margin-top: 0;
    }
  `;

  private readonly data: SeasonEvent[] = [
    { value: 3628800, type: 'initial', episode: 0 },
    { value: 3265920, type: 'truth booth', episode: 1, result: false },
    { value: 608153, type: 'match up', episode: 1, result: '2/10' },
    { value: 556241, type: 'truth booth', episode: 2, result: false },
    { value: 5773, type: 'match up', episode: 2, result: '4/10' },
    { value: 4617, type: 'truth booth', episode: 3, result: false },
    { value: 1324, type: 'match up', episode: 3, result: '2/10' },
    { value: 899, type: 'truth booth', episode: 4, result: false },
    { value: 142, type: 'match up', episode: 4, result: '2/10' },
    { value: 91, type: 'truth booth', episode: 5, result: false },
    { value: 78, type: 'truth booth', episode: 5, result: true },
    { value: 24, type: 'match up', episode: 6, result: '5/10' },
    { value: 11, type: 'truth booth', episode: 6, result: true },
    { value: 3, type: 'match up', episode: 7, result: '5/10' },
    { value: 3, type: 'truth booth', episode: 7, result: false },
    { value: 1, type: 'match up', episode: 8, result: '7/10' },
    { value: 1, type: 'truth booth', episode: 8, result: true },
    { value: 1, type: 'match up', episode: 9, result: '8/10' },
    { value: 1, type: 'truth booth', episode: 9, result: false },
    { value: 1, type: 'match up', episode: 10, result: '10/10' }
  ];

  renderTooltip = (value: SeasonEvent, index: number, data: SeasonEvent[]) => {
    let color: string;
    switch (value.type) {
      case 'truth booth':
        color = 'var(--pink)';
        break;
      case 'match up':
        color = 'var(--purple)';
        break;
      default:
        color = 'var(--secondary)';
        break;
    }
    
    
    let resultDisplay = html`<span>${value.result?.toString() || ''}</span>`;
    if (value.type === 'truth booth') {
      resultDisplay = value.result ? html`<span style="color: var(--green);">MATCH</span>` : html`<span style="color: var(--secondary);">NO MATCH</span>`;
    }
    if (value.type === 'initial') {
      return html`
      <table style="font-size: 12px; border-collapse: collapse;">
        <tr>
        <td style="padding: 2px 4px; font-weight: bold;"># Remaining:</td>
        <td style="padding: 2px 4px;">${value.value.toLocaleString()}</td>
        </tr>
      </table>
      `;
    }

    const previousValue = index > 0 ? data[index - 1].value : null;
    const diff = previousValue !== null ? value.value - previousValue : null;
    const diffText = diff !== null ? (diff >= 0 ? `+${diff.toLocaleString()}` : `${diff.toLocaleString()}`) : 'N/A';
    return html`
      <table style="font-size: 12px; border-collapse: collapse;">
      <tr>
        <td style="padding: 2px 4px; font-weight: bold;">Episode:</td>
        <td style="padding: 2px 4px;">${value.episode}</td>
      </tr>
      <tr>
        <td style="padding: 2px 4px; font-weight: bold;">Type:</td>
        <td style="padding: 2px 4px; color: ${color};">${value.type.toUpperCase()}</td>
      </tr>
      <tr>
        <td style="padding: 2px 4px; font-weight: bold;">Result:</td>
        <td style="padding: 2px 4px;">${resultDisplay}</td>
      </tr>
      <tr>
        <td style="padding: 2px 4px; font-weight: bold;"># Remaining:</td>
        <td style="padding: 2px 4px;">${value.value.toLocaleString()} (${diffText})</td>
      </tr>
      </table>
    `;
  }

  dotColorRenderer = (value: SeasonEvent) => {
    switch (value.type) {
      case 'truth booth':
        return 'pink';
      case 'match up':
        return 'purple';
      default:
        return 'secondary';
    }
  }

  annotationRenderer = (value: SeasonEvent, index: number, data: SeasonEvent[]) => {
    if (!value || value.value === null || value.value === undefined || Number.isNaN(Number(value.value))) return null;
    // For percentages dataset we want no fraction digits
    return Number(value.value).toLocaleString();
  }

  render() {
    return html`
      <o-line-graph 
        xLabel="time"
        yLabel="# remaining matches"
        .lines=${[{ points: this.data }]}
        .tooltipRenderer=${this.renderTooltip}
        .dotColorRenderer=${this.dotColorRenderer}
        .annotationRenderer=${(v: any, i: number, d: any[]) => this.annotationRenderer(v as SeasonEvent, i, d as SeasonEvent[])}>
      </o-line-graph>
    `;
  }
}
