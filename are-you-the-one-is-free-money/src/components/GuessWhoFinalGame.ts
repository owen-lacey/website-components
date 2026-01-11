import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
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

interface Question {
  id: string;
  label: string;
  expectedInformation: number;
  checkFunction: (char: Character) => boolean;
}

@customElement('o-guess-who-final-game')
export class GuessWhoFinalGame extends LitElement {
  @property({ type: Number })
  gridSize = 8;

  @property({ type: Array })
  characters: Character[] = [];

  @property({ type: Array })
  activeFilters: string[] = [];

  @property({ type: Number })
  totalInformationGained: number = 0;

  @property({ type: Object })
  filterAnswers: Record<string, boolean> = {};

  @property({ type: Number })
  questionsAsked: number = 0;

  @property({ type: Array })
  allQuestions: Question[] = [];

  @property({ type: Array })
  topQuestions: Question[] = [];

  @property({ type: Array })
  bottomQuestions: Question[] = [];

  @property({ type: Array })
  questionGroups: { expectedInfo: number; questions: Question[] }[] = [];

  @property({ type: Boolean })
  isCalculatingQuestions: boolean = true;

  @property({ type: Boolean })
  confettiTriggered: boolean = false;

  @property({ type: Object })
  knownProperties: {
    isOpaque?: boolean;
    shape?: string;
    color?: string;
  } = {};

  static readonly styles = [
    simpleButtonStyles,
    css`
      :host {
        display: block;
        max-width: 700px;
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
        min-height: 100px;
      }

      .controls {
        text-align: center;
        margin: 20px 0;
        font-family: monospace;
      }

      .questions-section {
        margin: 15px 0;
        padding: 10px;
        border: 2px solid #666;
        border-radius: 6px;
        background-color: rgba(128, 128, 128, 0.1);
      }

      .question-button {
        border-radius: 3px;
        padding: 6px 12px;
        margin: 2px 0;
        font-size: 13px;
        display: block;
        width: 100%;
        text-align: left;
        box-sizing: border-box;
      }

      .question-button.good {
        border-left: 3px solid var(--green);
      }

      .question-button.bad {
        border-left: 3px solid var(--red);
      }

      .question-button:disabled {
        background-color: #333;
        cursor: not-allowed;
        opacity: 0.6;
      }

      .expected-info {
        font-size: 12px;
        color: #999;
        float: right;
      }

      .reset-button {
        background-color: #606060;
        border-radius: 4px;
        padding: 8px 16px;
        margin: 0 4px;
        font-size: 14px;
      }

      .progress-bar {
        width: 100%;
        height: 20px;
        background-color: #e0e0e0;
        border-radius: 10px;
        overflow: hidden;
        position: relative;
        border: 1px solid #666;
        margin-bottom: 10px;
      }

      .progress-fill {
        height: 100%;
        background: var(--green);
        border-radius: 9px;
        transition: width 0.5s ease-in-out;
        position: relative;
      }

      .progress-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-weight: bold;
        font-size: 11px;
        color: #333;
        text-shadow: 0 0 2px white;
        white-space: nowrap;
      }

      .separator {
        text-align: center;
        font-size: 18px;
        color: #666;
        margin: 8px 0;
        line-height: 1;
      }

      .skeleton-button {
        background: linear-gradient(90deg, #505050 25%, #606060 50%, #505050 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
        color: transparent;
        border: none;
        border-radius: 3px;
        padding: 6px 12px;
        margin: 2px 0;
        cursor: pointer;
        font-size: 13px;
        transition: background-color 0.2s;
        display: block;
        width: 100%;
        text-align: left;
        box-sizing: border-box;
        min-height: 2.12em;
      }

      @keyframes loading {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }
    `
  ];

  connectedCallback() {
    super.connectedCallback();
    this.initializeGame();
  }

  private initializeGame() {
    this.characters = this.generateCharacters();
    this.allQuestions = this.generateAllQuestions();
    this.updateTopQuestions();
    this.requestUpdate();
  }

