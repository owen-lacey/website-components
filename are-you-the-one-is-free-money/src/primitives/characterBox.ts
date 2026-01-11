import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement('o-character-box')
export class CharacterBox extends LitElement {
  @property({ type: String })
  shape: 'triangle' | 'circle' | 'square' | 'star' = 'triangle';

  @property({ type: String })
  color: string = 'currentColor';

  @property({ type: Boolean })
  isOpaque: boolean = true;

  @property({ type: String })
  name: string = '';

  @property({ type: Number })
  width: number = 16;

  @property({ type: Number })
  height: number = 16;

  @property({ type: Number })
  borderRadius: number = 6;

  @property({ type: String })
  borderColor: string = '#999';

  @property({ type: Number })
  borderWidth: number = 2;

  @property({ type: Boolean })
  showName: boolean = false;

  @property({ type: Boolean })
  flipped: boolean = false;

  @property({ type: Number })
  animationDuration: number = 600; // Animation duration in milliseconds

  @property({ type: Boolean })
  clickable: boolean = false;

  // Computed property to determine if this character is clickable
  get isClickable(): boolean {
    // If parent explicitly sets clickable to false, respect that
    if (!this.clickable) {
      return false;
    }
    
    // Not clickable if it's blue square
    if (this.color === 'var(--blue)' && this.shape === 'square') {
      return false;
    }
    
    // Not clickable if already flipped (face down)
    if (this.flipped) {
      return false;
    }
    
    return true;
  }

  static readonly styles = css`
    :host {
      display: inline-block;
      line-height: 1;
      perspective: 1000px;
    }

    .character-box {
      position: relative;
      width: 100%;
      height: 100%;
      transform-style: preserve-3d;
      transition: transform var(--animation-duration, 600ms) ease-in-out;
    }

    .character-box.clickable {
      cursor: pointer;
    }

    .character-box.non-clickable {
      cursor: default;
    }

    .character-box.flipped {
      transform: rotateX(180deg);
    }

    .card-face {
      position: absolute;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      border-style: solid;
      backface-visibility: hidden;
    }

    .card-front {
      z-index: 2;
    }

    .card-back {
      transform: rotateX(180deg);
      background-color: var(--card-back-color, #f0f0f0);
      border-color: var(--card-back-border, #999);
    }

    .icon-container {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
    }

    .name {
      font-size: 10px;
      text-align: center;
      padding: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }

    .back-content {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      font-size: 24px;
      font-weight: bold;
      color: var(--card-back-text-color, #666);
    }

    svg {
      display: block;
    }
  `;

  render() {
    const actualHeight = this.height || this.width * 1.4;
    
    return html`
      <div 
        class="character-box ${this.flipped ? 'flipped' : ''} ${this.isClickable ? 'clickable' : 'non-clickable'}"
        style="
          --animation-duration: ${this.animationDuration}ms;
          width: ${this.width}px;
          height: ${actualHeight}px;
        "
        @click="${this.isClickable ? this.handleClick : null}"
      >
        <!-- Front face -->
        <div 
          class="card-face card-front"
          style="
            border-radius: ${this.borderRadius}px;
            border: ${this.borderWidth}px solid ${this.borderColor};
          "
        >
          <div class="icon-container">
            ${this.renderShape()}
          </div>
          ${this.showName ? html`<div class="name">${this.name}</div>` : ''}
        </div>
        
        <!-- Back face -->
        <div 
          class="card-face card-back"
          style="
            border-radius: ${this.borderRadius}px;
            border: ${this.borderWidth}px solid ${this.borderColor};
          "
        >
          <div class="back-content"></div>
        </div>
      </div>
    `;
  }

  private handleClick() {
    // Only handle click if character is clickable
    if (!this.isClickable) {
      return;
    }

    // Dispatch a flip event that parent components can listen to
    this.dispatchEvent(new CustomEvent('flip-requested', {
      detail: { 
        character: {
          id: this.name,
          name: this.name,
          shape: this.shape,
          color: this.color
        }
      },
      bubbles: true
    }));
  }

  /**
   * Public method to flip the character programmatically
   */
  flip() {
    this.flipped = !this.flipped;
  }

  /**
   * Public method to set the flip state
   */
  setFlipped(flipped: boolean) {
    this.flipped = flipped;
  }

  private renderShape() {
    switch (this.shape) {
      case 'triangle':
        return this.renderTriangle(this.color, this.isOpaque);
      case 'circle':
        return this.renderCircle(this.color, this.isOpaque);
      case 'square':
        return this.renderSquare(this.color, this.isOpaque);
      case 'star':
        return this.renderStar(this.color, this.isOpaque);
      default:
        return html``;
    }
  }

  /**
   * Returns an SVG triangle
   * @param color - The fill color of the triangle
   * @param isOpaque - Whether the triangle should be opaque (true) or outlined (false)
   * @param size - The size of the SVG viewBox (default: 24)
   */
  private renderTriangle(color: string, isOpaque: boolean, size: number = 24) {
    const fill = isOpaque ? color : 'none';
    const stroke = isOpaque ? 'none' : color;
    const strokeWidth = isOpaque ? 0 : 2;
    
    return html`
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4 L20 20 L4 20 Z" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round"/>
      </svg>
    `;
  }

  /**
   * Returns an SVG circle
   * @param color - The fill color of the circle
   * @param isOpaque - Whether the circle should be opaque (true) or outlined (false)
   * @param size - The size of the SVG viewBox (default: 24)
   */
  private renderCircle(color: string, isOpaque: boolean, size: number = 24) {
    const fill = isOpaque ? color : 'none';
    const stroke = isOpaque ? 'none' : color;
    const strokeWidth = isOpaque ? 0 : 2;
    
    return html`
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
      </svg>
    `;
  }

  /**
   * Returns an SVG square
   * @param color - The fill color of the square
   * @param isOpaque - Whether the square should be opaque (true) or outlined (false)
   * @param size - The size of the SVG viewBox (default: 24)
   */
  private renderSquare(color: string, isOpaque: boolean, size: number = 24) {
    const fill = isOpaque ? color : 'none';
    const stroke = isOpaque ? 'none' : color;
    const strokeWidth = isOpaque ? 0 : 2;
    
    return html`
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="5" width="14" height="14" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round"/>
      </svg>
    `;
  }

  /**
   * Returns an SVG star
   * @param color - The fill color of the star
   * @param isOpaque - Whether the star should be opaque (true) or outlined (false)
   * @param size - The size of the SVG viewBox (default: 24)
   */
  private renderStar(color: string, isOpaque: boolean, size: number = 24) {
    const fill = isOpaque ? color : 'none';
    const stroke = isOpaque ? 'none' : color;
    const strokeWidth = isOpaque ? 0 : 2;
    
    return html`
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2 L14.5 9.5 L22 9.5 L16 14.5 L18.5 22 L12 17 L5.5 22 L8 14.5 L2 9.5 L9.5 9.5 Z" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round"/>
      </svg>
    `;
  }
}