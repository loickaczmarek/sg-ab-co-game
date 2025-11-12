import { Component, OnInit, DestroyRef, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  decks: Deck[] = [];
  expandedDecks: boolean[] = [];
  isInfoExpanded = true;
  private destroyRef = inject(DestroyRef);

  constructor(private deckService: DeckService) {}

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
    this.deckService.getDecks()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(decks => {
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
      this.deckService.removeDeck(deck.id);
    }
  }

  updateDeckName(deck: Deck, event: Event) {
    const newValue = (event.target as HTMLInputElement).value;

    // Optimistic update: Update local state immediately
    const deckIndex = this.decks.findIndex(d => d.id === deck.id);
    if (deckIndex !== -1) {
      const updatedDeck = {
        ...this.decks[deckIndex],
        name: newValue
      };
      this.decks[deckIndex] = updatedDeck; // Instant UI update

      // Background save (async, non-blocking)
      this.deckService.updateDeck(updatedDeck);
    }
  }

  removeRole(deck: Deck, index: number) {
    // Optimistic update: Update local state immediately
    const deckIndex = this.decks.findIndex(d => d.id === deck.id);
    if (deckIndex !== -1) {
      const newRoles = [...this.decks[deckIndex].roles];
      newRoles.splice(index, 1); // Remove by index

      const updatedDeck = {
        ...this.decks[deckIndex],
        roles: newRoles
      };
      this.decks[deckIndex] = updatedDeck; // Instant UI update

      // Background save (async, non-blocking)
      this.deckService.updateDeck(updatedDeck);
    }
  }

  removeSubject(deck: Deck, index: number) {
    // Optimistic update: Update local state immediately
    const deckIndex = this.decks.findIndex(d => d.id === deck.id);
    if (deckIndex !== -1) {
      const newSubjects = [...this.decks[deckIndex].subjects];
      newSubjects.splice(index, 1); // Remove by index

      const updatedDeck = {
        ...this.decks[deckIndex],
        subjects: newSubjects
      };
      this.decks[deckIndex] = updatedDeck; // Instant UI update

      // Background save (async, non-blocking)
      this.deckService.updateDeck(updatedDeck);
    }
  }

  addRole(deck: Deck) {
    // Force blur on active input to save any pending edits
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // Small delay to ensure blur event is processed
    setTimeout(() => {
      // Optimistic update: Update local state immediately
      const deckIndex = this.decks.findIndex(d => d.id === deck.id);
      if (deckIndex !== -1) {
        const updatedDeck = {
          ...this.decks[deckIndex],
          roles: [...this.decks[deckIndex].roles, 'a compléter']
        };
        this.decks[deckIndex] = updatedDeck; // Instant UI update

        // Background save (async, non-blocking)
        this.deckService.updateDeck(updatedDeck);
      }
    }, 0);
  }

  addSubject(deck: Deck) {
    // Force blur on active input to save any pending edits
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // Small delay to ensure blur event is processed
    setTimeout(() => {
      // Optimistic update: Update local state immediately
      const deckIndex = this.decks.findIndex(d => d.id === deck.id);
      if (deckIndex !== -1) {
        const updatedDeck = {
          ...this.decks[deckIndex],
          subjects: [...this.decks[deckIndex].subjects, 'a compléter']
        };
        this.decks[deckIndex] = updatedDeck; // Instant UI update

        // Background save (async, non-blocking)
        this.deckService.updateDeck(updatedDeck);
      }
    }, 0);
  }

  updateRole(deck: Deck, index: number, event: Event) {
    const newValue = (event.target as HTMLInputElement).value;

    // Optimistic update: Update local state immediately
    const deckIndex = this.decks.findIndex(d => d.id === deck.id);
    if (deckIndex !== -1) {
      const newRoles = [...this.decks[deckIndex].roles];
      newRoles[index] = newValue;

      const updatedDeck = {
        ...this.decks[deckIndex],
        roles: newRoles
      };
      this.decks[deckIndex] = updatedDeck; // Instant UI update

      // Background save (async, non-blocking)
      this.deckService.updateDeck(updatedDeck);
    }
  }

  updateSubject(deck: Deck, index: number, event: Event) {
    const newValue = (event.target as HTMLInputElement).value;

    // Optimistic update: Update local state immediately
    const deckIndex = this.decks.findIndex(d => d.id === deck.id);
    if (deckIndex !== -1) {
      const newSubjects = [...this.decks[deckIndex].subjects];
      newSubjects[index] = newValue;

      const updatedDeck = {
        ...this.decks[deckIndex],
        subjects: newSubjects
      };
      this.decks[deckIndex] = updatedDeck; // Instant UI update

      // Background save (async, non-blocking)
      this.deckService.updateDeck(updatedDeck);
    }
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

  /**
   * Triggers the hidden file input when user clicks the import button
   */
  importDecksClick(): void {
    this.fileInput.nativeElement.click();
  }

  /**
   * Handles file selection from the file input
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.importDecks(file);
      // Reset input so same file can be selected again
      input.value = '';
    }
  }

  /**
   * Imports decks from a JSON file with validation
   */
  private importDecks(file: File): void {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const importedDecks = JSON.parse(e.target?.result as string);

        // Validate deck structure
        if (this.isValidDeckArray(importedDecks)) {
          this.deckService.replaceAllDecks(importedDecks);
          alert('Decks importés avec succès !');
        } else {
          throw new Error('Format de fichier invalide');
        }
      } catch (error) {
        alert('Erreur lors de l\'importation des decks. Vérifiez le format du fichier.');
        console.error('Erreur d\'importation:', error);
      }
    };

    reader.onerror = () => {
      alert('Erreur lors de la lecture du fichier.');
      console.error('Erreur de lecture du fichier');
    };

    reader.readAsText(file);
  }

  /**
   * Type guard to validate deck array structure
   */
  private isValidDeckArray(data: unknown): data is Deck[] {
    return (
      Array.isArray(data) &&
      data.every(
        (deck) =>
          deck &&
          typeof deck.id === 'string' &&
          deck.id.length > 0 &&
          typeof deck.name === 'string' &&
          deck.name.length > 0 &&
          Array.isArray(deck.subjects) &&
          deck.subjects.every((s: unknown) => typeof s === 'string') &&
          Array.isArray(deck.roles) &&
          deck.roles.every((r: unknown) => typeof r === 'string')
      )
    );
  }
}
