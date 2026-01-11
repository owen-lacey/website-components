// new lit element called 'o-node'

import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement('o-node')
export class Node extends LitElement {
  @property({ type: String })
  gender: 'male' | 'female';

  static styles = css`
    :host {
      line-height: 1;
    }
    .svg-container {
      display: inline-block;
    }
  `;

  @property({ type: Number })
  size: number = 40;

  render() {
    const svg = this.getSvg();
    const size = this.size || 40;
    return html`
      <div class="svg-container" style="width:${size}px; height:${size}px;">
        ${svg}
      </div>
    `;
  }

  getSvg() {
    const size = this.size || 40;
    // Only allow CSS variable for color
    const colorVar = this.style.getPropertyValue('--node-color') || 'currentColor';
    // If not a CSS variable, fallback to currentColor
    const fill = colorVar.startsWith('var(') ? colorVar : 'currentColor';
    if (this.gender === 'male'){
      return html`<svg fill="${fill}" width="${size}" height="${size}" viewBox="-11.5 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <title>male</title>
        <path d="M7 7.344c0-1.313-1.063-2.375-2.375-2.375-1.281 0-2.344 1.063-2.344 2.375s1.063 2.375 2.344 2.375c1.313 0 2.375-1.063 2.375-2.375zM0.781 10.5h7.906c0.438 0 0.781 0.344 0.781 0.781v5.125c0 0.438-0.344 0.813-0.781 0.813v0c-0.438 0-0.781-0.375-0.781-0.813v-2.344c0-0.438-0.219-0.813-0.5-0.813s-0.5 0.375-0.5 0.813v12.625c0 0.438-0.344 0.781-0.781 0.781v0c-0.438 0-0.781-0.344-0.781-0.781v-5.531c0-0.438-0.281-0.781-0.594-0.781-0.344 0-0.594 0.344-0.594 0.781v5.531c0 0.438-0.375 0.781-0.813 0.781v0c-0.438 0-0.781-0.344-0.781-0.781v-12.625c0-0.438-0.219-0.813-0.5-0.813-0.25 0-0.469 0.375-0.469 0.813v2.344c0 0.438-0.375 0.813-0.813 0.813v0c-0.438 0-0.781-0.375-0.781-0.813v-5.125c0-0.438 0.344-0.781 0.781-0.781z"/>
      </svg>`;
    } else {
      return html`<svg fill="${fill}" width="${size}" height="${size}" viewBox="-10.5 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <title>female</title>
        <path d="M7.656 7.344c0-1.313-1.063-2.375-2.375-2.375-1.281 0-2.344 1.063-2.344 2.375s1.063 2.375 2.344 2.375c1.313 0 2.375-1.063 2.375-2.375zM8.969 11.219l1.563 4.906c0.156 0.406-0.094 0.844-0.5 0.969-0.406 0.156-0.844-0.094-1-0.5l-0.844-2.594c-0.125-0.406-0.5-0.75-0.844-0.75-0.313 0-0.469 0.344-0.344 0.75l1.813 5.594c0.125 0.406-0.125 0.75-0.563 0.75h-0.781v6.344c0 0.438-0.375 0.781-0.781 0.781-0.438 0-0.813-0.344-0.813-0.781v-6.344h-1.188v6.344c0 0.438-0.344 0.781-0.781 0.781s-0.781-0.344-0.781-0.781v-6.344h-0.781c-0.438 0-0.688-0.344-0.563-0.75l1.813-5.594c0.125-0.406-0.031-0.75-0.375-0.75-0.313 0-0.688 0.344-0.844 0.75l-0.844 2.594c-0.125 0.406-0.563 0.656-0.969 0.5-0.438-0.125-0.656-0.563-0.531-0.969l1.594-4.906c0.125-0.406 0.594-0.75 1.031-0.75h5.281c0.438 0 0.875 0.344 1.031 0.75z"/>
      </svg>`;
    }
  }
}