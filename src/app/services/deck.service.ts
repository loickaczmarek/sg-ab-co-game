import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
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
      this.decks.next(JSON.parse(storedDecks));
    } else {
      // Si rien dans le stockage local, charger les decks par défaut
      this.http.get<Deck[]>('assets/data/default-decks.json')
        .subscribe(decks => {
          this.decks.next(decks);
          this.saveDecks(decks);
        });
    }
  }

  private saveDecks(decks: Deck[]): void {
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

  updateDeck(updatedDeck: Deck): void {
    const currentDecks = this.decks.value;
    const index = currentDecks.findIndex(d => d.id === updatedDeck.id);
    if (index !== -1) {
      currentDecks[index] = updatedDeck;
      this.decks.next([...currentDecks]);
      this.saveDecks(this.decks.value);
    }
  }

  deleteDeck(deckId: string): void {
    const currentDecks = this.decks.value;
    this.decks.next(currentDecks.filter(d => d.id !== deckId));
    this.saveDecks(this.decks.value);
  }

  resetToDefault(): void {
    this.http.get<Deck[]>('assets/data/default-decks.json')
      .subscribe(decks => {
        this.decks.next(decks);
        this.saveDecks(decks);
      });
  }

  resetDecks(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
