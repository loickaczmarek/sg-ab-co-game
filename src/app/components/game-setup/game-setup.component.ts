import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DeckService } from '../../services/deck.service';
import { GameService } from '../../services/game.service';
import { Deck, GameConfig } from '../../models/game.interface';
import { FloatingRulesButtonComponent } from '../floating-rules-button/floating-rules-button.component';

@Component({
  selector: 'app-game-setup',
  templateUrl: './game-setup.component.html',
  styleUrls: ['./game-setup.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, FloatingRulesButtonComponent],
  providers: [DeckService]
})
export class GameSetupComponent implements OnInit {
  players: string[] = [];
  newPlayerName: string = '';
  availableDecks: Deck[] = [];
  selectedDecks: string[] = [];
  isInfoExpanded = true;

  constructor(
    private deckService: DeckService,
    private gameService: GameService,
    private router: Router
  ) {}

  ngOnInit() {
    this.deckService.getDecks().subscribe((decks: Deck[]) => {
      this.availableDecks = decks;
    });
  }

  addPlayer() {
    if (this.newPlayerName.trim()) {
      this.players.push(this.newPlayerName.trim());
      this.newPlayerName = '';
    }
  }

  removePlayer(index: number) {
    this.players.splice(index, 1);
  }

  toggleDeck(deckId: string) {
    const index = this.selectedDecks.indexOf(deckId);
    if (index === -1) {
      this.selectedDecks.push(deckId);
    } else {
      this.selectedDecks.splice(index, 1);
    }
  }

  canStartGame(): boolean {
    return this.players.length >= 2 && this.selectedDecks.length > 0;
  }

  startGame() {
    const config: GameConfig = {
      players: this.players,
      selectedDecks: this.selectedDecks
    };
    
    this.gameService.initializeGame(config);
    this.router.navigate(['/game']);
  }

  toggleInfo() {
    this.isInfoExpanded = !this.isInfoExpanded;
  }

  onStartGameClick() {
    if (this.canStartGame()) {
      this.startGame();
    } 
  }

}
