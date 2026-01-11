import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import "../primitives/characterBox";
import { shuffle } from "../helpers/shuffle";
import { simpleButtonStyles } from "../styles/button-styles.js";

interface Character {
  id: number;
  name: string;
  shape: 'triangle' | 'circle' | 'square' | 'star';
  isOpaque: boolean;
  color: string;
}

@customElement('o-guess-who-information-demo')
export class GuessWhoInformationDemo extends LitElement {
  @property({ type: Number })
  gridSize = 8;

  @property({ type: Array })
  characters: Character[] = [];

  @property({ type: String })
  activeFilter: string = '';

  @property({ type: Number })
  informationGained: number = 0;

  @property({ type: String })
  answerText: string = '';

  @property({ type: Number })
  peopleRuledOut: number = 0;

  static readonly styles = [
    simpleButtonStyles,
    css`
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

      .controls {
        text-align: center;
        font-family: monospace;
        font-size: 14px;
        margin: 20px 0;
      }

      .question-button {
        margin: 0 4px;
        font-size: 14px;
      }

      .question-button.active {
        background-color: #28a745;
      }

      .question-button.answer-yes {
        background-color: var(--green);
      }

      .question-button.answer-no {
        background-color: var(--red);
      }

      .information-display {
        font-family: monospace;
        text-align: center;
        margin: 15px 0;
        font-size: 14px;
        min-height: 50px;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
    `
  ];

  connectedCallback() {
    super.connectedCallback();
    // Generate characters when the component connects to DOM
    this.characters = this.generateCharacters();
    this.requestUpdate(); // Explicitly trigger re-render
  }



  // Public method to flip a character by ID
  flipCharacter(characterId: number) {
    const characterElement = this.shadowRoot?.querySelector(`#character-${characterId}`);
    (characterElement as any)?.flip?.();
  }

  // Public method to flip multiple characters
  flipCharacters(characterIds: number[]) {
    characterIds.forEach(id => this.flipCharacter(id));
  }

  // Get button class based on filter and answer
  private getButtonClass(questionType: string): string {
    if (this.activeFilter !== questionType) {
      return 'question-button';
    }
    
    // Active button - color based on answer
    const isYes = this.answerText === 'Yes';
    return `question-button active ${isYes ? 'answer-yes' : 'answer-no'}`;
  }

  // Handle question button clicks
  private handleQuestion(questionType: string) {
    if (this.activeFilter === questionType) {
      // Clicking the same button - undo the filter
      this.undoFilter();
    } else {
      // Clicking a different button - apply new filter
      this.applyFilter(questionType);
    }
  }

  // Undo the current filter and reset all tiles
  private undoFilter() {
    this.activeFilter = '';
    this.answerText = '';
    this.peopleRuledOut = 0;
    this.informationGained = 0;
    
    // Reset all characters to unflipped state
    this.characters.forEach(character => {
      const characterElement = this.shadowRoot?.querySelector(`#character-${character.id}`);
      (characterElement as any)?.setFlipped?.(false);
    });
  }
  // Apply filter and flip appropriate characters
  private applyFilter(questionType: string) {
    this.activeFilter = questionType;
    
    // First reset all characters
    this.characters.forEach(character => {
      const characterElement = this.shadowRoot?.querySelector(`#character-${character.id}`);
      (characterElement as any)?.setFlipped?.(false);
    });
    
    // Then apply the filter
    let charactersToFlip: number[] = [];
    let answerIsYes = false;
    
    switch (questionType) {
      case 'blue':
        answerIsYes = true; // Answer is "Yes"
        this.answerText = 'Yes';
        charactersToFlip = this.characters
          .filter(char => answerIsYes ? char.color !== 'var(--blue)' : char.color === 'var(--blue)')
          .map(char => char.id);
        break;
      case 'opaque':
        answerIsYes = true; // Answer is "Yes" 
        this.answerText = 'Yes';
        charactersToFlip = this.characters
          .filter(char => answerIsYes ? !char.isOpaque : char.isOpaque)
          .map(char => char.id);
        break;
      case 'square':
        answerIsYes = true; // Answer is "Yes"
        this.answerText = 'Yes';
        charactersToFlip = this.characters
          .filter(char => answerIsYes ? char.shape !== 'square' : char.shape === 'square')
          .map(char => char.id);
        break;
    }
    
    this.peopleRuledOut = charactersToFlip.length;
    
    // Flip the characters that don't match the answer
    setTimeout(() => {
      charactersToFlip.forEach(id => {
        const characterElement = this.shadowRoot?.querySelector(`#character-${id}`);
        (characterElement as any)?.setFlipped?.(true);
      });
      
      // Calculate information gained
      const remainingCharacters = this.characters.length - charactersToFlip.length;
      this.informationGained = Math.log2(this.characters.length / remainingCharacters);
    }, 100);
  }



  render() {
    return html`
      
      <div class="game-board">
        ${this.characters.length > 0 ? this.characters.map((character, index) => html`
          <o-character-box
            id="character-${character.id}"
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
      <div class="controls">
        <button 
          class="${this.getButtonClass('square')}"
          @click="${() => this.handleQuestion('square')}"
        >
          <o-character-box height="12" shape="square"></o-character-box> ?
        </button>
        <button 
          class="${this.getButtonClass('blue')}"
          @click="${() => this.handleQuestion('blue')}"
        >
          <span style="color: var(--blue);">Blue</span>?
        </button>
        <button 
          class="${this.getButtonClass('opaque')}"
          @click="${() => this.handleQuestion('opaque')}"
        >
          Opaque?
        </button>
      </div>
      
      <div class="information-display">
        ${this.answerText ? html`
          <div>Ruled out: ${this.peopleRuledOut} / ${this.characters.length} answers</div>
          <div>Gained: ${this.informationGained.toFixed(2)} bits of information</div>
        ` : html`
          <div>👆 Select a question above 👆</div>
        `}
      </div>
    `;
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