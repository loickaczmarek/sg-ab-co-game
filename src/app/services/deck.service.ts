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
    currentDecks[currentDecks.indexOf(deck)] = deck
    this.decks.next([...currentDecks]);
    this.saveDecks(this.decks.value);
  }

  resetDecks(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