  private generateAllQuestions(): Question[] {
    const shapes: ('triangle' | 'circle' | 'square' | 'star')[] = ['triangle', 'circle', 'square', 'star'];
    const colors = ['var(--red)', 'var(--green)', 'var(--blue)', 'var(--yellow)', 'var(--orange)', 'var(--pink)', 'var(--purple)', 'var(--teal)'];
    const colorNames = ['red', 'green', 'blue', 'yellow', 'orange', 'pink', 'purple', 'teal'];
    const shapeNames = ['triangle', 'circle', 'square', 'star'];
    
    const questions: Question[] = [
      // Basic opacity questions
      {
        id: 'opaque',
        label: 'Is it opaque?',
        expectedInformation: 0,
        checkFunction: (char: Character) => char.isOpaque
      },
      {
        id: 'outlined',
        label: 'Is it outlined?',
        expectedInformation: 0,
        checkFunction: (char: Character) => !char.isOpaque
      },
      
      // Basic shape questions
      ...shapes.map((shape, index) => ({
        id: `shape_${shapeNames[index]}`,
        label: `Is it a ${shapeNames[index]}?`,
        expectedInformation: 0,
        checkFunction: (char: Character) => char.shape === shape
      })),
      
      // Basic color questions
      ...colors.map((color, index) => ({
        id: `color_${colorNames[index]}`,
        label: `Is it ${colorNames[index]}?`,
        expectedInformation: 0,
        checkFunction: (char: Character) => char.color === color
      })),

      // Shape + Opacity combinations (8 questions)
      ...shapes.flatMap((shape, shapeIndex) => [
        {
          id: `opaque_${shapeNames[shapeIndex]}`,
          label: `Is it a <o-character-box shape="${shape}" borderWidth="0" isOpaque="true"></o-character-box>?`,
          expectedInformation: 0,
          checkFunction: (char: Character) => char.shape === shape && char.isOpaque
        },
        {
          id: `outlined_${shapeNames[shapeIndex]}`,
          label: `Is it a <o-character-box shape="${shape}" borderWidth="0" isOpaque="false"></o-character-box> ?`,
          expectedInformation: 0,
          checkFunction: (char: Character) => char.shape === shape && !char.isOpaque
        }
      ]),

      // Color + Opacity combinations (16 questions)
      ...colors.flatMap((color, colorIndex) => [
        {
          id: `opaque_${colorNames[colorIndex]}`,
          label: `Is it an opaque ${colorNames[colorIndex]} shape?`,
          expectedInformation: 0,
          checkFunction: (char: Character) => char.color === color && char.isOpaque
        },
        {
          id: `outlined_${colorNames[colorIndex]}`,
          label: `Is it an outlined ${colorNames[colorIndex]} shape?`,
          expectedInformation: 0,
          checkFunction: (char: Character) => char.color === color && !char.isOpaque
        }
      ]),

      // Color + Shape combinations (32 questions)
      ...colors.flatMap((color, colorIndex) => 
        shapes.map((shape, shapeIndex) => ({
          id: `${colorNames[colorIndex]}_${shapeNames[shapeIndex]}`,
          label: `Is it a <span style="color: ${color}">${shapeNames[shapeIndex]}</span>?`,
          expectedInformation: 0,
          checkFunction: (char: Character) => char.color === color && char.shape === shape
        }))
      ),

      // Full combinations: Color + Shape + Opacity (64 questions - every possible character!)
      ...colors.flatMap((color, colorIndex) => 
        shapes.flatMap((shape, shapeIndex) => [
          {
            id: `opaque_${colorNames[colorIndex]}_${shapeNames[shapeIndex]}`,
            label: `Is it <o-character-box shape="${shape}" color="${color}" borderWidth="0" isOpaque="true"></o-character-box> ?`,
            expectedInformation: 0,
            checkFunction: (char: Character) => char.color === color && char.shape === shape && char.isOpaque
          },
          {
            id: `outlined_${colorNames[colorIndex]}_${shapeNames[shapeIndex]}`,
            label: `Is it <o-character-box shape="${shape}" color="${color}" borderWidth="0" isOpaque="false"></o-character-box> ?`,
            expectedInformation: 0,
            checkFunction: (char: Character) => char.color === color && char.shape === shape && !char.isOpaque
          }
        ])
      ),
      
      // Grouping questions
      {
        id: 'fewer_than_4_sides',
        label: 'Does it have fewer than 4 sides?',
        expectedInformation: 0,
        checkFunction: (char: Character) => char.shape === 'triangle' || char.shape === 'circle'
      },
      {
        id: '4_or_more_sides',
        label: 'Does it have 4 or more sides?',
        expectedInformation: 0,
        checkFunction: (char: Character) => char.shape === 'square' || char.shape === 'star'
      },
      {
        id: 'warm_colors',
        label: 'Is it a warm color (red, orange, yellow, pink)?',
        expectedInformation: 0,
        checkFunction: (char: Character) => ['var(--red)', 'var(--orange)', 'var(--yellow)', 'var(--pink)'].includes(char.color)
      },
      {
        id: 'cool_colors',
        label: 'Is it a cool color (blue, green, purple, teal)?',
        expectedInformation: 0,
        checkFunction: (char: Character) => ['var(--blue)', 'var(--green)', 'var(--purple)', 'var(--teal)'].includes(char.color)
      },
      
      // Opaque/outlined groupings with colors
      ...colorNames.map((colorName, index) => ({
        id: `any_${colorName}_opaque`,
        label: `Is it an opaque ${colorName} shape?`,
        expectedInformation: 0,
        checkFunction: (char: Character) => char.color === colors[index] && char.isOpaque
      })),
      ...colorNames.map((colorName, index) => ({
        id: `any_${colorName}_outlined`,
        label: `Is it an outlined ${colorName} shape?`,
        expectedInformation: 0,
        checkFunction: (char: Character) => char.color === colors[index] && !char.isOpaque
      })),

      // Opaque/outlined groupings with shapes  
      ...shapeNames.map((shapeName, index) => ({
        id: `any_opaque_${shapeName}`,
        label: `Is it an opaque ${shapeName}?`,
        expectedInformation: 0,
        checkFunction: (char: Character) => char.shape === shapes[index] && char.isOpaque
      })),
      ...shapeNames.map((shapeName, index) => ({
        id: `any_outlined_${shapeName}`,
        label: `Is it an outlined ${shapeName}?`,
        expectedInformation: 0,
        checkFunction: (char: Character) => char.shape === shapes[index] && !char.isOpaque
      }))
    ];

    // Calculate expected information for each question
    questions.forEach(question => {
      question.expectedInformation = this.calculateExpectedInformation(question);
    });

    return questions;
  }

