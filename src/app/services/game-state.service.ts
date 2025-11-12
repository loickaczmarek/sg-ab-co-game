import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CompleteGameState, GamePhase } from '../models/game.interface';

/**
 * GameStateService manages the complete unified state for the game.
 * This service is the single source of truth for all game state.
 */
@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  private state = new BehaviorSubject<CompleteGameState>(this.getInitialState());

  /**
   * Observable stream of complete game state
   */
  public state$ = this.state.asObservable();

  /**
   * Get the initial state for the game
   */
  private getInitialState(): CompleteGameState {
    return {
      players: [],
      currentPlayerIndex: -1,
      currentSubject: '',
      currentRole: '',
      selectedSubjectDeckInRound: [],
      availableRoles: [],
      hasChangedRole: false,
      hasChangedSubject: false,
      timeRemaining: 300,
      isPlaying: false,
      config: null,
      phase: GamePhase.NOT_STARTED
    };
  }

  /**
   * Update state immutably with partial state changes
   * @param partial - Partial state to merge with current state
   */
  updateState(partial: Partial<CompleteGameState>): void {
    this.state.next({ ...this.state.value, ...partial });
  }

  /**
   * Reset state to initial values
   */
  resetState(): void {
    this.state.next(this.getInitialState());
  }

  /**
   * Get current state snapshot (not reactive)
   * @returns Current state value
   */
  getState(): CompleteGameState {
    return this.state.value;
  }

  /**
   * Selector: Get current player name as Observable
   * @returns Observable of current player name
   */
  getCurrentPlayer$(): Observable<string> {
    return this.state$.pipe(
      map(state => {
        if (state.currentPlayerIndex >= 0 && state.currentPlayerIndex < state.players.length) {
          return state.players[state.currentPlayerIndex];
        }
        return '';
      })
    );
  }

  /**
   * Selector: Get current game phase as Observable
   * @returns Observable of game phase
   */
  getPhase$(): Observable<GamePhase> {
    return this.state$.pipe(map(state => state.phase));
  }

  /**
   * Selector: Get isPlaying status as Observable
   * @returns Observable of isPlaying boolean
   */
  isPlaying$(): Observable<boolean> {
    return this.state$.pipe(map(state => state.isPlaying));
  }

  /**
   * Selector: Get time remaining as Observable
   * @returns Observable of time remaining in seconds
   */
  getTimeRemaining$(): Observable<number> {
    return this.state$.pipe(map(state => state.timeRemaining));
  }
}
