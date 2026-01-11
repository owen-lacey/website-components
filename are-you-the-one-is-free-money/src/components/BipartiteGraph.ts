import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { shuffle } from '../helpers/shuffle';
import { drawBipartiteGraph } from '../helpers/drawBipartiteGraph';
import '../primitives/svg-drawable';

@customElement('o-bipartite-graph')
export class BipartiteGraph extends LitElement {

  static readonly styles = css`
    .graph__lhs, .graph__rhs {
      flex: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .graph__center {
      flex: 1;
    }
    o-svg-drawable-pane {
      width: 300px;
      margin: 0 auto;
    }
  `;

  // Colors for nodes - same color for both male and female in each row
  nodeColors = [
    'var(--red)',
    'var(--orange)',
    'var(--yellow)',
    'var(--blue)',
    'var(--pink)',
    'var(--purple)'
  ];

  @property({ type: Number })
  nodes: number;

  @property({ type: Array })
  numbers: number[] = [];

  connectedCallback(): void {
    super.connectedCallback();
    if (this.numbers.length === 0) {
      this.numbers = shuffle(Array.from({ length: this.nodes }, (_, i) => i + 1));
    } else {
      this.nodes = this.numbers.length;
    }
    setTimeout(() => {
      this.drawGraph();
    });
  }

  updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);
    if (changedProperties.has('numbers') || changedProperties.has('nodes')) {
      setTimeout(() => {
        this.drawGraph();
      });
    }
  }

  private drawGraph(): void {
    const pane = this.shadowRoot?.querySelector('o-svg-drawable-pane');
    const svg = pane?.shadowRoot?.querySelector('svg') as SVGElement;
    const leftNodes = pane?.querySelectorAll('.graph__lhs o-node');
    const rightNodes = pane?.querySelectorAll('.graph__rhs o-node');
    
    if (svg && leftNodes && rightNodes) {
      drawBipartiteGraph(
        svg,
        leftNodes,
        rightNodes,
        this.numbers,
        'var(--green)',
        'var(--secondary)'
      );
    }
  }

  render() {
    return html`
      <o-svg-drawable-pane>
        <div class="graph__lhs">
          ${[...new Array(this.nodes).keys()].map((i) => html`<o-node gender="male" id="lhs-${i}" .index=${i} style="--node-color: ${this.nodeColors[i % this.nodeColors.length]};"></o-node>`)}
        </div>
        <div class="graph__center"></div>
        <div class="graph__rhs">
          ${[...new Array(this.nodes).keys()].map((i) => html`<o-node gender="female" id="rhs-${i}" .index=${i} matchedTo=${this.numbers[i]} style="--node-color: ${this.nodeColors[i % this.nodeColors.length]};"></o-node>`)}
        </div>
      </o-svg-drawable-pane>
    `;
  }
}