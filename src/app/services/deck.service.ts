import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { first, catchError } from 'rxjs/operators';
import { Deck } from '../models/game.interface';

@Injectable({
  providedIn: 'root'
})
export class DeckService {
  private decks = new BehaviorSubject<Deck[]>([]);
  private readonly STORAGE_KEY = 'game_decks';

  constructor(private http: HttpClient) {
    this.loadDecks();
  }

  private loadDecks(): void {
    // Charger d'abord depuis le stockage local
    const storedDecks = localStorage.getItem(this.STORAGE_KEY);
    if (storedDecks) {
      try {
        const parsedDecks = JSON.parse(storedDecks);
        this.decks.next(parsedDecks);
      } catch (error) {
        console.error('Failed to parse stored decks:', error);
        this.loadDefaultDecks();
      }
    } else {
      this.loadDefaultDecks();
    }
  }

  private loadDefaultDecks(): void {
    // Si rien dans le stockage local, charger les decks par défaut
    this.http.get<Deck[]>('assets/data/default-decks.json')
      .pipe(
        first(),
        catchError(error => {
          console.error('Failed to load default decks:', error);
          return of([]);
        })
      )
      .subscribe(decks => {
        this.decks.next(decks);
        if (decks.length > 0) {
          this.saveDecks(decks);
        }
      });
  }

  saveDecks(decks: Deck[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(decks));
  }

  getDecks(): Observable<Deck[]> {
    return this.decks.asObservable();
  }

  addDeck(deck: Deck): void {
    const currentDecks = this.decks.value;
    this.decks.next([...currentDecks, deck]);
    this.saveDecks(this.decks.value);
  }

  updateDeck(deck: Deck): void {
    const currentDecks = this.decks.value;
    const index = currentDecks.findIndex(d => d.id === deck.id);
    if (index !== -1) {
      currentDecks[index] = deck;
      this.decks.next([...currentDecks]);
      this.saveDecks(this.decks.value);
    }
  }

  removeDeck(deckId: string): void {
    const currentDecks = this.decks.value;
    const filtered = currentDecks.filter(d => d.id !== deckId);
    this.decks.next(filtered);
    this.saveDecks(filtered);
  }

  replaceAllDecks(decks: Deck[]): void {
    this.decks.next(decks);
    this.saveDecks(decks);
  }

  resetDecks(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.loadDefaultDecks();
  }
}
