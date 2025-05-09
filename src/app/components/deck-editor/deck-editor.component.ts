import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeckService } from '../../services/deck.service';
import { Deck } from '../../models/game.interface';

@Component({
  selector: 'app-deck-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deck-editor.component.html',
  styleUrl: './deck-editor.component.scss'
})
export class DeckEditorComponent implements OnInit {
  decks: Deck[] = [];
  expandedDecks: boolean[] = [];
  isInfoExpanded = true;
  private readonly fileInput: HTMLInputElement | null = null;

  constructor(private deckService: DeckService) {
    // Créer un input file caché
    this.fileInput = document.createElement('input');
    this.fileInput.type = 'file';
    this.fileInput.accept = '.json';
    this.fileInput.style.display = 'none';
    document.body.appendChild(this.fileInput);

    // Écouter l'événement de changement de fichier
    this.fileInput.addEventListener('change', (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        this.importDecks(file);
      }
    });
  }

  ngOnInit() {
    this.loadDecks();
  }

  toggleDeck(index: number) {
    this.expandedDecks[index] = !this.expandedDecks[index];
  }

  toggleInfo() {
    this.isInfoExpanded = !this.isInfoExpanded;
  }

  private loadDecks() {
    this.deckService.getDecks().subscribe(decks => {
      this.decks = decks;
    });
    this.expandedDecks = [];
  }

  addDeck() {
    const newDeck: Deck = {
      id: Date.now().toString(),
      name: 'Nouveau deck',
      description: 'Description du deck',
      subjects: ['Nouveau sujet'],
      roles: ['Nouveau rôle']
    };
    this.deckService.addDeck(newDeck);
    this.loadDecks();
  }

  removeDeck(deck: Deck) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le deck "${deck.name}" ?`)) {
      const currentDecks = this.decks.filter(d => d.id !== deck.id);
      this.deckService['decks'].next(currentDecks);
      this.deckService.saveDecks(currentDecks);
      this.loadDecks();
    }
  }

  updateDeckName(deck: Deck, event: Event) {
    const newValue = (event.target as HTMLInputElement).value;
    const currentDeckIndex = this.decks.indexOf(deck);
    this.decks[currentDeckIndex].name = newValue;
    this.deckService.updateDeck(this.decks[currentDeckIndex]);
  }

  removeRole(deck: Deck, role: string) {
    const currentDeckIndex = this.decks.indexOf(deck)
    this.decks[currentDeckIndex].roles.splice(deck.roles.indexOf(role), 1);

    this.deckService.updateDeck(this.decks[currentDeckIndex])
  }

  removeSubject(deck: Deck, subject: string) {
    const currentDeckIndex = this.decks.indexOf(deck)
    this.decks[currentDeckIndex].subjects.splice(deck.subjects.indexOf(subject), 1);

    this.deckService.updateDeck(this.decks[currentDeckIndex])
  }

  addRole(deck: Deck) {
    const currentDeckIndex = this.decks.indexOf(deck)
    this.decks[currentDeckIndex].roles.push('a compléter')

    this.deckService.updateDeck(this.decks[currentDeckIndex])
  }

  addSubject(deck: Deck) {
    const currentDeckIndex = this.decks.indexOf(deck)
    this.decks[currentDeckIndex].subjects.push('a compléter')

    this.deckService.updateDeck(this.decks[currentDeckIndex])
  }

  updateRole(deck: Deck, index: number, event: Event) {
    const newValue = (event.target as HTMLInputElement).value;
    const currentDeckIndex = this.decks.indexOf(deck);
    this.decks[currentDeckIndex].roles[index] = newValue;
    this.deckService.updateDeck(this.decks[currentDeckIndex]);
  }

  updateSubject(deck: Deck, index: number, event: Event) {
    const newValue = (event.target as HTMLInputElement).value;
    const currentDeckIndex = this.decks.indexOf(deck);
    this.decks[currentDeckIndex].subjects[index] = newValue;
    this.deckService.updateDeck(this.decks[currentDeckIndex]);
  }

  exportDecks() {
    const decksJson = JSON.stringify(this.decks, null, 2);
    const blob = new Blob([decksJson], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'decks.json';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  importDecksClick() {
    if (this.fileInput) {
      this.fileInput.click();
    }
  }

  private importDecks(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedDecks = JSON.parse(e.target?.result as string) as Deck[];

        // Vérifier que les decks importés ont la bonne structure
        if (Array.isArray(importedDecks) && importedDecks.every(deck =>
          deck.id &&
          deck.name &&
          Array.isArray(deck.subjects) &&
          Array.isArray(deck.roles)
        )) {
          // Réinitialiser complètement les decks
          this.deckService.resetDecks();
          this.deckService['decks'].next([]); // Réinitialiser le BehaviorSubject

          // Ajouter les nouveaux decks
          importedDecks.forEach(deck => {
            this.deckService.addDeck(deck);
          });

          // Recharger la liste des decks
          this.loadDecks();

          alert('Decks importés avec succès !');
        } else {
          throw new Error('Format de fichier invalide');
        }
      } catch (error) {
        alert('Erreur lors de l\'importation des decks. Vérifiez le format du fichier.');
        console.error('Erreur d\'importation:', error);
      }
    };
    reader.readAsText(file);
  }
}
