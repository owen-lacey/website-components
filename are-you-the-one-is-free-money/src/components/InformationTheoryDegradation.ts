import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { LineData } from "../primitives/lineGraph";
import { informationTheoryData } from "../data/aytoData";

@customElement('o-information-theory-degradation')
export class InformationTheoryDegradation extends LitElement {
  private readonly lines: LineData[] = [];

  constructor() {
    super();
    
    for (const seriesValues of informationTheoryData) {
      const points = [];
      for (let row = 0; row < Math.min(seriesValues.length, 20); row++) {
        const value = seriesValues[row];
        if (!isNaN(value)) {
          points.push({ x: row, value });
        }
      }
      
      if (points.length > 0) {
        this.lines.push({
          points,
          color: "var(--secondary)",
          opacity: 0.1
        });
      }
    }

    const randomTrendline = this.getRandomTrendline();
    this.lines.push(randomTrendline);

    const actualTrendline = this.getActualTrendline();
    this.lines.push(actualTrendline);

    const informationTheoryTrendline = this.getInformationTheoryTrendline();
    this.lines.push(informationTheoryTrendline);
  }

  private getInformationTheoryTrendline(): LineData {
    const trendlineValues = [
      1,
      0.9270343013,
      0.8540686026,
      0.7811029039,
      0.7081372051,
      0.6351715064,
      0.5622058077,
      0.489240109,
      0.4162744103,
      0.3433087116,
      0.2703430128,
      0.1973773141,
      0.1244116154,
      0.05144591669,
      0,
      null,
      null,
      null,
      null,
      null
    ];
    
    const trendlinePoints = trendlineValues.map((value, index) => ({
      x: index,
      value
    }));

    return {
      points: trendlinePoints,
      color: "var(--green)",
      legend: 'Information Theory',
      dashed: true,
      lineWidth: 3
    };
  }

  private getRandomTrendline(): LineData {
    const trendlineValues = [
      1,
      0.9440137406,
      0.8880274812,
      0.8320412218,
      0.7760549624,
      0.720068703,
      0.6640824436,
      0.6080961843,
      0.5521099249,
      0.4961236655,
      0.4401374061,
      0.3841511467,
      0.3281648873,
      0.2721786279,
      0.2161923685,
      0.1602061091,
      0.1042198497,
      0.04823359033,
      0,
      null
    ];
    
    const trendlinePoints = trendlineValues.map((value, index) => ({
      x: index,
      value
    }));

    return {
      points: trendlinePoints,
      color: "var(--blue)",
      legend: 'Random',
      dashed: true,
      lineWidth: 3
    };
  }

  private getActualTrendline(): LineData {
    const trendlineValues = [
      1,
      0.9362123766,
      0.8724247532,
      0.8086371298,
      0.7448495064,
      0.681061883,
      0.6172742596,
      0.5534866362,
      0.4896990128,
      0.4259113893,
      0.3621237659,
      0.2983361425,
      0.2345485191,
      0.1707608957,
      0.1069732723,
      0.04318564891,
      0,
      null,
      null,
      null
    ];
    
    const trendlinePoints = trendlineValues.map((value, index) => ({
      x: index,
      value
    }));

    return {
      points: trendlinePoints,
      color: "var(--red)",
      legend: 'Actual',
      dashed: true,
      lineWidth: 3
    };
  }

  render() {
    return html`
      <o-line-graph
        xLabel="time"
        .lines=${this.lines}
      ></o-line-graph>
    `;
  }
}
