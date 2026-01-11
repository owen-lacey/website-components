import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import "../primitives/characterBox";
import { shuffle } from "../helpers/shuffle";
import { simpleButtonStyles } from "../styles/button-styles.js";
import confetti from "canvas-confetti";

interface Character {
  id: number;
  name: string;
  shape: 'triangle' | 'circle' | 'square' | 'star';
  isOpaque: boolean;
  color: string;
}

@customElement('o-guess-who-progress-demo')
export class GuessWhoProgressDemo extends LitElement {
  @property({ type: Number })
  gridSize = 8;

  @property({ type: Array })
  characters: Character[] = [];

  @property({ type: Array })
  activeFilters: string[] = [];

  @property({ type: Number })
  totalInformationGained: number = 0;

  @property({ type: Object })
  filterAnswers: Record<string, string> = {};

  @property({ type: Object })
  manuallyFlippedCharacters: Set<number> = new Set();

  @property({ type: Number })
  peopleRuledOut: number = 0;

  @property({ type: Boolean })
  confettiTriggered: boolean = false;

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
        margin: 20px 0;
        font-family: monospace;
        font-size: 14px;
      }

      .question-button {
        margin: 0 4px;
        font-size: 14px;
      }

      .question-button.answer-yes {
        background-color: var(--green);
      }

      .question-button.answer-no {
        background-color: var(--red);
      }

      .reset-button {
        background-color: #606060;
        margin: 0 4px;
        font-size: 14px;
      }

      .progress-container {
        margin: 20px auto;
        max-width: 400px;
      }

      .progress-bar {
        width: 100%;
        height: 24px;
        background-color: #e0e0e0;
        border-radius: 12px;
        overflow: hidden;
        position: relative;
        border: 2px solid #666;
      }

      .progress-fill {
        height: 100%;
        background: var(--green);
        border-radius: 10px;
        transition: width 0.5s ease-in-out;
        position: relative;
      }

      .progress-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-weight: bold;
        font-size: 12px;
        color: #333;
        text-shadow: 0 0 2px white;
      }

      .progress-labels {
        display: flex;
        justify-content: space-between;
        margin-top: 8px;
        font-size: 12px;
        color: #666;
      }
    `
  ];

  connectedCallback() {
    super.connectedCallback();
    // Generate characters when the component connects to DOM
    this.characters = this.generateCharacters();
    this.requestUpdate(); // Explicitly trigger re-render
  }

  private handleFlipRequest(event: CustomEvent) {
    const target = event.target as any; // CharacterBox element
    target?.flip?.();
    
    // Extract character ID from the element's id attribute
    const elementId = target?.id;
    if (elementId && elementId.startsWith('character-')) {
      const characterId = parseInt(elementId.replace('character-', ''));
      // Add to manually flipped set
      this.manuallyFlippedCharacters.add(characterId);
    }
    
    // Recalculate information after manual flip
    setTimeout(() => {
      this.recalculateInformation();
    }, 50);
  }

  // Recalculate information based on current character states
  private recalculateInformation() {
    // Count remaining (non-flipped) characters
    const remainingCharacters = this.characters.filter(char => {
      const characterElement = this.shadowRoot?.querySelector(`#character-${char.id}`);
      return !(characterElement as any)?.flipped;
    }).length;

    // Count total flipped characters
    this.peopleRuledOut = this.characters.length - remainingCharacters;

    // Calculate information gained: log2(total / remaining)
    if (remainingCharacters > 0 && remainingCharacters < this.characters.length) {
      this.totalInformationGained = Math.log2(this.characters.length / remainingCharacters);
    } else if (remainingCharacters === 1) {
      // If only 1 character remains, we have maximum information (6 bits for 64 characters)
      this.totalInformationGained = Math.log2(this.characters.length);
    } else {
      // If no filters applied or all characters remain
      this.totalInformationGained = 0;
    }

    // Cap at 6 bits maximum
    if (this.totalInformationGained > 6) {
      this.totalInformationGained = 6;
    }

    // Trigger confetti if only one character remains and not already triggered
    if (remainingCharacters === 1 && !this.confettiTriggered) {
      this.confettiTriggered = true;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    // Trigger a re-render to update the progress bar
    this.requestUpdate();
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
    if (!this.activeFilters.includes(questionType)) {
      return 'question-button';
    }
    
    // Active button - color based on answer
    const answer = this.filterAnswers[questionType];
    const isYes = answer === 'Yes';
    return `question-button active ${isYes ? 'answer-yes' : 'answer-no'}`;
  }

  // Handle question button clicks
  private handleQuestion(questionType: string) {
    // Only allow activation, not deactivation
    if (!this.activeFilters.includes(questionType)) {
      // Add the filter
      this.activeFilters = [...this.activeFilters, questionType];
      // Set the answer for this filter
      this.setFilterAnswer(questionType);
      this.applyAllFilters();
    }
    // If already active, do nothing (cannot be deactivated)
  }

  // Reset the game state
  private resetGame() {
    // Clear active filters and answers
    this.activeFilters = [];
    this.filterAnswers = {};
    this.manuallyFlippedCharacters.clear();
    this.peopleRuledOut = 0;
    this.totalInformationGained = 0;
    this.confettiTriggered = false;
    
    // Reset all characters to face-up state
    this.characters.forEach(character => {
      const characterElement = this.shadowRoot?.querySelector(`#character-${character.id}`);
      (characterElement as any)?.setFlipped?.(false);
    });
  }

  // Set the answer for a specific filter
  private setFilterAnswer(questionType: string) {
    switch (questionType) {
      case 'blue':
        this.filterAnswers[questionType] = 'Yes';
        break;
      case 'opaque':
        this.filterAnswers[questionType] = 'Yes';
        break;
      case 'square':
        this.filterAnswers[questionType] = 'Yes';
        break;
    }
  }

  // Apply all active filters and calculate cumulative information
  private applyAllFilters() {
    // Reset characters to face-up, but preserve manually flipped characters
    this.characters.forEach(character => {
      const characterElement = this.shadowRoot?.querySelector(`#character-${character.id}`);
      // Only reset to face-up if not manually flipped
      if (!this.manuallyFlippedCharacters.has(character.id)) {
        (characterElement as any)?.setFlipped?.(false);
      }
    });

    // Use setTimeout to ensure character state is reset before applying filters
    setTimeout(() => {
      this.calculateAndApplyFilters();
    }, 50);
  }

  private calculateAndApplyFilters() {
    // Apply filters to each character
    this.characters.forEach(char => {
      const characterElement = this.shadowRoot?.querySelector(`#character-${char.id}`);
      
      // If manually flipped, keep it flipped regardless of filters
      if (this.manuallyFlippedCharacters.has(char.id)) {
        (characterElement as any)?.setFlipped?.(true);
      } else {
        // Otherwise, apply filter logic
        const shouldFlip = this.shouldCharacterBeFlipped(char);
        (characterElement as any)?.setFlipped?.(shouldFlip);
      }
    });

    // Recalculate information after applying filters
    setTimeout(() => {
      this.recalculateInformation();
    }, 100);
  }

  // Helper method to determine if a character should be flipped based on active filters
  private shouldCharacterBeFlipped(char: Character): boolean {
    for (const questionType of this.activeFilters) {
      const answerIsYes = this.filterAnswers[questionType] === 'Yes';
      
      if (this.doesFilterApplyToCharacter(questionType, char, answerIsYes)) {
        return true;
      }
    }
    return false;
  }

  // Helper method to check if a specific filter applies to a character
  private doesFilterApplyToCharacter(questionType: string, char: Character, answerIsYes: boolean): boolean {
    switch (questionType) {
      case 'blue':
        return answerIsYes ? char.color !== 'var(--blue)' : char.color === 'var(--blue)';
      case 'opaque':
        return answerIsYes ? !char.isOpaque : char.isOpaque;
      case 'square':
        return answerIsYes ? char.shape !== 'square' : char.shape === 'square';
      default:
        return false;
    }
  }


  render() {
    // Calculate progress percentage (0-100% based on 0-6 bits)
    const progressPercentage = Math.min((this.totalInformationGained / 6) * 100, 100);
    
    return html`
      
      <div class="game-board" @flip-requested="${this.handleFlipRequest}">
        ${this.characters.length > 0 ? this.characters.map((character) => html`
          <o-character-box
            id="character-${character.id}"
            shape="${character.shape}"
            .isOpaque="${character.isOpaque}"
            color="${character.color}"
            name="${character.name}"
            width="40"
            height="56"
            .showName=${false}
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
        <button 
          class="reset-button"
          @click="${() => this.resetGame()}"
        >
          Reset
        </button>
      </div>
      
      <div class="progress-container">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            style="width: ${progressPercentage}%"
          ></div>
          <div class="progress-text">
            ${this.totalInformationGained.toFixed(2)}
          </div>
        </div>
        <div class="progress-labels">
          <span>0 bits</span>
          <span>6 bits</span>
        </div>
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