  private calculateExpectedInformation(question: Question): number {
    const remainingCharacters = this.getRemainingCharacters();
    const totalRemaining = remainingCharacters.length;
    
    if (totalRemaining <= 1) return 0;

    // Count characters that match the question
    const matchingCount = remainingCharacters.filter(question.checkFunction).length;
    const notMatchingCount = totalRemaining - matchingCount;

    if (matchingCount === 0 || notMatchingCount === 0) {
      return 0; // No information gained if all or none match
    }

    // Calculate probabilities
    const probTrue = matchingCount / totalRemaining;
    const probFalse = notMatchingCount / totalRemaining;

    // Calculate information gained for each outcome
    const infoIfTrue = Math.log2(totalRemaining / matchingCount);
    const infoIfFalse = Math.log2(totalRemaining / notMatchingCount);

    // Expected information = sum of (probability × information gained)
    const expectedInfo = (probTrue * infoIfTrue) + (probFalse * infoIfFalse);

    return expectedInfo;
  }

  private getRemainingCharacters(): Character[] {
    return this.characters.filter(char => {
      const characterElement = this.shadowRoot?.querySelector(`#character-${char.id}`);
      return !(characterElement as any)?.flipped;
    });
  }

  private updateTopQuestions() {
    // Set loading state to show skeleton
    this.isCalculatingQuestions = true;
    const startTime = performance.now();
    this.requestUpdate();

    // Use setTimeout to allow the skeleton to render before calculations
    setTimeout(() => {
      // Recalculate expected information for all questions
      this.allQuestions.forEach(question => {
        question.expectedInformation = this.calculateExpectedInformation(question);
      });

      // Filter out already asked questions, questions with 0 expected info, and irrelevant questions
      const availableQuestions = this.allQuestions
        .filter(question => !this.activeFilters.includes(question.id))
        .filter(question => question.expectedInformation > 0)
        .filter(question => this.isQuestionRelevant(question))
        .sort((a, b) => b.expectedInformation - a.expectedInformation);

      // Group questions by expected information (rounded to 3 decimal places for grouping)
      this.groupQuestionsByExpectedInfo(availableQuestions);

      // Take top 3 and bottom 3 for fallback display
      this.topQuestions = availableQuestions.slice(0, 3);
      this.bottomQuestions = availableQuestions.slice(-3).reverse(); // Reverse so worst is first
      
      // Ensure skeleton shows for at least 100ms
      const elapsed = performance.now() - startTime;
      const minDelay = Math.max(0, 100 - elapsed);
      
      setTimeout(() => {
        // Clear loading state and update
        this.isCalculatingQuestions = false;
        this.requestUpdate();
      }, minDelay);
    }, 0);
  }

