export interface RaffleConfig {
  min: number;
  max: number;
  excluded: number[];
  volume: number;
}

export interface WheelItem {
  value: number;
  color: string;
  textColor: string;
}

export interface SpinResult {
  winner: number;
  rotation: number;
}