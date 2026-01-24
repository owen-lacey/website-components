import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";

interface DailyData {
  date: string;
  lastfm_hours: number;
  strava_km: number;
  github_commits: number;
  bluesky_posts: number;
}

interface ApiResponse {
  averages: {
    lastfm_hours: number;
    strava_km: number;
    github_commits: number;
    bluesky_posts: number;
  };
  daily: DailyData[];
}

interface ActivityConfig {
  key: keyof Omit<DailyData, 'date'>;
  label: string;
  color: string;
  iconPath: string;
}

// SVG paths for brand icons
const SPOTIFY_ICON = "M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z";
const STRAVA_ICON = "M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169";
const GITHUB_ICON = "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z";
const BLUESKY_ICON = "M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z";

const ACTIVITIES: ActivityConfig[] = [
  { key: 'lastfm_hours', label: 'Spotify', color: '#20D760', iconPath: SPOTIFY_ICON },
  { key: 'strava_km', label: 'Strava', color: '#FC5202', iconPath: STRAVA_ICON },
  { key: 'github_commits', label: 'GitHub', color: '#F0F6FD', iconPath: GITHUB_ICON },
  { key: 'bluesky_posts', label: 'Bluesky', color: '#1283FA', iconPath: BLUESKY_ICON },
];

@customElement('o-activity-graph')
export class ActivityGraph extends LitElement {
  @property({ type: String }) endpoint = "https://api.owenlacey.dev/wubu2";
  @property({ type: Boolean }) animated = true;

  @state() private data: ApiResponse | null = null;
  @state() private animationProgress = 0;
  @state() private hasAnimated = false;
  @state() private error: string | null = null;
  @state() private hoveredActivityIndex: number | null = null;

  private observer: IntersectionObserver | null = null;
  private animationFrame: number | null = null;
  private iconPositions: { x: number; y: number; index: number }[] = [];
  private linePoints: Map<number, { x: number; y: number }[]> = new Map();

