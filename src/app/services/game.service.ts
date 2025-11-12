import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { GameConfig, GameState, GamePhase } from '../models/game.interface';
import { GameStateService } from './game-state.service';
import { GameInitializationService } from './game-initialization.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private timerSubscription: Subscription | null = null;

  constructor(
    private gameStateService: GameStateService,
    private gameInitService: GameInitializationService
  ) {}

  initializeGame(config: GameConfig) {
    // Use GameInitializationService instead of direct DeckService access
    this.gameInitService.initializeGameData(config)
      .pipe(first())
      .subscribe(data => {
        this.gameStateService.updateState({
          config,
          players: config.players,
          currentPlayerIndex: 0,
          availableRoles: data.roles,
          currentSubject: '',
          currentRole: '',
          timeRemaining: 300,
          isPlaying: false,
          hasChangedRole: false,
          hasChangedSubject: false,
          phase: GamePhase.DECK_SELECTION,
          selectedSubjectDeckInRound: []
        });
      });
  }

  drawCard(): void {
    const state = this.gameStateService.getState();

    // Tirer un sujet aléatoire
    const subjectIndex = Math.floor(Math.random() * state.selectedSubjectDeckInRound.length);
    const subject = state.selectedSubjectDeckInRound[subjectIndex];

    // Tirer un rôle aléatoire
    const roleIndex = Math.floor(Math.random() * state.availableRoles.length);
    const role = state.availableRoles[roleIndex];

    this.gameStateService.updateState({
      currentSubject: subject,
      currentRole: role,
      hasChangedRole: false,
      hasChangedSubject: false,
      phase: GamePhase.CARD_DRAWN
    });
  }

  changeSubjectCard(): void {
    const state = this.gameStateService.getState();

    if (state.hasChangedSubject || state.isPlaying) {
      return; // Ne permettre qu'un seul changement par tour et pas pendant le jeu
    }

    // Tirer un nouveau sujet aléatoire
    const subjectIndex = Math.floor(Math.random() * state.selectedSubjectDeckInRound.length);
    const subject = state.selectedSubjectDeckInRound[subjectIndex];

    this.gameStateService.updateState({
      currentSubject: subject,
      hasChangedSubject: true
    });
  }

  changeRoleCard(): void {
    const state = this.gameStateService.getState();

    if (state.hasChangedRole || state.isPlaying) {
      return; // Ne permettre qu'un seul changement par tour et pas pendant le jeu
    }

    // Tirer un nouveau rôle aléatoire
    const roleIndex = Math.floor(Math.random() * state.availableRoles.length);
    const role = state.availableRoles[roleIndex];

    this.gameStateService.updateState({
      currentRole: role,
      hasChangedRole: true
    });
  }

  hasChangedRoleCard(): boolean {
    return this.gameStateService.getState().hasChangedRole;
  }

  hasChangedSubjectCard(): boolean {
    return this.gameStateService.getState().hasChangedSubject;
  }

  startTimer(): void {
    this.stopTimer(); // Arrêter le timer existant si présent

    this.gameStateService.updateState({
      isPlaying: true,
      phase: GamePhase.PLAYING
    });

    this.timerSubscription = interval(1000).subscribe(() => {
      const state = this.gameStateService.getState();
      if (state.timeRemaining <= 0) {
        this.stopTimer();
        return;
      }

      this.gameStateService.updateState({
        timeRemaining: state.timeRemaining - 1
      });
    });
  }

  stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;

      this.gameStateService.updateState({
        isPlaying: false,
        phase: GamePhase.TURN_ENDED
      });
    }
  }

  nextPlayer(): void {
    const state = this.gameStateService.getState();
    const nextIndex = (state.currentPlayerIndex + 1) % state.players.length;

    // Si on revient au premier joueur, c'est la fin de la partie
    if (nextIndex === 0) {
      this.endGame();
      return;
    }

    this.stopTimer();

    this.gameStateService.updateState({
      currentPlayerIndex: nextIndex,
      currentSubject: '',
      currentRole: '',
      timeRemaining: 300,
      hasChangedRole: false,
      hasChangedSubject: false,
      phase: GamePhase.DECK_SELECTION
    });
  }

  endGame() {
    this.stopTimer();
    this.gameStateService.updateState({
      currentPlayerIndex: -1,
      currentSubject: '',
      currentRole: '',
      timeRemaining: 0,
      isPlaying: false,
      phase: GamePhase.GAME_ENDED
    });
  }

  getGameState(): Observable<GameState> {
    return this.gameStateService.state$.pipe(
      map(state => ({
        currentPlayer: state.currentPlayerIndex >= 0 && state.currentPlayerIndex < state.players.length
          ? state.players[state.currentPlayerIndex]
          : '',
        currentSubject: state.currentSubject,
        currentRole: state.currentRole,
        timeRemaining: state.timeRemaining,
        isPlaying: state.isPlaying
      }))
    );
  }

  getCurrentConfig(): GameConfig | null {
    return this.gameStateService.getState().config;
  }

  selectSubjectDeck(deckId: string): void {
    // Use GameInitializationService instead of direct DeckService access
    this.gameInitService.getSubjectDeck(deckId)
      .pipe(first())
      .subscribe(subjects => {
        this.gameStateService.updateState({
          selectedSubjectDeckInRound: subjects
        });
      });
  }
}