  private groupQuestionsByExpectedInfo(availableQuestions: Question[]) {
    // Group questions by expected information value (rounded to 3 decimals)
    const groups = new Map<string, Question[]>();
    
    availableQuestions.forEach(question => {
      const roundedInfo = question.expectedInformation.toFixed(3);
      if (!groups.has(roundedInfo)) {
        groups.set(roundedInfo, []);
      }
      const group = groups.get(roundedInfo);
      if (group) {
        group.push(question);
      }
    });

    // Convert to array and sort by expected information (descending)
    this.questionGroups = Array.from(groups.entries())
      .map(([expectedInfoStr, questions]) => {
        const sortedQuestions = [...questions].sort((a, b) => a.label.localeCompare(b.label));
        return {
          expectedInfo: parseFloat(expectedInfoStr),
          questions: sortedQuestions
        };
      })
      .sort((a, b) => b.expectedInfo - a.expectedInfo); // Sort groups by expected info (descending)
  }

  private handleQuestion(questionId: string) {
    const question = this.allQuestions.find(q => q.id === questionId);
    if (!question || this.activeFilters.includes(questionId)) return;

    // Determine the answer based on the target character (blue square)
    const targetCharacter = this.characters.find(char => 
      char.color === 'var(--blue)' && char.shape === 'square' && char.isOpaque
    );
    
    if (!targetCharacter) return;

    const answer = question.checkFunction(targetCharacter);
    
    // Add to active filters and record answer
    this.activeFilters = [...this.activeFilters, questionId];
    this.filterAnswers[questionId] = answer;
    this.questionsAsked++;

    // Update known properties based on the question and answer
    this.updateKnownProperties(question, answer);

    // Apply the filter
    this.applyFilter(question, answer);
    
    // Update top questions for next round
    this.updateTopQuestions();
  }

