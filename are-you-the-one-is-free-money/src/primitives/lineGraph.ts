// Support for multiple lines
export interface LineData {
  points: DataPoint[];
  color?: string;
  legend?: string;
  dashed?: boolean;
  lineWidth?: number;
  opacity?: number;
}
import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

export interface DataPoint { value: number }

@customElement('o-line-graph')
export class LineGraph extends LitElement {

  @property({ type: Array })
  lines: LineData[] = [];

  @property({ type: String })
  xLabel: string = "";

  @property({ type: String })
  yLabel: string = "";

  @property({ type: Boolean })
  showAxisTicks: boolean = false;

  /**
   * Optional function to render a tooltip for a data point.
   * Receives (value: T, index: number, data: T[]) and returns a TemplateResult.
   */
  @property({ attribute: false })
  tooltipRenderer?: (value: any, index: number, data: any[]) => TemplateResult<any>;

  /**
   * Optional function to override the color of a dot for a data point.
   * Receives (value: T, index: number, data: T[]) and returns a CSS color string.
   */
  @property({ attribute: false })
  dotColorRenderer?: (value: any) => string;

  /**
   * Optional function to render an annotation next to a data point.
   * Receives (value: DataPoint, index: number, data: DataPoint[]) and returns a string to draw
   * (or null/undefined to skip annotation for that point).
   */
  @property({ attribute: false })
  annotationRenderer?: (value: DataPoint, index: number, data: DataPoint[]) => string | null;

  // Internal state for tooltip
  private hoveredIndex: number | null = null;
  private mouseX: number = 0;
  private mouseY: number = 0;
  
  // Internal state for line hover
  private hoveredLineIndex: number | null = null;

  static readonly styles = css`
    :host {
      display: block;
      position: relative;
    }
    canvas {
      width: 100%;
      height: 250px;
      background: transparent;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
      display: block;
    }
    .tooltip {
      position: absolute;
      pointer-events: none;
      background: #222;
      color: #fff;
      font-family: monospace;
      font-size: 13px;
      padding: 4px 8px;
      border-radius: 4px;
      white-space: nowrap;
      z-index: 10;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      transform: translate(-50%, -120%);
      opacity: 0.95;
      user-select: none;
    }
  `;

  firstUpdated() {
    this.attachCanvasEvents();
    this.draw();
  }

  updated(changedProps: Map<string, any>) {
    if (
      changedProps.has('lines') ||
      changedProps.has('xLabel') ||
      changedProps.has('yLabel') ||
      changedProps.has('tooltipRenderer')
    ) {
      this.draw();
    }
  }

  render() {
    // Only show tooltip if single line mode (exactly one line present)
    const singleLine = !!(this.lines && this.lines.length === 1);
    const showTooltip = this.tooltipRenderer != null && singleLine;
    return html`
      <canvas style="width: 100%; height: 250px;"></canvas>
      ${this.lines && this.lines.length > 0 ? html`
        <div style="display: flex; gap: 1rem; margin-top: 0.5rem; flex-wrap: wrap; justify-content: center; align-items: center;">
          ${this.lines.map((line, index) => line.legend ? html`
            <span 
              style="display: flex; align-items: center; gap: 0.4em; font-size: 0.95em; cursor: pointer; opacity: ${this.hoveredLineIndex !== null && this.hoveredLineIndex !== index ? '0.3' : '1'}; transition: opacity 0.2s ease;"
              @mouseenter=${() => this.handleLegendHover(index)}
              @mouseleave=${() => this.handleLegendLeave()}
            >
              <span style="width: 18px; height: 4px; background: ${line.color || 'var(--primary)' }; display: inline-block; border-radius: 2px;"></span>
              ${line.legend}
            </span>
          ` : null)}
        </div>
      ` : null}
      ${showTooltip && this.hoveredIndex !== null && singleLine && this.lines[0].points[this.hoveredIndex] !== undefined
        ? (() => {
            const singleData = this.lines[0].points;
            const tooltipContent = this.tooltipRenderer
              ? this.tooltipRenderer(singleData[this.hoveredIndex], this.hoveredIndex, singleData)
              : singleData[this.hoveredIndex];
            return html`
              <div
                class="tooltip"
                style="left:${this.mouseX}px; top:${this.mouseY}px;"
              >
                ${tooltipContent}
              </div>
            `;
          })()
        : null}
    `;
  }

  private getColor(variableName: string): string {
    const style = getComputedStyle(this);
    return style.getPropertyValue(`--${variableName}`)?.trim() || '#fff';
  }

  private getMinMax(): { min: number; max: number; range: number } {
    let min: number, max: number;
    let values: number[] = [];
    // If there are any lines, include all their points' values
    if (this.lines && this.lines.length > 0) {
      for (const line of this.lines) {
        values = values.concat(line.points.map(d => d.value));
      }
    }
    // If no values, return sensible defaults
    if (values.length === 0) {
      return { min: 0, max: 1, range: 1 };
    }
    min = Math.min(...values);
    max = Math.max(...values);
    const range = max - min || 1;
    return { min, max, range };
  }

