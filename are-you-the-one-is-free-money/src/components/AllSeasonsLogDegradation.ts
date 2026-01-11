import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import { LineData } from "../primitives/lineGraph";

@customElement('o-all-seasons-log-degradation')
export class AllSeasonsLogDegradation extends LitElement {
  private readonly lines: LineData[] = [
    {
      points: [
        { value: 1.000 }, { value: 0.993 }, { value: 0.882 }, { value: 0.876 }, { value: 0.573 }, { value: 0.559 }, { value: 0.476 }, { value: 0.450 }, { value: 0.328 }, { value: 0.299 }, { value: 0.288 }, { value: 0.210 }, { value: 0.159 }, { value: 0.073 }, { value: 0.073 }, { value: 0.000 }, { value: 0.000 }, { value: 0.000 }, { value: 0.000 }, { value: 0.000 }, { value: 0.000 }
      ],
      color: "var(--red)",
      legend: 'S1'
    },
    {
      points: [
        { value: 1.000 }, { value: 0.993 }, { value: 0.882 }, { value: 0.875 }, { value: 0.732 }, { value: 0.725 }, { value: 0.633 }, { value: 0.629 }, { value: 0.544 }, { value: 0.521 }, { value: 0.444 }, { value: 0.434 }, { value: 0.372 }, { value: 0.367 }, { value: 0.276 }, { value: 0.252 }, { value: 0.208 }, { value: 0.205 }, { value: 0.145 }, { value: 0.092 }, { value: 0.000 }
      ],
      color: "var(--blue)",
      legend: 'S3'
    },
    {
      points: [
        { value: 1.000 }, { value: 0.993 }, { value: 0.810 }, { value: 0.804 }, { value: 0.643 }, { value: 0.610 }, { value: 0.473 }, { value: 0.467 }, { value: 0.357 }, { value: 0.284 }, { value: 0.202 }, { value: 0.191 }, { value: 0.138 }, { value: 0.119 }, { value: 0.000 }, { value: 0.000 }, { value: 0.000 }, { value: 0.000 }, { value: 0.000 }, { value: 0.000 }, { value: 0.000 }
      ],
      color: "var(--teal)",
      legend: 'S4'
    },
    {
      points: [
        { value: 1.000 }, { value: 0.995 }, { value: 0.898 }, { value: 0.887 }, { value: 0.829 }, { value: 0.823 }, { value: 0.646 }, { value: 0.616 }, { value: 0.436 }, { value: 0.392 }, { value: 0.328 }, { value: 0.311 }, { value: 0.292 }, { value: 0.292 }, { value: 0.253 }, { value: 0.219 }, { value: 0.079 }, { value: 0.040 }, { value: 0.000 }, { value: 0.000 }, { value: 0.000 }
      ],
      color: "var(--yellow)",
      legend: 'S5'
    },
    {
      points: [
        { value: 1.000 }, { value: 0.995 }, { value: 0.836 }, { value: 0.818 }, { value: 0.736 }, { value: 0.726 }, { value: 0.661 }, { value: 0.661 }, { value: 0.563 }, { value: 0.539 }, { value: 0.440 }, { value: 0.440 }, { value: 0.350 }, { value: 0.346 }, { value: 0.119 }, { value: 0.063 }, { value: 0.000 }, { value: 0.000 }, { value: 0.000 }, { value: 0.000 }, { value: 0.000 }
      ],
      color: "var(--purple)",
      legend: 'S6'
    },
    {
      points: [
        { value: 1.000 }, { value: 0.995 }, { value: 0.836 }, { value: 0.832 }, { value: 0.718 }, { value: 0.676 }, { value: 0.602 }, { value: 0.598 }, { value: 0.541 }, { value: 0.535 }, { value: 0.425 }, { value: 0.419 }, { value: 0.363 }, { value: 0.359 }, { value: 0.277 }, { value: 0.277 }, { value: 0.201 }, { value: 0.201 }, { value: 0.092 }, { value: 0.040 }, { value: 0.000 }
      ],
      color: "var(--green)",
      legend: 'S7'
    }
  ];

  render() {
    return html`
      <o-line-graph
        xLabel="time"
        .lines=${this.lines}
      ></o-line-graph>
    `;
  }
}