  private updateKnownProperties(question: Question, answer: boolean) {
    if (answer) {
      // If the question was answered yes, we can infer properties from it
      const opacity = this.extractOpacityFromQuestion(question.id);
      if (opacity !== null) {
        this.knownProperties.isOpaque = opacity;
      }
      
      const shape = this.extractShapeFromQuestion(question.id);
      if (shape) {
        this.knownProperties.shape = shape;
      }
      
      const color = this.extractColorFromQuestion(question.id);
      if (color) {
        this.knownProperties.color = color;
      }
    } else {
      // If the question was answered no, we can infer opposites for basic binary questions
      if (question.id === 'opaque') {
        this.knownProperties.isOpaque = false;
      } else if (question.id === 'outlined') {
        this.knownProperties.isOpaque = true;
      }
      // For specific shape/color questions answered no, we don't infer what it IS,
      // but we could potentially track what it is NOT (though that's more complex)
    }
  }

  private applyFilter(question: Question, answer: boolean) {
    this.characters.forEach(char => {
      const characterElement = this.shadowRoot?.querySelector(`#character-${char.id}`);
      const shouldBeFlipped = (characterElement as any)?.flipped || 
                            (question.checkFunction(char) !== answer);
      
      if (shouldBeFlipped) {
        (characterElement as any)?.setFlipped?.(true);
      }
    });

    // Recalculate information after applying filter
    setTimeout(() => {
      this.recalculateInformation();
    }, 100);
  }

