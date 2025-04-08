import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';
import { GameState, Deck } from '../../models/game.interface';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { DeckService } from '../../services/deck.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  gameState$: Observable<GameState>;
  availableDecks: Deck[] = [];

  constructor(
    private gameService: GameService, 
    private deckService: DeckService,
    private router: Router
  ) {
    this.gameState$ = this.gameService.getGameState();
  }

  ngOnInit() {
    this.deckService.getDecks().subscribe(decks => {
      this.availableDecks = decks;
    });
  }

  selectSubjectDeck(deckId: string) {
    this.gameService.selectSubjectDeck(deckId);
    this.gameService.drawCard();
  }

  startTurn() {
    this.gameService.startTimer();
  }

  nextPlayer() {
    this.gameService.nextPlayer();
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  restartGame(): void {
    this.router.navigate(['/setup']);
  }
} 