import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import "../primitives/lineGraph";
import { SeasonEvent } from "../models/seasonEvent";


@customElement('o-one-log-degradation')
export class OneLogDegradation extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 1rem;
    }
    h3 {
      margin-top: 0;
    }
  `;

  data: SeasonEvent[] = [
    { value: 21.79106111, type: 'initial', episode: 0 },
    { value: 21.63905802, type: 'truth booth', episode: 1, result: false },
    { value: 19.2140748, type: 'match up', episode: 1, result: '2/10' },
    { value: 19.08535056, type: 'truth booth', episode: 2, result: false },
    { value: 12.49510551, type: 'match up', episode: 2, result: '4/10' },
    { value: 12.17274002, type: 'truth booth', episode: 3, result: false },
    { value: 10.37068741, type: 'match up', episode: 3, result: '2/10' },
    { value: 9.812177306, type: 'truth booth', episode: 4, result: false },
    { value: 7.14974712, type: 'match up', episode: 4, result: '2/10' },
    { value: 6.50779464, type: 'truth booth', episode: 5, result: false },
    { value: 6.285402219, type: 'truth booth', episode: 5, result: true },
    { value: 4.584962501, type: 'match up', episode: 6, result: '5/10' },
    { value: 3.459431619, type: 'truth booth', episode: 6, result: true },
    { value: 1.584962501, type: 'match up', episode: 7, result: '5/10' },
    { value: 1.584962501, type: 'truth booth', episode: 7, result: false },
    { value: 0, type: 'match up', episode: 8, result: '7/10' },
    { value: 0, type: 'truth booth', episode: 8, result: true },
    { value: 0, type: 'match up', episode: 9, result: '8/10' },
    { value: 0, type: 'truth booth', episode: 9, result: false },
    { value: 0, type: 'match up', episode: 10, result: '10/10' }
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
        <td style="padding: 2px 4px; font-weight: bold;">log₂(# Remaining):</td>
        <td style="padding: 2px 4px;">${value.value.toFixed(2)}</td>
        </tr>
      </table>
      `;
    }

    const previousValue = index > 0 ? data[index - 1].value : null;
    const diff = previousValue !== null ? value.value - previousValue : null;
    const diffText = diff !== null ? (diff >= 0 ? `+${diff.toFixed(2)}` : `${diff.toFixed(2)}`) : 'N/A';
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
        <td style="padding: 2px 4px; font-weight: bold;">log₂(# Remaining):</td>
        <td style="padding: 2px 4px;">${value.value.toFixed(2)} (${diffText})</td>
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
        return 'primary';
    }
  }

  annotationRenderer = (value: SeasonEvent, index: number, data: SeasonEvent[]) => {
    if (!value || value.value === null || value.value === undefined || Number.isNaN(Number(value.value))) return null;
    return Number(value.value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  render() {
    return html`
      <o-line-graph 
        xLabel="time"
        yLabel="log₂(# remaining matches)"
        .lines=${[{ points: this.data }]}
        .tooltipRenderer=${this.renderTooltip}
        .dotColorRenderer=${this.dotColorRenderer}
        .annotationRenderer=${(v: any, i: number, d: any[]) => this.annotationRenderer(v as SeasonEvent, i, d as SeasonEvent[])}>
      </o-line-graph>
    `;
  }
}