  private recalculateInformation() {
    const remainingCharacters = this.getRemainingCharacters();
    const remainingCount = remainingCharacters.length;

    if (remainingCount > 0 && remainingCount < this.characters.length) {
      this.totalInformationGained = Math.log2(this.characters.length / remainingCount);
    } else if (remainingCount === 1) {
      this.totalInformationGained = Math.log2(this.characters.length);
    } else {
      this.totalInformationGained = 0;
    }

    // Cap at 6 bits maximum
    if (this.totalInformationGained > 6) {
      this.totalInformationGained = 6;
    }

    // Trigger confetti if only one character remains and not already triggered
    if (remainingCount === 1 && !this.confettiTriggered) {
      this.confettiTriggered = true;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    this.requestUpdate();
  }

  private resetGame() {
    this.activeFilters = [];
    this.filterAnswers = {};
    this.questionsAsked = 0;
    this.totalInformationGained = 0;
    this.confettiTriggered = false;
    this.knownProperties = {};
    
    // Reset all characters to face-up state
    this.characters.forEach(character => {
      const characterElement = this.shadowRoot?.querySelector(`#character-${character.id}`);
      (characterElement as any)?.setFlipped?.(false);
    });

    // Regenerate questions and update top questions
    this.allQuestions = this.generateAllQuestions();
    this.updateTopQuestions();
  }

  private isGameWon(): boolean {
    const remainingCharacters = this.getRemainingCharacters();
    return remainingCharacters.length === 1;
  }

  private getQuestionButtonClass(expectedInfo: number): string {
    // High information questions are "good", low information are "bad"
    return expectedInfo >= 0.5 ? 'good' : 'bad';
  }

  private getRandomQuestionFromGroup(group: { expectedInfo: number; questions: Question[] }): Question {
    // The target question (correct answer) that we want to avoid showing unless it's the only option
    const targetQuestionId = 'opaque_blue_square';
    
    // Filter out the target question unless it's the only one in the group
    const availableQuestions = group.questions.length > 1 
      ? group.questions.filter(q => q.id !== targetQuestionId)
      : group.questions;
    
    // If all questions were filtered out (shouldn't happen), fall back to original array
    const questionsToChooseFrom = availableQuestions.length > 0 ? availableQuestions : group.questions;
    
    // Return random question from the available options
    return questionsToChooseFrom[Math.floor(Math.random() * questionsToChooseFrom.length)];
  }

  private renderSkeletonQuestions() {
    // Estimate skeleton layout based on current state
    const availableQuestions = this.allQuestions
      .filter(q => !this.activeFilters.includes(q.id) && q.expectedInformation > 0)
      .filter(q => this.isQuestionRelevant(q));
    const totalQuestions = availableQuestions.length;
    
    if (totalQuestions <= 6 && totalQuestions > 0) {
      // Show skeleton for individual questions when <= 6 total
      return html`
        ${Array(totalQuestions).fill(0).map(() => html`
          <div class="skeleton-button"></div>
        `)}
      `;
    } else {
      // Show skeleton for grouped questions when > 6 total
      // Estimate number of groups by looking at current questionGroups or default to many
      const estimatedGroups = this.questionGroups.length > 0 ? this.questionGroups.length : 10;
      
      if (estimatedGroups > 6) {
        // Skeleton for top 3 + ellipsis + bottom 3
        return html`
          ${Array(3).fill(0).map(() => html`<div class="skeleton-button"></div>`)}
          <div class="separator">⋮</div>
          ${Array(3).fill(0).map(() => html`<div class="skeleton-button"></div>`)}
        `;
      } else {
        // Skeleton for all groups
        return html`
          ${Array(Math.max(estimatedGroups, 3)).fill(0).map(() => html`
            <div class="skeleton-button"></div>
          `)}
        `;
      }
    }
  }

  private renderGameContent(gameWon: boolean) {
    if (gameWon) {
      return html`
        <div style="text-align: center; padding: 20px;">
          Target found: <span style="color: var(--blue)">■</span><br>
        </div>
      `;
    }

    // Show skeleton while calculating questions
    if (this.isCalculatingQuestions) {
      return this.renderSkeletonQuestions();
    }

    // Check if we should show individual questions instead of groups
    const totalQuestions = this.allQuestions
      .filter(q => !this.activeFilters.includes(q.id) && q.expectedInformation > 0)
      .filter(q => this.isQuestionRelevant(q))
      .length;
    
    if (totalQuestions <= 6) {
      // Show all available questions when 6 or fewer total
      const availableQuestions = this.allQuestions
        .filter(q => !this.activeFilters.includes(q.id) && q.expectedInformation > 0)
        .filter(q => this.isQuestionRelevant(q))
        .sort((a, b) => b.expectedInformation - a.expectedInformation);
      
      return html`
        ${availableQuestions.map(question => html`
          <button 
            class="question-button"
            @click="${() => this.handleQuestion(question.id)}"
            ?disabled="${this.activeFilters.includes(question.id)}"
          >
            ${unsafeHTML(question.label)}
            <span class="expected-info">${question.expectedInformation.toFixed(2)}</span>
          </button>
        `)}
      `;
    }

    // Show grouped questions when more than 6 total questions
    if (this.questionGroups.length > 0) {
      // Show top groups, ellipsis if many groups, then bottom groups
      if (this.questionGroups.length > 6) {
        const topGroups = this.questionGroups.slice(0, 3);
        const bottomGroups = this.questionGroups.slice(-3);
        return html`
          ${topGroups.map(group => {
            const randomQuestion = this.getRandomQuestionFromGroup(group);
            return html`
              <button 
                class="question-button"
                @click="${() => this.handleQuestion(randomQuestion.id)}"
                ?disabled="${this.activeFilters.includes(randomQuestion.id)}"
              >
                ${unsafeHTML(randomQuestion.label)}
                <span class="expected-info">${group.expectedInfo.toFixed(2)}</span>
              </button>
            `;
          })}
          <div class="separator">⋮</div>
          ${bottomGroups.map(group => {
            const randomQuestion = this.getRandomQuestionFromGroup(group);
            return html`
              <button 
                class="question-button"
                @click="${() => this.handleQuestion(randomQuestion.id)}"
                ?disabled="${this.activeFilters.includes(randomQuestion.id)}"
              >
                ${unsafeHTML(randomQuestion.label)}
                <span class="expected-info">${group.expectedInfo.toFixed(2)}</span>
              </button>
            `;
          })}
        `;
      } else {
        // Show all groups when 6 or fewer groups
        return html`
          ${this.questionGroups.map(group => {
            const randomQuestion = this.getRandomQuestionFromGroup(group);
            return html`
              <button 
                class="question-button"
                @click="${() => this.handleQuestion(randomQuestion.id)}"
                ?disabled="${this.activeFilters.includes(randomQuestion.id)}"
              >
                ${unsafeHTML(randomQuestion.label)}
                <span class="expected-info">${group.expectedInfo.toFixed(2)}</span>
              </button>
            `;
          })}
        `;
      }
    }

    // Fallback to top/bottom display
    const separatorHtml = this.bottomQuestions.length > 0 ? html`<div class="separator">⋮</div>` : '';

    return html`
      <!-- Top questions -->
      ${this.topQuestions.map(question => html`
        <button 
          class="question-button good"
          @click="${() => this.handleQuestion(question.id)}"
          ?disabled="${this.activeFilters.includes(question.id)}"
        >
          ${unsafeHTML(question.label)}
          <span class="expected-info">${question.expectedInformation.toFixed(2)}</span>
        </button>
      `)}

      <!-- Vertical ellipsis separator -->
      ${separatorHtml}

      <!-- Bottom questions -->
      ${this.bottomQuestions.map(question => html`
        <button 
          class="question-button bad"
          @click="${() => this.handleQuestion(question.id)}"
          ?disabled="${this.activeFilters.includes(question.id)}"
        >
          ${unsafeHTML(question.label)}
          <span class="expected-info">${question.expectedInformation.toFixed(2)}</span>
        </button>
      `)}
    `;
  }

  private renderQuestionSections() {
    const progressPercentage = Math.min((this.totalInformationGained / 6) * 100, 100);
    const gameWon = this.isGameWon();
    
    return html`
      <div class="questions-section">
        <!-- Compact progress bar -->
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            style="width: ${progressPercentage}%"
          ></div>
          <div class="progress-text">
            ${gameWon 
              ? `Complete! Found in ${this.questionsAsked} questions`
              : this.totalInformationGained.toFixed(2)
            }
          </div>
        </div>

        ${this.renderGameContent(gameWon)}
      </div>
    `;
  }

  render() {
    return html`
      <div class="game-board">
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
            .clickable=${false}
          ></o-character-box>
        `) : html`<div style="grid-column: 1 / -1; text-align: center; padding: 20px;">Loading characters...</div>`}
      </div>

${this.renderQuestionSections()}
      
