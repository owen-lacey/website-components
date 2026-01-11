import { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * Shared state for scores that can be accessed across multiple components.
 * This singleton ensures all components share the same scores array.
 */
class ScoresState {
  private static instance: ScoresState;
  private _scores: number[] = [];
  private readonly subscribers = new Set<ReactiveControllerHost>();

  private constructor() {}

  static getInstance(): ScoresState {
    if (!ScoresState.instance) {
      ScoresState.instance = new ScoresState();
    }
    return ScoresState.instance;
  }

  subscribe(host: ReactiveControllerHost): void {
    this.subscribers.add(host);
  }

  unsubscribe(host: ReactiveControllerHost): void {
    this.subscribers.delete(host);
  }

  private notifySubscribers(): void {
    for (const host of this.subscribers) {
      host.requestUpdate();
    }
  }

  get scores(): number[] {
    return this._scores;
  }

  addScore(score: number): void {
    this._scores.push(score);
    this.notifySubscribers();
  }

  setScores(scores: number[]): void {
    this._scores = [...scores];
    this.notifySubscribers();
  }

  clearScores(): void {
    this._scores = [];
    this.notifySubscribers();
  }

  get lastScore(): number | undefined {
    if (this._scores.length === 0) return undefined;
    return this._scores[this._scores.length - 1];
  }

  get average(): number {
    if (this._scores.length === 0) return 0;
    return this._scores.reduce((a, b) => a + b, 0) / this._scores.length;
  }

  get count(): number {
    return this._scores.length;
  }
}

/**
 * A ReactiveController that manages and persists a shared scores array.
 * Multiple LitElements can use this controller to share the same scores state,
 * even when they are siblings in the DOM.
 */
export class ScoresController implements ReactiveController {
  private readonly host: ReactiveControllerHost;
  private readonly state: ScoresState;

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    this.state = ScoresState.getInstance();
    host.addController(this);
  }

  hostConnected() {
    this.state.subscribe(this.host);
  }

  hostDisconnected() {
    this.state.unsubscribe(this.host);
  }

  /**
   * Get the current scores array
   */
  get scores(): number[] {
    return this.state.scores;
  }

  /**
   * Add a new score to the array
   */
  addScore(score: number): void {
    this.state.addScore(score);
  }

  /**
   * Set the entire scores array
   */
  setScores(scores: number[]): void {
    this.state.setScores(scores);
  }

  /**
   * Clear all scores
   */
  clearScores(): void {
    this.state.clearScores();
  }

  /**
   * Get the last score in the array
   */
  get lastScore(): number | undefined {
    return this.state.lastScore;
  }

  /**
   * Get the average of all scores
   */
  get average(): number {
    return this.state.average;
  }

  /**
   * Get the number of scores recorded
   */
  get count(): number {
    return this.state.count;
  }
}