  private getPointPosition(
    i: number, 
    total: number, 
    value: number, 
    layout: { w: number; h: number; pad: number; topPad: number; yLabelGap: number },
    scale: { min: number; range: number }
  ): { x: number, y: number } {
    const { w, h, pad, topPad, yLabelGap } = layout;
    const { min, range } = scale;
    // If only one point, center it horizontally to avoid division by zero
    const x = total <= 1 ? pad + yLabelGap + w / 2 : pad + yLabelGap + (i / (total - 1)) * w;
    const y = topPad + h - ((value - min) / range) * h;
    return { x, y };
  }

  private attachCanvasEvents() {
    const canvas = this.renderRoot.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;

    // Remove previous listeners if any
    canvas.onmousemove = null;
    canvas.onmouseleave = null;

    canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
  }

  private handleMouseMove(e: MouseEvent) {
    const canvas = this.renderRoot.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.lines && this.lines.length > 1) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const cssWidth = canvas.clientWidth || 400;
    const cssHeight = canvas.clientHeight || 250;
    const pad = 20;
    // If annotationRenderer is provided, reserve extra top/right padding for labels
    const hasAnnotations = typeof this.annotationRenderer === 'function';
    const topPad = hasAnnotations ? 40 : pad;
    const rightPad = hasAnnotations ? 50 : pad;
    const yLabelGap = 18;
    const xLabelGap = 20;
    const w = cssWidth - pad - rightPad - 6; // Account for dot radius
    const h = cssHeight - topPad - pad - xLabelGap;

    const { min, range } = this.getMinMax();

    // Mouse position relative to canvas
    const mouseX = (e.clientX - rect.left) / (rect.width / cssWidth);

    // Single line mode - tooltip support (exactly one line)
    const singleData = (this.lines && this.lines.length === 1) ? this.lines[0].points : [];
    if (singleData.length === 0) return;

    // Calculate data point positions
    const points = singleData.map((d, i) => this.getPointPosition(i, singleData.length, d.value, { w, h, pad, topPad, yLabelGap }, { min, range }));

    // Find closest point along the x-axis (hover anywhere on graph)
    let closestIndex = 0;
    let closestDistance = Math.abs(mouseX - points[0].x);
    
    for (let i = 1; i < points.length; ++i) {
      const distance = Math.abs(mouseX - points[i].x);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    }