      <div class="controls">
        <button 
          class="reset-button"
          @click="${() => this.resetGame()}"
        >
          Reset
        </button>
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
            name: `${shape}_${color.replace('var(--', '').replace(')', '')}_${isOpaque ? 'opaque' : 'outlined'}`,
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

  private extractShapeFromQuestion(questionId: string): string | null {
    const shapeNames = ['triangle', 'circle', 'square', 'star'];
    for (const shape of shapeNames) {
      if (questionId.includes(shape)) {
        return shape;
      }
    }
    return null;
  }

  private extractColorFromQuestion(questionId: string): string | null {
    const colorNames = ['red', 'green', 'blue', 'yellow', 'orange', 'pink', 'purple', 'teal'];
    for (const color of colorNames) {
      if (questionId.includes(color)) {
        return color;
      }
    }
    return null;
  }

  private extractOpacityFromQuestion(questionId: string): boolean | null {
    if (questionId.includes('opaque')) {
      return true;
    }
    if (questionId.includes('outlined')) {
      return false;
    }
    return null;
  }

  private isQuestionRelevant(question: Question): boolean {
    if (this.knownProperties.isOpaque !== undefined) {
      const questionOpacity = this.extractOpacityFromQuestion(question.id);
      if (questionOpacity !== null) {
        return false;
      }
    }

    if (this.knownProperties.shape) {
      const questionShape = this.extractShapeFromQuestion(question.id);
      if (questionShape !== null) {
        return false;
      }
    }

    if (this.knownProperties.color) {
      const questionColor = this.extractColorFromQuestion(question.id);
      if (questionColor !== null) {
        return false;
      }
    }

    return true;
  }
}