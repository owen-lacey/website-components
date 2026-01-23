import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

interface FloaterConfig {
  size: number;
  x: number;
  y: number;
  driftX: number;
  driftY: number;
  floatDuration: number;
  spinDuration: number;
  delay: number;
  rotation: number;
  opacity: number;
  shape: "triangles" | "cubes";
}

type FloaterShape = "triangle" | "cube";
type FloaterShapeMode = FloaterShape | "both";

@customElement("o-home-floaters")
export class HomeFloaters extends LitElement {
  @property({ type: Number })
  count = 36;

  @property({ type: Number })
  minSize = 24;

  @property({ type: Number })
  maxSize = 56;

  @property({ type: Number })
  speed = 1;

  @property({ type: Number })
  opacity = 0.45;

  @property({ type: String })
  shape: "triangles" | "cubes" | "both" = "triangles";

  @state()
  private floaters: FloaterConfig[] = [];

  private prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  private konamiSequence = ["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"];
  private konamiIndex = 0;
  private lastKonamiAt = 0;
  private handleEasterEggHotkey = (event: KeyboardEvent) => {
    if (!event.altKey || !event.shiftKey || event.key.toLowerCase() !== "k") {
      this.handleKonamiSequence(event);
      return;
    }

    const target = event.target as HTMLElement | null;
    if (target?.isContentEditable || target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") {
      return;
    }

    this.cycleShape();
  };

  private handleKonamiSequence(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    if (target?.isContentEditable || target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") {
      return;
    }

    const now = performance.now();
    if (now - this.lastKonamiAt > 1200) {
      this.konamiIndex = 0;
    }
    this.lastKonamiAt = now;

    if (event.key === this.konamiSequence[this.konamiIndex]) {
      this.konamiIndex += 1;
      if (this.konamiIndex >= this.konamiSequence.length) {
        this.konamiIndex = 0;
        this.cycleShape();
      }
      return;
    }

    this.konamiIndex = event.key === this.konamiSequence[0] ? 1 : 0;
  }

  constructor() {
    super();
    if (this.prefersReducedMotion) {
      this.count = 12;
      this.minSize = 18;
      this.maxSize = 32;
    }
  }

  static styles = css`
    :host {
      position: fixed;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
      z-index: 0;
      display: block;
    }

    .floater {
      position: absolute;
      left: 0;
      top: 0;
      width: var(--size, 40px);
      height: var(--size, 40px);
      opacity: var(--opacity, 0.45);
      transform: translate(var(--x, 0), var(--y, 0));
      animation: floater-drift var(--float-duration, 30s) ease-in-out infinite;
      animation-delay: var(--delay, 0s);
    }

    .floater svg {
      width: 100%;
      height: 100%;
      display: block;
      transform-origin: center;
      animation: floater-spin var(--spin-duration, 28s) linear infinite;
    }

    .floater svg path {
      stroke: var(--secondary);
    }

    @keyframes floater-drift {
      0% {
        transform: translate(var(--x, 0), var(--y, 0));
      }
      50% {
        transform: translate(
          calc(var(--x, 0) + var(--drift-x, 0)),
          calc(var(--y, 0) + var(--drift-y, 0))
        );
      }
      100% {
        transform: translate(var(--x, 0), var(--y, 0));
      }
    }

    @keyframes floater-spin {
      from {
        transform: rotate(var(--rot, 0deg));
      }
      to {
        transform: rotate(calc(var(--rot, 0deg) + 360deg));
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .floater,
      .floater svg {
        animation: none;
      }
    }
  `;

  public connectedCallback(): void {
    super.connectedCallback();
    this.generateFloaters();
    window.addEventListener("keydown", this.handleEasterEggHotkey);
  }

  public disconnectedCallback(): void {
    window.removeEventListener("keydown", this.handleEasterEggHotkey);
    super.disconnectedCallback();
  }

  protected willUpdate(changedProperties: Map<string, unknown>): void {
    if (
      changedProperties.has("count") ||
      changedProperties.has("minSize") ||
      changedProperties.has("maxSize") ||
      changedProperties.has("speed") ||
      changedProperties.has("opacity") ||
      changedProperties.has("shape")
    ) {
      this.generateFloaters();
    }
  }

  private cycleShape(): void {
    this.shape = this.shape === "triangles" ? "cubes" : this.shape === "cubes" ? "both" : "triangles";
  }

