import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('o-drawable-pane')
export class DrawablePane extends LitElement {
  static styles = css`
    :host {
      display: flex;
    }

    .drawable {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 60px;
    }
    canvas {
      width: 100%;
      height: 100%;
      position: absolute;
      z-index: 2;
      left: 0;
      top: 0;
      pointer-events: none;
    }
    .content {
      position: relative;
      z-index: 1;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: stretch;
    }
  `;

  render() {
    return html`
      <div class="drawable">
        <canvas></canvas>
        <div class="content">
          <slot></slot>
        </div>
      </div>
    `;
  }
}
