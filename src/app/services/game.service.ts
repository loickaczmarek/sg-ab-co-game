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
    isPlaying: false,
    feedback: {
      positive: '',
      improvement: ''
    }
  });

  private players: string[] = [];
  private timerSubscription: Subscription | null = null;
  private availableSubjects: string[] = [];
  private availableRoles: string[] = [];
  private currentConfig: GameConfig | null = null;
  private selectedSubjectDeckInRound: string[] = [];

  constructor(private deckService: DeckService) {}

  initializeGame(config: GameConfig) {
    this.currentConfig = config;
    this.players = config.players;
    
    // Récupérer les decks sélectionnés
    this.deckService.getDecks().subscribe((decks: Deck[]) => {
      const selectedDecks = decks.filter((deck: Deck) => config.selectedDecks.includes(deck.id));
      
      // Rassembler tous les sujets et rôles des decks sélectionnés
      this.availableSubjects = selectedDecks.flatMap((deck: Deck) => deck.subjects);
      this.availableRoles = selectedDecks.flatMap((deck: Deck) => deck.roles);

      this.gameState.next({
        currentPlayer: this.players[0],
        currentSubject: '',
        currentRole: '',
        timeRemaining: 300, // 5 minutes par défaut
        isPlaying: false,
        feedback: {
          positive: '',
          improvement: ''
        }
      });
    });
  }

  drawCard(): void {
    const state = this.gameState.value;
   

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

  getCurrentPlayer(): string {
    return this.gameState.value.currentPlayer;
  }

  addFeedback(positive: string, improvement: string) {
    const state = this.gameState.value;
    this.gameState.next({
      ...state,
      feedback: {
        positive,
        improvement
      }
    });
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
      timeRemaining: 300, // 5 minutes par défaut
      feedback: {
        positive: '',
        improvement: ''
      }
    });

    this.stopTimer();
  }

  endGame() {
    this.stopTimer();
    this.gameState.next({
      currentPlayer: '',
      currentSubject: '',
      currentRole: '',
      timeRemaining: 0,
      isPlaying: false,
      feedback: {
        positive: '',
        improvement: ''
      }
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
