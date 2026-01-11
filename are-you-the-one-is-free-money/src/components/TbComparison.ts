import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import "../primitives/node";

@customElement('o-tb-comparison')
export class TbComparison extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: var(--font-family, system-ui, -apple-system, sans-serif);
    }

    .pairings-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
      align-items: center;
    }

    .pairing-pill {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 1rem;
      background: var(--entry, #f5f5f5);
      border-radius: 2rem;
      font-size: 0.9rem;
    }

    .nodes {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .info-text {
      color: var(--secondary, #666);
    }

    .info-value {
      font-weight: bold;
      color: var(--primary, #000);
      margin-left: 0.25rem;
    }

    .ellipsis {
      color: var(--secondary, #666);
      font-size: 1.5rem;
      line-height: 1;
      letter-spacing: 0.1em;
    }
  `;

  render() {
    const pairings = [
      { maleColor: 'var(--red)', femaleColor: 'var(--blue)', info: '0.81 bits' },
      { maleColor: 'var(--red)', femaleColor: 'var(--red)', info: '0.71 bits' },
      { maleColor: 'var(--green)', femaleColor: 'var(--blue)', info: '0.67 bits' },
      { maleColor: 'var(--orange)', femaleColor: 'var(--yellow)', info: '0.65 bits' },
      { maleColor: 'var(--red)', femaleColor: 'var(--pink)', info: '0.59 bits' },
    ];

    return html`
      <div class="pairings-container">
        ${pairings.map((pairing, index) => html`
          <div class="pairing-pill">
            <div class="nodes">
              <o-node 
                gender="male" 
                size="40"
                style="--node-color: ${pairing.maleColor}">
              </o-node>
              <o-node 
                gender="female" 
                size="40"
                style="--node-color: ${pairing.femaleColor}">
              </o-node>
            </div>
            <span class="info-text">
              Expected information:<span class="info-value">${pairing.info}</span>
            </span>
          </div>
        `)}
        <div class="ellipsis">⋮</div>
      </div>
    `;
  }
}
