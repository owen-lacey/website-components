import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { simpleButtonStyles } from '../styles/button-styles.js';

@customElement('o-timeout-button')
export class TimeoutButton extends LitElement {
  @property({ type: Number })
  timeout = 3000;

  @property({ type: String })
  label = 'Button';

  @state()
  private progress = 0;

  @state()
  private hasTriggered = false;

  private startTime = 0;
  private elapsedTime = 0;
  private animationFrame: number | null = null;
  private isPaused = false;

  static readonly styles = [
    simpleButtonStyles,
    css`
      :host {
        display: contents
      }

      button {
        position: relative;
        transition: transform 0.2s;
        overflow: hidden;
        z-index: 1;
        font-family: monospace;
        font-size: 14px;
      }

      .progress-fill {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        background: var(--green);
        transition: width 0.016s linear;
        z-index: -1;
        opacity: 0.5;
      }

      .label {
        position: relative;
        z-index: 2;
      }
    `
  ];

  connectedCallback() {
    super.connectedCallback();
    this.startAnimation();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopAnimation();
  }

  private startAnimation() {
    if (this.hasTriggered) return;
    
    if (this.startTime === 0) {
      this.startTime = performance.now();
    }
    
    this.isPaused = false;
    
    const animate = (currentTime: number) => {
      if (this.isPaused || this.hasTriggered) return;

      this.elapsedTime = currentTime - this.startTime;
      this.progress = Math.min((this.elapsedTime / this.timeout) * 100, 100);

      if (this.progress >= 100) {
        this.handleTimeout();
        return;
      }

      this.animationFrame = requestAnimationFrame(animate);
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  private stopAnimation() {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  private handleMouseEnter() {
    if (!this.hasTriggered && this.startTime > 0) {
      this.isPaused = true;
      this.stopAnimation();
    }
  }

  private handleMouseLeave() {
    if (!this.hasTriggered && this.startTime > 0 && this.isPaused) {
      this.startTime = performance.now() - this.elapsedTime;
      this.startAnimation();
    }
  }

  private handleClick() {
    if (this.hasTriggered) return;
    
    if (this.startTime === 0) {
      this.startAnimation();
    } else {
      this.handleTimeout();
    }
  }

  private handleTimeout() {
    this.hasTriggered = true;
    this.stopAnimation();
    this.dispatchEvent(new CustomEvent('timeout', {
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <button 
        class="button"
        @click=${this.handleClick}
        @mouseenter=${this.handleMouseEnter}
        @mouseleave=${this.handleMouseLeave}
        ?disabled=${this.hasTriggered}
      >
        <div class="progress-fill" style="width: ${this.progress}%"></div>
        <span class="button-inner">${this.label}</span>
      </button>
    `;
  }
}
