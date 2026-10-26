export interface GameState {
  playerName: string;
  money: number;
  reputation: number;
  day: number;
  week: number;
  year: number;
  season: string;
  farmSize: number; // in hectares
  level: number;
  levelName: string;
  achievements: string[];
  resources: Resources;
  personnel: Personnel;
  contracts: Contract[];
  events: GameEvent[];
  fields: Field[];
  reactorActive: boolean;
  reactorLevel: number;
  hasISOCert: boolean;
  hasExportLicense: boolean;
  exportMarkets: string[];
  gameStarted: boolean;
  gameWon: boolean;
}

export interface Resources {
  organic: number; // tons
  biogas: number; // m³
  digestate: number; // tons
  harvest: number; // tons
}

export interface Personnel {
  workers: number;
  agronomist: boolean;
  engineer: boolean;
  exportManager: boolean;
  morale: number;
}

export interface Contract {
  id: string;
  name: string;
  client: string;
  amount: number; // tons per week
  price: number; // per ton
  weeksLeft: number;
  active: boolean;
}

export interface GameEvent {
  id: string;
  day: number;
  text: string;
  type: 'positive' | 'negative' | 'neutral';
}

export interface Field {
  id: string;
  crop: string;
  planted: boolean;
  growthDays: number;
  maxGrowthDays: number;
  ready: boolean;
}
