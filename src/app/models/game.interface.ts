export interface GameConfig {
  players: string[];
  selectedDecks: string[];
  timePerRound?: number;
}

export interface Player {
  name: string;
  role: string;
  feedback: Feedback[];
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
  feedback: {
    positive: string;
    improvement: string;
  };
}

export interface Feedback {
  positivePoints: string;
  areasForImprovement: string;
  timestamp: number;
} 