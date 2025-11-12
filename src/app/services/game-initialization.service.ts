import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { GameConfig, Deck, GameInitializationData } from '../models/game.interface';
import { DeckService } from './deck.service';

/**
 * GameInitializationService provides a facade layer between GameService and DeckService.
 * It handles game initialization logic without creating tight coupling.
 *
 * This service follows the Dependency Inversion Principle and improves testability.
 */
@Injectable({
  providedIn: 'root'
})
export class GameInitializationService {

  constructor(private deckService: DeckService) {}

  /**
   * Initialize game data by filtering selected decks and extracting roles
   *
   * @param config - Game configuration with players and selected deck IDs
   * @returns Observable of GameInitializationData with roles, decks, and config
   */
  initializeGameData(config: GameConfig): Observable<GameInitializationData> {
    return this.deckService.getDecks().pipe(
      first(), // Prevent memory leaks by completing after first emission
      map(decks => {
        // Filter only the decks that were selected in the config
        const selectedDecks = decks.filter(deck =>
          config.selectedDecks.includes(deck.id)
        );

        // Extract all roles from selected decks
        const roles = selectedDecks.flatMap(deck => deck.roles);

        return {
          roles,
          decks: selectedDecks,
          config
        };
      })
    );
  }

  /**
   * Get subjects array for a specific deck
   *
   * @param deckId - ID of the deck to retrieve subjects from
   * @returns Observable of subjects array (empty if deck not found)
   */
  getSubjectDeck(deckId: string): Observable<string[]> {
    return this.deckService.getDecks().pipe(
      first(), // Prevent memory leaks by completing after first emission
      map(decks => {
        const deck = decks.find(d => d.id === deckId);
        return deck?.subjects || [];
      })
    );
  }
}