  private generateFloaters(): void {
    const speed = this.speed > 0 ? this.speed : 1;
    const count = Math.max(0, Math.floor(this.count));
    const minSize = Math.min(this.minSize, this.maxSize);
    const maxSize = Math.max(this.minSize, this.maxSize);
    const opacity = Math.max(0, Math.min(1, this.opacity));

    this.floaters = Array.from({ length: count }, () => {
      const size = minSize + Math.random() * (maxSize - minSize);
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const driftX = (Math.random() * 2 - 1) * 14;
      const driftY = (Math.random() * 2 - 1) * 12;
      const floatDuration = (26 + Math.random() * 34) / speed;
      const spinDuration = (22 + Math.random() * 26) / speed;
      const delay = this.prefersReducedMotion ? 0 : -1 * Math.random() * floatDuration;
      const rotation = Math.floor(Math.random() * 360);
      const shape = this.shape === "both" ? (Math.random() > 0.5 ? "triangles" : "cubes") : this.shape;

      return {
        size,
        x,
        y,
        driftX,
        driftY,
        floatDuration,
        spinDuration,
        delay,
        rotation,
        opacity,
        shape
      };
    });
  }

  private renderPenrose() {
    return html`
      <svg viewBox="0 0 141.24355652982143 160" role="presentation" aria-hidden="true">
        <path
          d="M 27.32 150.00 L 27.32 50.00 L 44.64 60.00 L 44.64 120.00 L 131.24 70.00 L 131.24 90.00 L 27.32 150.00 M 10.00 20.00"
          stroke-width="2"
          fill="none"
        ></path>
        <path
          d="M 10.00 20.00 L 96.60 70.00 L 79.28 80.00 L 27.32 50.00 L 27.32 150.00 L 10.00 140.00 L 10.00 20.00 M 131.24 70.00"
          stroke-width="2"
          fill="none"
        ></path>
        <path
          d="M 131.24 70.00 L 44.64 120.00 L 44.64 100.00 L 96.60 70.00 L 10.00 20.00 L 27.32 10.00 L 131.24 70.00"
          stroke-width="2"
          fill="none"
        ></path>
      </svg>
    `;
  }

  private renderCube() {
    return html`
      <svg viewBox="0 0 279.8076211353316 320" role="presentation" aria-hidden="true">
        <path
          d="M 139.90 310.00 L 269.81 235.00 L 165.88 175.00 L 165.88 205.00 L 217.85 235.00 L 139.90 280.00 L 61.96 235.00 L 113.92 205.00 L 113.92 175.00 L 10.00 235.00 L 139.90 310.00 M 139.90 280.00 L 217.85 235.00 L 191.87 220.00 L 165.88 235.00 L 165.88 175.00 L 217.85 145.00 L 217.85 175.00 L 243.83 190.00 L 243.83 100.00 L 139.90 160.00 L 139.90 280.00 M 139.90 280.00 L 61.96 235.00 L 87.94 220.00 L 113.92 235.00 L 113.92 175.00 L 61.96 145.00 L 61.96 175.00 L 35.98 190.00 L 35.98 100.00 L 139.90 160.00 L 139.90 280.00 M 139.90 160.00 L 243.83 100.00 L 165.88 55.00 L 165.88 85.00 L 191.87 100.00 L 139.90 130.00 L 87.94 100.00 L 113.92 85.00 L 113.92 55.00 L 35.98 100.00 M 113.92 175.00 L 10.00 235.00 L 10.00 85.00 L 139.90 10.00 L 139.90 130.00 L 113.92 115.00 L 113.92 55.00 L 35.98 100.00 L 35.98 190.00 L 87.94 160.00 M 165.88 175.00 L 269.81 235.00 L 269.81 85.00 L 139.90 10.00 L 139.90 130.00 L 165.88 115.00 L 165.88 55.00 L 243.83 100.00 L 243.83 190.00 L 191.87 160.00"
          stroke-width="4"
          fill="none"
        ></path>
      </svg>
    `;
  }

  render() {
    return html`
      ${this.floaters.map((floater) => {
        const styles = {
          "--size": `${floater.size.toFixed(1)}px`,
          "--x": `${floater.x.toFixed(2)}vw`,
          "--y": `${floater.y.toFixed(2)}vh`,
          "--drift-x": `${floater.driftX.toFixed(2)}vw`,
          "--drift-y": `${floater.driftY.toFixed(2)}vh`,
          "--float-duration": `${floater.floatDuration.toFixed(1)}s`,
          "--spin-duration": `${floater.spinDuration.toFixed(1)}s`,
          "--delay": `${floater.delay.toFixed(1)}s`,
          "--rot": `${floater.rotation}deg`,
          "--opacity": `${floater.opacity}`
        };

        return html`<div class="floater" style=${styleMap(styles)}>
          ${floater.shape === "cubes" ? this.renderCube() : this.renderPenrose()}
        </div>`;
      })}
    `;
  }
}

export default HomeFloaters;
