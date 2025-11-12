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

/**
 * Game phase enum representing the lifecycle of a game
 */
export enum GamePhase {
  NOT_STARTED = 'NOT_STARTED',
  DECK_SELECTION = 'DECK_SELECTION',
  CARD_DRAWN = 'CARD_DRAWN',
  PLAYING = 'PLAYING',
  TURN_ENDED = 'TURN_ENDED',
  GAME_ENDED = 'GAME_ENDED'
}

/**
 * Complete unified game state interface
 * Single source of truth for all game state
 */
export interface CompleteGameState {
  // Player state
  players: string[];
  currentPlayerIndex: number;

  // Card state
  currentSubject: string;
  currentRole: string;
  selectedSubjectDeckInRound: string[];
  availableRoles: string[];

  // Change tracking
  hasChangedRole: boolean;
  hasChangedSubject: boolean;

  // Timer state
  timeRemaining: number;
  isPlaying: boolean;

  // Configuration
  config: GameConfig | null;

  // Lifecycle state
  phase: GamePhase;
}

/**
 * Game initialization data returned by GameInitializationService
 */
export interface GameInitializationData {
  roles: string[];
  decks: Deck[];
  config: GameConfig;
}
