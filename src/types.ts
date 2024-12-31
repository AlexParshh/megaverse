export type Position = {
  row: number;
  column: number;
};

export type SoloonColor = "blue" | "red" | "purple" | "white";
export type ComethDirection = "up" | "down" | "right" | "left";

export type MapCell = 'SPACE' | 'POLYANET' | 
  `${Uppercase<SoloonColor>}_SOLOON` | 
  `${Uppercase<ComethDirection>}_COMETH`;

export type GoalMap = {
  goal: MapCell[][];
};

export type MegaverseConfig = {
  baseUrl: string;
  candidateId: string;
};

export class MegaverseError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'MegaverseError';
  }
}
