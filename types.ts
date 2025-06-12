
export interface Pipe {
  id: number;
  x: number;
  gapY: number; // Center Y position of the gap
  scored: boolean;
}

export enum GameStatus {
  Ready = 'READY',
  Playing = 'PLAYING',
  GameOver = 'GAME_OVER',
}