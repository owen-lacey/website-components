import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import { DataPoint } from "../primitives/lineGraph";

interface EntropyDataPoint extends DataPoint {
  x: number;
  entropy: number;
}

@customElement('o-binary-entropy-graph')
export class BinaryEntropyGraph extends LitElement {
  static readonly styles = css`
    :host {
      display: block;
      padding: 1rem;
    }
    h3 {
      margin-top: 0;
    }
  `;

  // Generate data points for binary entropy function H(x) = -x*log₂(x) - (1-x)*log₂(1-x)
  private generateEntropyData(): EntropyDataPoint[] {
    const data: EntropyDataPoint[] = [];
    
    for (let i = 0; i <= 100; i++) {
      const x = i / 100; // 0 to 1 in 0.01 intervals
      let entropy: number;
      
      // Handle edge cases where log is undefined
      if (x === 0 || x === 1) {
        entropy = 0;
      } else {
        entropy = -x * Math.log2(x) - (1 - x) * Math.log2(1 - x);
      }
      
      data.push({
        x: x,
        entropy: entropy,
        value: entropy // Required by DataPoint interface
      });
    }
    
    return data;
  }

  data: EntropyDataPoint[] = this.generateEntropyData();

  render() {
    return html`
      <o-line-graph 
        xLabel="Probability"
        yLabel="Expected information"
        .lines=${[{ points: this.data }]}
        .showAxisTicks=${true}>
      </o-line-graph>
    `;
  }
}