    // Show tooltip for the closest point
    this.hoveredIndex = closestIndex;
    this.mouseX = points[closestIndex].x;
    this.mouseY = points[closestIndex].y;
    this.requestUpdate();
  }

  private handleMouseLeave() {
    this.hoveredIndex = null;
    this.hoveredLineIndex = null;
    this.requestUpdate();
  }

  private handleLegendHover(index: number) {
    this.hoveredLineIndex = index;
    this.requestUpdate();
    this.draw();
  }

  private handleLegendLeave() {
    this.hoveredLineIndex = null;
    this.requestUpdate();
    this.draw();
  }

  draw() {
    const canvas = this.renderRoot.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina/HiDPI support
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = canvas.clientWidth || 400;
    const cssHeight = canvas.clientHeight || 250;
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    // Padding - add extra top and right padding if value labels are shown
    const pad = 20;
    const hasAnnotations = typeof this.annotationRenderer === 'function';
    const topPad = hasAnnotations ? 40 : pad;
    const rightPad = hasAnnotations ? 50 : pad;
    const yLabelGap = 18;
    const xLabelGap = 20;
    const dotRadius = 6;
    const w = cssWidth - pad - rightPad - dotRadius;
    const h = cssHeight - topPad - pad - xLabelGap;

    // Shared min/max/range (include max so Y-axis labels can use it)
    const { min, max, range } = this.getMinMax();

    // Draw axes
    ctx.save();
    ctx.strokeStyle = this.getColor('secondary');
    ctx.lineWidth = 1;
    // Y axis
    ctx.beginPath();
    ctx.moveTo(pad + yLabelGap, topPad);
    ctx.lineTo(pad + yLabelGap, topPad + h);
    ctx.stroke();
    // X axis
    ctx.beginPath();
    ctx.moveTo(pad + yLabelGap, topPad + h);
    ctx.lineTo(pad + yLabelGap + w, topPad + h);
    ctx.stroke();
    ctx.restore();

    // Draw axis labels (monospace)
    ctx.save();
    ctx.font = "12px monospace";
    ctx.fillStyle = this.getColor('primary');

    // X label (centred, with gap below axis)
    if (this.xLabel) {
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(this.xLabel, pad + yLabelGap + w / 2, topPad + h + xLabelGap / 2);
    }

    // Y label (vertical, left of Y axis, with gap)
    if (this.yLabel) {
      ctx.save();
      ctx.translate(pad, topPad + h / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(this.yLabel, 0, 0);
      ctx.restore();
    }

    // Draw axis tick labels if enabled
    if (this.showAxisTicks) {
      ctx.font = "11px monospace";
      ctx.fillStyle = this.getColor('secondary');
      
      // Y axis ticks - use computed min/max so that gridlines can define the visible range
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      // Bottom tick (min)
      ctx.fillText(min.toFixed(), pad + yLabelGap - 5, topPad + h);
      // Top tick (max)
      ctx.fillText(max.toFixed(), pad + yLabelGap - 5, topPad);
    }
    
    ctx.restore();

    this.lines.forEach((line, lineIndex) => {
      this.drawLine(ctx, line, lineIndex, { w, h, pad, topPad, yLabelGap }, { min, range });
    });

    const singleDataForDraw = (this.lines && this.lines.length === 1) ? this.lines[0].points : [];
    if (this.dotColorRenderer != null) {
      this.drawDots(ctx, singleDataForDraw, { w, h, pad, topPad, yLabelGap }, { min, range }, dotRadius);
    }

    if (this.annotationRenderer != null) {
      this.drawAnnotations(ctx, singleDataForDraw, { w, h, pad, topPad, yLabelGap }, { min, range });
    }
  }

  private drawAnnotations(
    ctx: CanvasRenderingContext2D,
    singleDataForDraw: DataPoint[],
    layout: { w: number; h: number; pad: number; topPad: number; yLabelGap: number },
    scale: { min: number; range: number }
  ) {
    const { w, h, pad, topPad, yLabelGap } = layout;
    const { min, range } = scale;// Support CSS variable colors
    ctx.save();
    ctx.font = "10px monospace";
    ctx.fillStyle = this.getColor('secondary');
    
    singleDataForDraw.forEach((d, i) => {
      if (i === 0) return;
      const { x, y } = this.getPointPosition(i, singleDataForDraw.length, d.value, { w, h, pad, topPad, yLabelGap }, { min, range });
      // Ask renderer for an annotation string
      const annotation = this.annotationRenderer ? this.annotationRenderer(d, i, singleDataForDraw) : null;
      if (!annotation) return;

      // Rotate text 45 degrees and position it to the top-right of the dot
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-Math.PI / 4); // -45 degrees
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(annotation, 8, -8);
      ctx.restore();
    });
    ctx.restore();
  }

  private drawLine(
    ctx: CanvasRenderingContext2D,
    line: LineData,
    lineIndex: number,
    layout: { w: number; h: number; pad: number; topPad: number; yLabelGap: number },
    scale: { min: number; range: number }
  ) {
    const { w, h, pad, topPad, yLabelGap } = layout;
    const { min, range } = scale;// Support CSS variable colors
    let color = line.color || this.getColor('primary');
    if (color.startsWith('var(')) {
      // Extract variable name and remove -- prefix
      const varName = color.match(/var\((--[a-zA-Z0-9_-]+)\)/)?.[1];
      if (varName) color = this.getColor(varName.substring(2)); // Remove '--' prefix
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = line.lineWidth || 2;
    
    // Calculate opacity based on hover state
    let opacity = line.opacity ?? 1;
    if (this.hoveredLineIndex !== null && this.hoveredLineIndex !== lineIndex) {
      opacity *= 0.2; // Dim non-hovered lines
    }
    ctx.globalAlpha = opacity;
    
    // Set line dash if specified
    if (line.dashed) {
      ctx.setLineDash([5, 5]);
    } else {
      ctx.setLineDash([]);
    }

    // Draw straight line segments, breaking on null values
    ctx.beginPath();
    let pathStarted = false;
    line.points.forEach((d, i) => {
      if (d.value === null || d.value === undefined || isNaN(d.value)) {
        // Stop drawing when we hit a null value
        if (pathStarted) {
          ctx.stroke();
          pathStarted = false;
        }
      } else {
        const { x, y } = this.getPointPosition(i, line.points.length, d.value, { w, h, pad, topPad, yLabelGap }, { min, range });
        if (!pathStarted) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          pathStarted = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
    });
    
    // Stroke any remaining path
    if (pathStarted) {
      ctx.stroke();
    }
    
    // Reset global alpha for next line
    ctx.globalAlpha = 1;
  }

  private drawDots(
    ctx: CanvasRenderingContext2D,
    singleDataForDraw: DataPoint[],
    layout: { w: number; h: number; pad: number; topPad: number; yLabelGap: number },
    scale: { min: number; range: number },
    dotRadius: number
  ) {
    const { w, h, pad, topPad, yLabelGap } = layout;
    const { min, range } = scale;// Support CSS variable colors
    ctx.save();

    singleDataForDraw.forEach((d, i) => {
      if (i === 0) return;
      const { x, y } = this.getPointPosition(i, singleDataForDraw.length, d.value, { w, h, pad, topPad, yLabelGap }, { min, range });
      
      // Dim non-hovered dots when hovering
      const isDimmed = this.hoveredIndex !== null && this.hoveredIndex !== i;
      ctx.globalAlpha = isDimmed ? 0.3 : 1;
      
      ctx.fillStyle = this.dotColorRenderer
        ? this.getColor(this.dotColorRenderer(d)) || this.getColor('primary')
        : this.getColor('primary');
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
      if (this.hoveredIndex === i) {
        ctx.save();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
      }
    });
    ctx.globalAlpha = 1; // Reset alpha
    ctx.restore();
  }
}
