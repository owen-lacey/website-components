import { DataPoint } from "../primitives/lineGraph";

export interface SeasonEvent extends DataPoint {
  type: 'initial' | 'truth booth' | 'match up'
  episode: number;
  result?: string | boolean;
}
