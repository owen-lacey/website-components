import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

interface NowPlayingData {
  name: string;
  artist: string;
  url: string;
}

@customElement("o-now-playing")
export class NowPlaying extends LitElement {
  @property({ type: String })
  endpoint = "";

  @property({ type: Boolean, attribute: "start-open" })
  startOpen = false;

  @property({ attribute: false })
  preview?: NowPlayingData;

  @state()
  private nowPlaying?: NowPlayingData;

  @state()
  private open = false;

  private hasWarned = false;

  static styles = css`
    :host {
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 10;
      display: block;
    }

    .now-playing {
      background: var(--now-playing-bg, #0b0b0b);
      border-radius: 999px;
      display: flex;
      align-items: center;
      overflow: hidden;
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.12);
    }

    button.icon {
      background: transparent;
      border: none;
      padding: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      animation: spin 10s linear infinite;
    }

    button.icon:focus-visible {
      outline: 2px solid var(--primary, #ffffff);
      outline-offset: 2px;
      border-radius: 999px;
    }

    .details {
      display: flex;
      flex-direction: column;
      width: 0;
      opacity: 0;
      transition: width 0.3s ease, opacity 0.1s ease 0.1s;
      color: var(--now-playing-text, #ffffff);
      text-decoration: none;
      padding-right: 0;
    }

    .details.open {
      width: 170px;
      opacity: 1;
      padding-right: 12px;
    }

    .details span {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      font-size: 0.8rem;
      max-width: 50vw;
    }

    .details .artist {
      color: var(--now-playing-muted, rgba(255, 255, 255, 0.6));
      font-size: 0.75rem;
    }

    svg {
      height: 30px;
      width: 30px;
      fill: var(--now-playing-icon, #ffffff);
      stroke: var(--now-playing-icon, #ffffff);
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    @media (max-width: 600px) {
      :host {
        top: 6px;
        right: 6px;
      }

      .details.open {
        width: 140px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      button.icon {
        animation: none;
      }
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    this.open = this.startOpen;
    this.syncNowPlaying();
  }

  updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has("preview") && this.preview) {
      this.nowPlaying = this.preview;
    }

    if (changedProperties.has("endpoint") && !this.preview) {
      this.fetchNowPlaying();
    }
  }

  private syncNowPlaying(): void {
    if (this.preview) {
      this.nowPlaying = this.preview;
      return;
    }

    this.fetchNowPlaying();
  }

  private getResolvedEndpoint(): string {
    if (this.endpoint) {
      return this.endpoint;
    }

    const globalEndpoint = (window as Window & { NOW_PLAYING_ENDPOINT?: string }).NOW_PLAYING_ENDPOINT;
    return globalEndpoint ?? "";
  }

  private async fetchNowPlaying(): Promise<void> {
    const endpoint = this.getResolvedEndpoint();

    if (!endpoint) {
      if (!this.hasWarned) {
        console.warn("NOW_PLAYING endpoint not configured");
        this.hasWarned = true;
      }
      return;
    }

    try {
      const response = await fetch(`${endpoint}/now-playing?_ts=${Date.now()}`, {
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      });

      if (response.status === 200) {
        const data = (await response.json()) as NowPlayingData;
        if (data?.name) {
          this.nowPlaying = data;
        }
      }
    } catch (error) {
      console.error("Failed to fetch now playing:", error);
    }
  }

  private toggleOpen(): void {
    this.open = !this.open;
  }

  private renderIcon() {
    return html`
      <svg viewBox="-5.5 0 32 32" role="presentation" aria-hidden="true">
        <path
          d="M5.688 9.656v10.906c-0.469-0.125-0.969-0.219-1.406-0.219-1 0-2.031 0.344-2.875 0.906s-1.406 1.469-1.406 2.531c0 1.125 0.563 1.969 1.406 2.531s1.875 0.875 2.875 0.875c0.938 0 2-0.313 2.844-0.875s1.375-1.406 1.375-2.531v-11.438l9.531-2.719v7.531c-0.438-0.125-0.969-0.188-1.438-0.188-0.969 0-2.031 0.281-2.875 0.844s-1.375 1.469-1.375 2.531c0 1.125 0.531 2 1.375 2.531 0.844 0.563 1.906 0.906 2.875 0.906 0.938 0 2.031-0.344 2.875-0.906 0.875-0.531 1.406-1.406 1.406-2.531v-14.406c0-0.688-0.469-1.156-1.156-1.156-0.063 0-0.438 0.125-1.031 0.281-1.25 0.344-3.125 0.875-5.25 1.5-1.094 0.281-2.063 0.594-3.031 0.844-0.938 0.281-1.75 0.563-2.469 0.75-0.75 0.219-1.219 0.344-1.406 0.406-0.5 0.156-0.844 0.594-0.844 1.094z"
        ></path>
      </svg>
    `;
  }

  render() {
    if (!this.nowPlaying) {
      return html``;
    }

    return html`
      <div class="now-playing">
        <button
          class="icon"
          @click=${this.toggleOpen}
          aria-pressed=${this.open}
          aria-label="Toggle now playing details"
        >
          ${this.renderIcon()}
        </button>
        <a
          class="details ${this.open ? "open" : ""}"
          href=${this.nowPlaying.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="song">${this.nowPlaying.name}</span>
          <span class="artist">${this.nowPlaying.artist}</span>
        </a>
      </div>
    `;
  }
}

export default NowPlaying;
