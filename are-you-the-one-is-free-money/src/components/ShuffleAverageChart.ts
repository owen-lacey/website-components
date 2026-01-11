import { css, html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { ScoresController } from '../controllers/scores-controller.js';

export interface DataPoint { value: number }
export interface LineData {
  points: DataPoint[];
  color?: string;
  legend?: string;
  dashed?: boolean;
  lineWidth?: number;
  opacity?: number;
}

/**
 * Displays a line chart tracking the cumulative average score over time.
 * Uses the shared ScoresController to access scores across components.
 */
@customElement('o-shuffle-average-chart')
export class ShuffleAverageChart extends LitElement {
  static readonly styles = css`
    :host {
      display: block;
      width: 100%;
    }

    .chart-container {
      width: 100%;
      overflow-x: auto;
      overflow-y: hidden;
    }

    o-line-graph {
      display: block;
      min-width: 100%;
    }

    .empty {
      color: var(--secondary, #666);
      font-style: italic;
      text-align: center;
      padding: 32px 16px;
      background: var(--entry, #f5f5f5);
      border-radius: 8px;
    }
  `;

  private readonly scoresController = new ScoresController(this);
  
  @state()
  private chartData: DataPoint[] = [];
  
  connectedCallback(): void {
    super.connectedCallback();
    this.updateChartData();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
  }

  updated(changedProperties: Map<string, any>): void {
    super.updated(changedProperties);
    
    // Check if scores changed
    const previousScores = changedProperties.get('scoresController');
    if (previousScores !== undefined || changedProperties.size === 0) {
      this.updateChartData();
    }
  }

  private updateChartData(): void {
    const scores = this.scoresController.scores;
    if (scores.length === 0) {
      this.chartData = [];
      this.drawChart();
      return;
    }
    // Calculate cumulative average for each point
    const data: DataPoint[] = [];
    let sum = 0;
    for (let i = 0; i < scores.length; i++) {
      sum += scores[i];
      const cumulativeAverage = sum / (i + 1);
      data.push({ value: cumulativeAverage });
    }
    this.chartData = data;
    this.drawChart();
  }

  render() {
    return html`
      <div class="chart-container">
        <canvas id="chart-canvas" style="width: 100%; height: 250px;"></canvas>
      </div>
    `;
  }
  firstUpdated() {
    this.drawChart();
  }

  private getColor(variableName: string): string {
    const style = getComputedStyle(this);
    return style.getPropertyValue(`--${variableName}`)?.trim() || '#fff';
  }

  private drawChart() {
    const canvas = this.renderRoot.querySelector('#chart-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina/HiDPI support
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = canvas.clientWidth || 400;
    const cssHeight = canvas.clientHeight || 250;
    if (canvas.width !== cssWidth * dpr || canvas.height !== cssHeight * dpr) {
      canvas.width = cssWidth * dpr;
      canvas.height = cssHeight * dpr;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, cssWidth, cssHeight);

    // Layout
    const pad = 20;
    const topPad = pad;
    const rightPad = 40; // Increased right pad for dot/label visibility
    const yLabelGap = 18;
    const xLabelGap = 20;
    const dotRadius = 6;
    const w = cssWidth - pad - rightPad - dotRadius;
    const h = cssHeight - topPad - pad - xLabelGap;

    // Y axis min/max
    const minY = 0;
    const maxY = 6;
    const range = maxY - minY || 1;

    // Draw axes
    ctx.save();
    ctx.setLineDash([]);
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

    // Axis labels
    ctx.save();
    ctx.font = "12px monospace";
    ctx.fillStyle = this.getColor('primary');
    // Y label
    ctx.save();
    ctx.translate(pad, topPad + h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Average Score", 0, 0);
    ctx.restore();

    // Axis ticks
    ctx.font = "11px monospace";
    ctx.fillStyle = this.getColor('secondary');
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(minY.toFixed(), pad + yLabelGap - 5, topPad + h);
    ctx.fillText(maxY.toFixed(), pad + yLabelGap - 5, topPad);
    ctx.restore();

    // Draw static line (target)
    // Draw a dashed line at y=1 
    let color = this.getColor('green');
    if (color.startsWith('var(')) {
      const varName = color.match(/var\((--[a-zA-Z0-9_-]+)\)/)?.[1];
      if (varName) color = this.getColor(varName.substring(2));
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(pad + yLabelGap, topPad + h - ((1 - minY) / range) * h);
    ctx.lineTo(pad + yLabelGap + w, topPad + h - ((1 - minY) / range) * h);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = "11px monospace";
    ctx.fillStyle = this.getColor('green');
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText("1", pad + yLabelGap - 5, topPad + h - ((1 - minY) / range) * h);

    this.drawLine(ctx, { points: this.chartData, color: 'var(--primary)' }, { w, h, pad, topPad, yLabelGap }, { min: minY, range });
  }

  private drawLine(
    ctx: CanvasRenderingContext2D,
    line: LineData,
    layout: { w: number; h: number; pad: number; topPad: number; yLabelGap: number },
    scale: { min: number; range: number }
  ) {
    const { w, h, pad, topPad, yLabelGap } = layout;
    const { min, range } = scale;
    let color = line.color || this.getColor('primary');
    if (color.startsWith('var(')) {
      const varName = color.match(/var\((--[a-zA-Z0-9_-]+)\)/)?.[1];
      if (varName) color = this.getColor(varName.substring(2));
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = line.lineWidth || 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (line.points.length === 0) return;
    
    // Calculate sliding window
    const pointSpacing = 10; // pixels between points
    const maxPoints = Math.floor(w / pointSpacing);
    const startIndex = Math.max(0, line.points.length - maxPoints);
    const windowedPoints = line.points.slice(startIndex);
    
    // Filter out invalid points and create coordinate arrays
    const validPoints: Array<{ x: number; y: number }> = [];
    windowedPoints.forEach((d, i) => {
      if (d.value !== null && d.value !== undefined && !isNaN(d.value)) {
        const x = pad + yLabelGap + i * pointSpacing;
        const y = topPad + h - ((d.value - min) / range) * h;
        validPoints.push({ x, y });
      }
    });
    
    if (validPoints.length === 0) return;
    
    ctx.beginPath();
    ctx.moveTo(validPoints[0].x, validPoints[0].y);
    
    // Draw smooth curves using quadratic bezier curves
    for (let i = 1; i < validPoints.length; i++) {
      const current = validPoints[i];
      const previous = validPoints[i - 1];
      
      // Calculate control point for smooth curve
      // Place it at the midpoint between current and previous
      const cpX = (previous.x + current.x) / 2;
      const cpY = (previous.y + current.y) / 2;
      
      // Use quadratic curve for smooth transition
      ctx.quadraticCurveTo(previous.x, previous.y, cpX, cpY);
    }
    
    // Draw final segment to last point
    if (validPoints.length > 1) {
      const last = validPoints[validPoints.length - 1];
      ctx.lineTo(last.x, last.y);
    }
    
    ctx.stroke();

    // Add a dot at the last point
    const lastPoint = validPoints[validPoints.length - 1];
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(lastPoint.x, lastPoint.y, 4, 0, Math.PI * 2);
    ctx.fill();
    // Give the text some background
    ctx.fillStyle = this.getColor('theme');
    ctx.fillRect(lastPoint.x + 4, lastPoint.y - 11, 32, 20);
    // Annotate the last dot with the average score
    ctx.font = "11px monospace";
    ctx.fillStyle = this.getColor('primary');
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const lastValue = line.points[line.points.length - 1].value;
    ctx.fillText(lastValue.toFixed(2), lastPoint.x + 6, lastPoint.y);
  }
}
