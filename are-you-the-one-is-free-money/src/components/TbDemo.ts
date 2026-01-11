import { html, css, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import '../primitives/drawable';

@customElement('o-tb-demo')
export class TbDemo extends LitElement {
  static styles = css`
    .container {
      display: flex;
      justify-content: center;
      height: 120px;
    }
    .tb-grid {
      display: grid;
      grid-template-columns: 60px 1fr 60px;
      grid-template-rows: 60px 60px;
      gap: 10px;
      align-items: center;
      width: 320px;
      margin: 0 auto;
    }
    .tb-label {
      display: flex;
      justify-content: center;
      height: 60px;
      position: relative;
    }
    .tb-label code {
      border-radius: 6px;
      position: relative;
    }
    o-drawable-pane {
      width: 300px;
      margin: 0 auto;
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    setTimeout(() => {
      const pane = this.shadowRoot?.querySelector('o-drawable-pane') as HTMLElement;
      const canvas = pane?.shadowRoot?.querySelector('canvas') as HTMLCanvasElement;
      if (!canvas) return;

      canvas.width = pane.clientWidth;
      canvas.height = pane.clientHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Get colors from the pane element (which inherits the CSS variables)
      const styles = getComputedStyle(pane);
      const correctColor = styles.getPropertyValue('--green').trim();
      const incorrectColor = styles.getPropertyValue('--secondary').trim();

      this.drawLine(canvas, ctx, pane?.querySelector('#tb-male-0'), pane?.querySelector('#tb-female-0'), correctColor);
      this.drawLine(canvas, ctx, pane?.querySelector('#tb-male-1'), pane?.querySelector('#tb-female-1'), incorrectColor);
    });
  }

  private drawLine(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    element1: Element | null,
    element2: Element | null,
    color: string
  ) {
    if (!element1 || !element2) return;

    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    // Start line from right edge of left node
    const x1 = rect1.left + rect1.width - canvasRect.left;
    const y1 = rect1.top + rect1.height / 2 - canvasRect.top;
    // End line at left edge of right node
    const x2 = rect2.left - canvasRect.left;
    const y2 = rect2.top + rect2.height / 2 - canvasRect.top;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  render() {
    return html`
      <div class="container">
        <o-drawable-pane>
          <div class="tb-grid">
            <o-node id="tb-male-0" size="60" gender="male" style="--node-color: var(--blue);"></o-node>
            <div class="tb-label"><code style="color: var(--green);">PERFECT MATCH</code></div>
            <o-node id="tb-female-0" size="60" gender="female" style="--node-color: var(--blue);"></o-node>
            <o-node id="tb-male-1" size="60" gender="male" style="--node-color: var(--red);"></o-node>
            <div class="tb-label"><code style="color: var(--secondary);">NO MATCH</code></div>
            <o-node id="tb-female-1" size="60" gender="female" style="--node-color: var(--yellow);"></o-node>
          </div>
        </o-drawable-pane>
      </div>
    `;
  }
}