  static readonly styles = css`
    :host {
      display: block;
      position: relative;
    }
    canvas {
      width: 100%;
      height: 300px;
      background: transparent;
      display: block;
    }
    .error {
      color: #ff6b6b;
      font-family: monospace;
      font-size: 0.9em;
      text-align: center;
      padding: 1rem;
    }
    .loading {
      color: #888;
      font-family: monospace;
      font-size: 0.9em;
      text-align: center;
      padding: 1rem;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.fetchData();

    if (this.animated) {
      this.setupIntersectionObserver();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.observer?.disconnect();
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  private setupIntersectionObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.hasAnimated && this.data) {
          this.startAnimation();
        }
      },
      { threshold: 0.3 }
    );
    this.observer.observe(this);

    // Check if already visible on load
    const rect = this.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (isVisible && !this.hasAnimated && this.data) {
      this.startAnimation();
    }
  }

  private async fetchData() {
    try {
      const response = await fetch(this.endpoint);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      this.data = await response.json();

      // If not animated or already visible, draw immediately
      if (!this.animated) {
        this.animationProgress = 1;
        this.hasAnimated = true;
      }

      this.requestUpdate();

      // Draw after update
      await this.updateComplete;
      this.draw();

      // Check if visible and should animate (data just loaded)
      if (this.animated && !this.hasAnimated) {
        const rect = this.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (isVisible) {
          this.startAnimation();
        }
      }
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to load data';
    }
  }

  private startAnimation() {
    this.hasAnimated = true;
    const duration = 1500; // 1.5 seconds
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      this.animationProgress = 1 - Math.pow(1 - progress, 3);

      this.draw();

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      }
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  firstUpdated() {
    if (this.data) {
      this.attachCanvasEvents();
      this.draw();
    }
  }

  private attachCanvasEvents() {
    const canvas = this.renderRoot.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;

    canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
  }

  private handleMouseMove(e: MouseEvent) {
    const canvas = this.renderRoot.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.clientWidth / rect.width;
    const scaleY = canvas.clientHeight / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    let foundHover = false;
    let newHoveredIndex: number | null = null;

    // Check if mouse is near any icon first (higher priority)
    const iconRadius = 16;
    for (const icon of this.iconPositions) {
      const distance = Math.hypot(mouseX - icon.x, mouseY - icon.y);
      if (distance <= iconRadius) {
        newHoveredIndex = icon.index;
        foundHover = true;
        break;
      }
    }

    // If not hovering an icon, check if near any line
    if (!foundHover) {
      const lineThreshold = 8; // pixels
      for (const [index, points] of this.linePoints) {
        if (this.isPointNearLine(mouseX, mouseY, points, lineThreshold)) {
          newHoveredIndex = index;
          foundHover = true;
          break;
        }
      }
    }

    if (newHoveredIndex !== this.hoveredActivityIndex) {
      this.hoveredActivityIndex = newHoveredIndex;
      this.draw();
    }

    // Update cursor style
    canvas.style.cursor = foundHover ? 'pointer' : 'default';
  }

  private isPointNearLine(
    px: number,
    py: number,
    points: { x: number; y: number }[],
    threshold: number
  ): boolean {
    for (let i = 0; i < points.length - 1; i++) {
      const dist = this.pointToSegmentDistance(
        px, py,
        points[i].x, points[i].y,
        points[i + 1].x, points[i + 1].y
      );
      if (dist <= threshold) {
        return true;
      }
    }
    return false;
  }

  private pointToSegmentDistance(
    px: number, py: number,
    x1: number, y1: number,
    x2: number, y2: number
  ): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSq = dx * dx + dy * dy;

    if (lengthSq === 0) {
      return Math.hypot(px - x1, py - y1);
    }

    // Project point onto line segment
    let t = ((px - x1) * dx + (py - y1) * dy) / lengthSq;
    t = Math.max(0, Math.min(1, t));

    const nearestX = x1 + t * dx;
    const nearestY = y1 + t * dy;

    return Math.hypot(px - nearestX, py - nearestY);
  }

  private handleMouseLeave() {
    if (this.hoveredActivityIndex !== null) {
      this.hoveredActivityIndex = null;
      this.draw();
    }
  }

  updated(changedProps: Map<string, unknown>) {
    if (changedProps.has('data') && this.data) {
      // Canvas just appeared, attach events
      this.attachCanvasEvents();
      this.draw();
    }
  }

  render() {
    if (this.error) {
      return html`<div class="error">Error: ${this.error}</div>`;
    }

    if (!this.data) {
      return html`<div class="loading">Loading activity data...</div>`;
    }

    return html`<canvas></canvas>`;
  }

  private getNormalizedData(): Map<string, number[]> {
    if (!this.data) return new Map();

    const normalized = new Map<string, number[]>();

    for (const activity of ACTIVITIES) {
      const average = this.data.averages[activity.key];
      const rawValues = this.data.daily.map(day => {
        const value = day[activity.key];
        // Normalize: value / average, so 1.0 = average
        return average > 0 ? value / average : 0;
      });

      // Apply 7-day moving average for smoother lines
      const smoothedValues = this.movingAverage(rawValues, 7);
      normalized.set(activity.key, smoothedValues);
    }

    return normalized;
  }

  private movingAverage(values: number[], windowSize: number): number[] {
    const result: number[] = [];

    for (let i = 0; i < values.length; i++) {
      // Calculate the window bounds (centered, but clamped at edges)
      const halfWindow = Math.floor(windowSize / 2);
      const start = Math.max(0, i - halfWindow);
      const end = Math.min(values.length - 1, i + halfWindow);

      // Calculate the average of the window
      let sum = 0;
      let count = 0;
      for (let j = start; j <= end; j++) {
        sum += values[j];
        count++;
      }

      result.push(sum / count);
    }

    return result;
  }

  private draw() {
    const canvas = this.renderRoot.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas || !this.data) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina/HiDPI support
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = canvas.clientWidth || 400;
    const cssHeight = canvas.clientHeight || 300;
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    // Layout
    const pad = 30;
    const rightPad = 50; // Extra space for icons
    const topPad = 20;
    const bottomPad = 30;
    const w = cssWidth - pad - rightPad;
    const h = cssHeight - topPad - bottomPad;

    const normalizedData = this.getNormalizedData();

    // Find min/max across all normalized data for consistent scaling
    let min = Infinity;
    let max = -Infinity;
    for (const values of normalizedData.values()) {
      for (const v of values) {
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }

    // Add some padding to the range
    const range = max - min || 1;
    min = Math.max(0, min - range * 0.1);
    max = max + range * 0.1;
    const finalRange = max - min;

    // Draw baseline at y=1.0 (average line)
    const baselineY = topPad + h - ((1 - min) / finalRange) * h;
    ctx.save();
    ctx.strokeStyle = 'rgb(155, 156, 157)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(pad, baselineY);
    ctx.lineTo(pad + w, baselineY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Clear positions for hit testing
    this.iconPositions = [];
    this.linePoints.clear();

    // Collect icon data for two-pass rendering (hovered icon on top)
    const iconsToDraw: {
      x: number;
      y: number;
      iconPath: string;
      color: string;
      isHovered: boolean;
      isDimmed: boolean;
      key: string;
      index: number;
    }[] = [];

    // Draw each activity line
    ACTIVITIES.forEach((activity, activityIndex) => {
      const values = normalizedData.get(activity.key);
      if (!values || values.length === 0) return;

      const points = values.map((v, i) => ({
        x: pad + (i / (values.length - 1)) * w,
        y: topPad + h - ((v - min) / finalRange) * h
      }));

      // Store points for hit testing
      this.linePoints.set(activityIndex, points);

      // Determine if this line should be dimmed
      const isHovered = this.hoveredActivityIndex === activityIndex;
      const isDimmed = this.hoveredActivityIndex !== null && !isHovered;

      this.drawSmoothLine(ctx, points, activity.color, this.animationProgress, isDimmed);

      // Collect icon data (only when animation is complete enough)
      if (this.animationProgress > 0.9) {
        const endPoint = points[points.length - 1];
        const iconX = endPoint.x + 18;
        const iconY = endPoint.y;

        // Store icon position for hit testing
        this.iconPositions.push({ x: iconX, y: iconY, index: activityIndex });

        iconsToDraw.push({
          x: iconX,
          y: iconY,
          iconPath: activity.iconPath,
          color: activity.color,
          isHovered,
          isDimmed,
          key: activity.key,
          index: activityIndex
        });
      }
    });

    // Draw icons in two passes: non-hovered first, then hovered on top
    for (const icon of iconsToDraw) {
      if (!icon.isHovered) {
        this.drawIcon(ctx, icon.x, icon.y, icon.iconPath, icon.color, icon.isHovered, icon.isDimmed, icon.key);
      }
    }
    for (const icon of iconsToDraw) {
      if (icon.isHovered) {
        this.drawIcon(ctx, icon.x, icon.y, icon.iconPath, icon.color, icon.isHovered, icon.isDimmed, icon.key);
      }
    }
  }

  private drawSmoothLine(
    ctx: CanvasRenderingContext2D,
    points: { x: number; y: number }[],
    color: string,
    progress: number,
    isDimmed: boolean = false
  ) {
    if (points.length < 2) return;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = isDimmed ? 0.2 : 1;

    // Calculate total path length for animation
    const totalLength = this.calculatePathLength(points);
    const drawLength = totalLength * progress;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    let accumulatedLength = 0;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      // Calculate segment length
      const segmentLength = Math.hypot(p2.x - p1.x, p2.y - p1.y);

      if (accumulatedLength + segmentLength > drawLength) {
        // Partial segment - calculate how much to draw
        const remaining = drawLength - accumulatedLength;
        const segmentProgress = remaining / segmentLength;

        // Draw partial Catmull-Rom segment
        this.drawPartialCatmullRomSegment(ctx, p0, p1, p2, p3, segmentProgress);
        break;
      }

      // Draw full Catmull-Rom segment
      this.drawCatmullRomSegment(ctx, p0, p1, p2, p3);
      accumulatedLength += segmentLength;
    }

    ctx.stroke();
    ctx.restore();
  }

  private calculatePathLength(points: { x: number; y: number }[]): number {
    let length = 0;
    for (let i = 1; i < points.length; i++) {
      length += Math.hypot(points[i].x - points[i-1].x, points[i].y - points[i-1].y);
    }
    return length;
  }

  private drawCatmullRomSegment(
    ctx: CanvasRenderingContext2D,
    p0: { x: number; y: number },
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    p3: { x: number; y: number }
  ) {
    // Convert Catmull-Rom to Bezier control points
    const tension = 0.5;

    const cp1x = p1.x + (p2.x - p0.x) * tension / 3;
    const cp1y = p1.y + (p2.y - p0.y) * tension / 3;
    const cp2x = p2.x - (p3.x - p1.x) * tension / 3;
    const cp2y = p2.y - (p3.y - p1.y) * tension / 3;

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }

  private drawPartialCatmullRomSegment(
    ctx: CanvasRenderingContext2D,
    p0: { x: number; y: number },
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    p3: { x: number; y: number },
    t: number
  ) {
    // Convert Catmull-Rom to Bezier control points
    const tension = 0.5;

    const cp1x = p1.x + (p2.x - p0.x) * tension / 3;
    const cp1y = p1.y + (p2.y - p0.y) * tension / 3;
    const cp2x = p2.x - (p3.x - p1.x) * tension / 3;
    const cp2y = p2.y - (p3.y - p1.y) * tension / 3;

    // Calculate point on Bezier curve at parameter t
    const x = this.bezierPoint(p1.x, cp1x, cp2x, p2.x, t);
    const y = this.bezierPoint(p1.y, cp1y, cp2y, p2.y, t);

    // Split the Bezier curve at t and draw the first part
    const splitCp1x = p1.x + (cp1x - p1.x) * t;
    const splitCp1y = p1.y + (cp1y - p1.y) * t;
    const midCpx = cp1x + (cp2x - cp1x) * t;
    const midCpy = cp1y + (cp2y - cp1y) * t;
    const splitCp2x = splitCp1x + (midCpx - splitCp1x) * t;
    const splitCp2y = splitCp1y + (midCpy - splitCp1y) * t;

    ctx.bezierCurveTo(splitCp1x, splitCp1y, splitCp2x, splitCp2y, x, y);
  }

  private bezierPoint(p0: number, p1: number, p2: number, p3: number, t: number): number {
    const mt = 1 - t;
    return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
  }

  private drawIcon(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    iconPath: string,
    color: string,
    isHovered: boolean = false,
    isDimmed: boolean = false,
    activityKey?: string
  ) {
    ctx.save();

    const iconSize = isHovered ? 18 : 16;
    const backgroundRadius = isHovered ? 16 : 14;
    const scale = iconSize / 24; // Icons are designed for 24x24 viewbox

    ctx.globalAlpha = isDimmed ? 0.3 : 1;

    // Special handling for GitHub (flip colors on hover)
    const isGitHub = activityKey === 'github_commits';

    // Draw circular background
    ctx.beginPath();
    ctx.arc(x, y, backgroundRadius, 0, Math.PI * 2);
    if (isHovered) {
      ctx.fillStyle = isGitHub ? '#fff' : color;
    } else {
      ctx.fillStyle = '#222';
    }
    ctx.fill();

    // Draw border
    ctx.strokeStyle = isGitHub && isHovered ? '#fff' : color;
    ctx.lineWidth = isHovered ? 2 : 1.5;
    ctx.stroke();

    // Draw the icon
    ctx.translate(x - iconSize / 2, y - iconSize / 2);
    ctx.scale(scale, scale);

    if (isHovered) {
      ctx.fillStyle = isGitHub ? '#222' : '#fff';
    } else {
      ctx.fillStyle = color;
    }
    const path = new Path2D(iconPath);
    ctx.fill(path);

    ctx.restore();
  }
}
