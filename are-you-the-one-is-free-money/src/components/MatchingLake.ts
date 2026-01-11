import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { simpleButtonStyles } from '../styles/button-styles.js';

interface Person {
  id: string;
  gender: 'male' | 'female';
  color: string;
  colorIndex: number;
}

@customElement('o-matching-lake')
export class MatchingLake extends LitElement {
  @state()
  private isReset = true;

  private readonly iconSize = 60;

  // Hardcoded random order - generated once
  private readonly people: Person[] = [
    { id: 'person-0', gender: 'female', color: 'var(--purple)', colorIndex: 6 },
    { id: 'person-1', gender: 'male', color: 'var(--blue)', colorIndex: 2 },
    { id: 'person-2', gender: 'male', color: 'var(--teal)', colorIndex: 7 },
    { id: 'person-3', gender: 'female', color: 'var(--yellow)', colorIndex: 3 },
    { id: 'person-4', gender: 'male', color: 'var(--red)', colorIndex: 0 },
    { id: 'person-5', gender: 'female', color: 'var(--green)', colorIndex: 1 },
    { id: 'person-6', gender: 'female', color: 'var(--orange)', colorIndex: 4 },
    { id: 'person-7', gender: 'male', color: 'var(--purple)', colorIndex: 6 },
    { id: 'person-8', gender: 'female', color: 'var(--teal)', colorIndex: 7 },
    { id: 'person-9', gender: 'male', color: 'var(--pink)', colorIndex: 5 },
    { id: 'person-10', gender: 'female', color: 'var(--red)', colorIndex: 0 },
    { id: 'person-11', gender: 'male', color: 'var(--green)', colorIndex: 1 },
    { id: 'person-12', gender: 'male', color: 'var(--yellow)', colorIndex: 3 },
    { id: 'person-13', gender: 'female', color: 'var(--blue)', colorIndex: 2 },
    { id: 'person-14', gender: 'male', color: 'var(--orange)', colorIndex: 4 },
    { id: 'person-15', gender: 'female', color: 'var(--pink)', colorIndex: 5 }
  ];

  static readonly styles = [
    simpleButtonStyles,
    css`
      :host {
        display: block;
        padding: 1.5em;
        border-radius: 1.5em;
        text-align: center;
        font-size: 1.25em;
        font-family: inherit;
      }

      .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5em;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        width: fit-content;
        margin: 0 auto;
        position: relative;
      }

      .person {
        position: relative;
        transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1);
        transform: translate(var(--tx, 0), var(--ty, 0));
        /* border: 2px solid red; */
      }
      button {
        font-family: monospace;
        font-size: 14px;
      }
    `
  ];

  private getSortedPeople(): Person[] {
    // Group people by color
    const colorGroups = new Map<number, Person[]>();
    for (const person of this.people) {
      const group = colorGroups.get(person.colorIndex) ?? [];
      group.push(person);
      colorGroups.set(person.colorIndex, group);
    }

    // Create sorted array with pairs next to each other
    const sortedPeople: Person[] = [];
    const sortedColors = Array.from(colorGroups.keys()).sort((a, b) => a - b);
    
    for (const colorIndex of sortedColors) {
      const group = colorGroups.get(colorIndex) ?? [];
      const male = group.find(p => p.gender === 'male');
      const female = group.find(p => p.gender === 'female');
      if (male) sortedPeople.push(male);
      if (female) sortedPeople.push(female);
    }

    return sortedPeople;
  }

  private handleMatch() {
    const grid = this.shadowRoot?.querySelector('.grid');
    if (!grid) return;

    const sortedPeople = this.getSortedPeople();

    // Create a map of person ID to their target position
    const targetPositions = new Map<string, number>();
    for (const [index, person] of sortedPeople.entries()) {
      targetPositions.set(person.id, index);
    }

    // Calculate the translation for each person
    for (const [currentIndex, person] of this.people.entries()) {
      setTimeout(() => {
        const targetIndex = targetPositions.get(person.id);
        if (targetIndex === undefined) return;
        
        // Calculate row and column for current and target positions
        const currentRow = Math.floor(currentIndex / 4);
        const currentCol = currentIndex % 4;
        const targetRow = Math.floor(targetIndex / 4);
        const targetCol = targetIndex % 4;
        
        // Calculate translation (actual node height is 69.5px + 1em gap which is ~16px)
        const cellWidth = this.iconSize;
        const cellHeight = this.iconSize + 9.5;
        const dx = (targetCol - currentCol) * cellWidth;
        const dy = (targetRow - currentRow) * cellHeight;
        
        const element = grid.querySelector(`[data-id="${person.id}"]`);
        if (element instanceof HTMLElement) {
          element.style.setProperty('--tx', `${dx}px`);
          element.style.setProperty('--ty', `${dy}px`);
        }
      }, currentIndex * 20);
    }

    this.isReset = false;
  }

  private handleReset() {
    const grid = this.shadowRoot?.querySelector('.grid');
    if (!grid) return;

    // Reset all translations to 0
    for (const [currentIndex, person] of this.people.entries()) {
      setTimeout(() => {
        const element = grid.querySelector(`[data-id="${person.id}"]`);
        if (element instanceof HTMLElement) {
          element.style.setProperty('--tx', '0px');
          element.style.setProperty('--ty', '0px');
        }
      }, currentIndex * 20);
    }

    this.isReset = true;
  }

  render() {
    return html`
      <div class="container">
        <div class="grid">
          ${this.people.map(person => html`
            <div 
              class="person"
              data-id="${person.id}"
            >
              <o-node 
                size="${this.iconSize}" 
                gender="${person.gender}" 
                style="--node-color: ${person.color};"
              ></o-node>
            </div>
          `)}
        </div>
        ${this.isReset ? html`
          <button class="button" @click=${this.handleMatch}>
            <span class="button-inner">Match</span>
          </button>
        ` : html`
          <o-timeout-button
            timeout="3000"
            label="Reset"
            @timeout=${this.handleReset}
          ></o-timeout-button>
        `}
      </div>
    `;
  }
}
