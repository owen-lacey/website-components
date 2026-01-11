import { html, css, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('o-mu-demo')
export class MuDemo extends LitElement {
  static styles = css`
    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 16px 0;
    }
  `;


  // Hardcoded colors for men and women
  menColors = [
    'var(--red)',
    'var(--orange)',
    'var(--yellow)',
    'var(--blue)',
    'var(--pink)',
    'var(--purple)'
  ];
  womenColors = [
    'var(--red)',    // match at 0
    'var(--purple)', // no match
    'var(--blue)',   // no match
    'var(--orange)', // no match
    'var(--pink)',   // match at 4
    'var(--yellow)'  // no match
  ];

  getScore() {
    let score = 0;
    for (let i = 0; i < 6; i++) {
      if (this.menColors[i] === this.womenColors[i]) {
        score++;
      }
    }
    return score;
  }

  render() {
    return html`
      <div class="container">
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(2, 1fr); gap: 40px 32px; margin: 16px 0;">
          ${Array.from({ length: 6 }, (_, i) => {
            const isCorrectPair = this.menColors[i] === this.womenColors[i];
            return html`
              <div style="display: flex; flex-direction: row; align-items: center; justify-content: center; min-height: 32px; border-radius: 12px;${isCorrectPair ? ' box-shadow: 0 0 0 3px var(--green);' : ' box-shadow: 0 0 0 3px var(--secondary);'}">
                <o-node size="40" gender="male" style="--node-color: ${this.menColors[i]};"></o-node>
                <o-node size="40" gender="female" style="--node-color: ${this.womenColors[i]};"></o-node>
              </div>
            `;
          })}
        </div>
        <div style="margin-top: 12px; font-weight: bold;">
          Score: ${this.getScore()}
        </div>
      </div>
    `;
  }
}
