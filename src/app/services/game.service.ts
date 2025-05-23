import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subscription, config } from 'rxjs';
import { GameConfig, GameState, Deck } from '../models/game.interface';
import { DeckService } from './deck.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private gameState = new BehaviorSubject<GameState>({
    currentPlayer: '',
    currentSubject: '',
    currentRole: '',
    timeRemaining: 300, // 5 minutes par défaut
    isPlaying: false
  });

  private players: string[] = [];
  private timerSubscription: Subscription | null = null;
  private availableRoles: string[] = [];
  private currentConfig: GameConfig | null = null;
  private selectedSubjectDeckInRound: string[] = [];
  private hasChangedRole: boolean = false;
  private hasChangedSubject: boolean = false;

  constructor(private deckService: DeckService) {}

  initializeGame(config: GameConfig) {
    this.currentConfig = config;
    this.players = config.players;
    this.hasChangedRole = false;
    this.hasChangedSubject = false;

    // Récupérer les decks sélectionnés
    this.deckService.getDecks().subscribe((decks: Deck[]) => {
      const selectedDecks = decks.filter((deck: Deck) => config.selectedDecks.includes(deck.id));

      // Rassembler tous les rôles des decks sélectionnés
      this.availableRoles = selectedDecks.flatMap((deck: Deck) => deck.roles);

      this.gameState.next({
        currentPlayer: this.players[0],
        currentSubject: '',
        currentRole: '',
        timeRemaining: 300, // 5 minutes par défaut
        isPlaying: false
      });
    });
  }

  drawCard(): void {
    const state = this.gameState.value;
    this.hasChangedRole = false;
    this.hasChangedSubject = false;

    // Tirer un sujet aléatoire
    const subjectIndex = Math.floor(Math.random() * this.selectedSubjectDeckInRound.length);
    const subject = this.selectedSubjectDeckInRound[subjectIndex];

    // Tirer un rôle aléatoire
    const roleIndex = Math.floor(Math.random() * this.availableRoles.length);
    const role = this.availableRoles[roleIndex];

    this.gameState.next({
      ...state,
      currentSubject: subject,
      currentRole: role,
      timeRemaining: state.timeRemaining // Garder le même temps
    });
  }

  changeSubjectCard(): void {
    if (this.hasChangedSubject || this.gameState.value.isPlaying) {
      return; // Ne permettre qu'un seul changement par tour et pas pendant le jeu
    }

    const state = this.gameState.value;

    // Tirer un nouveau sujet aléatoire
    const subjectIndex = Math.floor(Math.random() * this.selectedSubjectDeckInRound.length);
    const subject = this.selectedSubjectDeckInRound[subjectIndex];

    this.gameState.next({
      ...state,
      currentSubject: subject
    });

    this.hasChangedSubject = true;
  }

  changeRoleCard(): void {
    if (this.hasChangedRole || this.gameState.value.isPlaying) {
      return; // Ne permettre qu'un seul changement par tour et pas pendant le jeu
    }

    const state = this.gameState.value;

    // Tirer un nouveau rôle aléatoire
    const roleIndex = Math.floor(Math.random() * this.availableRoles.length);
    const role = this.availableRoles[roleIndex];

    this.gameState.next({
      ...state,
      currentRole: role
    });

    this.hasChangedRole = true;
  }

  hasChangedRoleCard(): boolean {
    return this.hasChangedRole;
  }

  hasChangedSubjectCard(): boolean {
    return this.hasChangedSubject;
  }

  startTimer(): void {
    this.stopTimer(); // Arrêter le timer existant si présent

    const state = this.gameState.value;
    this.gameState.next({
      ...state,
      isPlaying: true
    });

    this.timerSubscription = interval(1000).subscribe(() => {
      const state = this.gameState.value;
      if (state.timeRemaining <= 0) {
        this.stopTimer();
        return;
      }

      this.gameState.next({
        ...state,
        timeRemaining: state.timeRemaining - 1
      });
    });
  }

  stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;

      const state = this.gameState.value;
      this.gameState.next({
        ...state,
        isPlaying: false
      });
    }
  }

  nextPlayer(): void {
    const state = this.gameState.value;
    const currentIndex = this.players.indexOf(state.currentPlayer);
    const nextIndex = (currentIndex + 1) % this.players.length;

    // Si on revient au premier joueur, c'est la fin de la partie
    if (nextIndex === 0) {
      this.endGame();
      return;
    }

    this.gameState.next({
      ...state,
      currentPlayer: this.players[nextIndex],
      currentSubject: '',
      currentRole: '',
      timeRemaining: 300 // 5 minutes par défaut
    });

    this.stopTimer();
    this.hasChangedRole = false;
    this.hasChangedSubject = false;
  }

  endGame() {
    this.stopTimer();
    this.gameState.next({
      currentPlayer: '',
      currentSubject: '',
      currentRole: '',
      timeRemaining: 0,
      isPlaying: false
    });
  }

  getGameState(): Observable<GameState> {
    return this.gameState.asObservable();
  }

  getCurrentConfig(): GameConfig | null {
    return this.currentConfig;
  }

  selectSubjectDeck(deckId: string): void {
    this.deckService.getDecks().subscribe(decks => {
      const selectedDeck = decks.find(deck => deck.id === deckId);
      if (selectedDeck) {
        this.selectedSubjectDeckInRound = selectedDeck.subjects;
      }
    });
  }
}
