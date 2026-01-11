import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import "../primitives/characterBox";
import { shuffle } from "../helpers/shuffle";

interface Character {
  id: number;
  name: string;
  shape: 'triangle' | 'circle' | 'square' | 'star';
  isOpaque: boolean;
  color: string;
}

@customElement('o-guess-who-demo')
export class GuessWhoDemo extends LitElement {
  @property({ type: Number })
  gridSize = 8;

  @property({ type: Array })
  characters: Character[] = [];

  static readonly styles = css`
    :host {
      display: block;
      max-width: 600px;
      margin: 0 auto;
    }

    .game-board {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 4px;
      padding: 10px;
      border: 4px solid #666;
      border-radius: 12px;
      background-color: transparent;
      width: fit-content;
      margin: 0 auto;
      min-height: 100px; /* Ensure some visible height */
    }

    .debug-info {
      text-align: center;
      margin: 10px 0;
      font-size: 14px;
      color: #666;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    // Generate characters when the component connects to DOM
    this.characters = this.generateCharacters();
    this.requestUpdate(); // Explicitly trigger re-render
  }



  render() {
    return html`
      <div class="game-board">
        ${this.characters.length > 0 ? this.characters.map((character, index) => html`
          <o-character-box
            shape="${character.shape}"
            .isOpaque="${character.isOpaque}"
            color="${character.color}"
            name="${character.name}"
            width="40"
            height="56"
            .showName=${false}
            .clickable=${false}
          ></o-character-box>
        `) : html`<div style="grid-column: 1 / -1; text-align: center; padding: 20px;">Loading characters...</div>`}
      </div>
    `;
  }

  private getCSSColors(): string[] {    
    // Try to get styles from document root first, then from host element
    let style = getComputedStyle(document.documentElement);
    
    // If document root doesn't have the variables, try the host element
    if (!style.getPropertyValue('--red').trim()) {
      style = getComputedStyle(this);
    }
    
    const variableNames = ['--red', '--teal', '--blue', '--green', '--yellow', '--pink', '--purple', '--orange'];
    
    const cssColors = variableNames.map(varName => {
      const value = style.getPropertyValue(varName).trim();
      return value;
    });
    
    return cssColors;
  }

  private generateCharacters(): Character[] {
    const shapes: ('triangle' | 'circle' | 'square' | 'star')[] = ['triangle', 'circle', 'square', 'star'];
    const colors = ['var(--red)', 'var(--green)', 'var(--blue)', 'var(--yellow)', 'var(--orange)', 'var(--pink)', 'var(--purple)', 'var(--teal)'];
    const opacities = [true, false]; // true = opaque, false = outlined
    
    // Generate all 64 unique combinations: 4 shapes × 8 colors × 2 opacities = 64
    const characterTemplates: Character[] = [];
    let id = 0;
    
    for (const shape of shapes) {
      for (const color of colors) {
        for (const isOpaque of opacities) {
          characterTemplates.push({
            id: id++,
            name: `${shape}_${color.replace('var(--', '').replace(')', '')}_${isOpaque ? 'filled' : 'outlined'}`,
            shape: shape,
            isOpaque: isOpaque,
            color: color
          });
        }
      }
    }
    
    // Shuffle to randomize appearance order
    const shuffledCharacters = shuffle([...characterTemplates]);
    
    return shuffledCharacters;
  }
}