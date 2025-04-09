export interface GameConfig {
  players: string[];
  selectedDecks: string[];
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  subjects: string[];
  roles: string[];
}

export interface GameState {
  currentPlayer: string;
  currentSubject: string;
  currentRole: string;
  timeRemaining: number;
  isPlaying: boolean;
}
