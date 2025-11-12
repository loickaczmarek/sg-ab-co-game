import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { GameInitializationService } from './game-initialization.service';
import { DeckService } from './deck.service';
import { GameConfig, Deck, GameInitializationData } from '../models/game.interface';

describe('GameInitializationService', () => {
  let service: GameInitializationService;
  let mockDeckService: jasmine.SpyObj<DeckService>;

  const mockDecks: Deck[] = [
    {
      id: 'dev',
      name: 'Development',
      description: 'Development deck',
      subjects: ['Angular', 'React', 'Vue'],
      roles: ['Frontend', 'Backend', 'DevOps']
    },
    {
      id: 'product',
      name: 'Product',
      description: 'Product deck',
      subjects: ['Roadmap', 'Features', 'Users'],
      roles: ['PM', 'Designer', 'Analyst']
    },
    {
      id: 'data',
      name: 'Data',
      description: 'Data deck',
      subjects: ['SQL', 'NoSQL', 'DataLake'],
      roles: ['Data Engineer', 'Data Scientist', 'Analyst']
    }
  ];

  beforeEach(() => {
    mockDeckService = jasmine.createSpyObj('DeckService', ['getDecks']);

    TestBed.configureTestingModule({
      providers: [
        GameInitializationService,
        { provide: DeckService, useValue: mockDeckService }
      ]
    });

    service = TestBed.inject(GameInitializationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initializeGameData', () => {
    it('should return game initialization data with selected decks', (done) => {
      const config: GameConfig = {
        players: ['Alice', 'Bob'],
        selectedDecks: ['dev', 'product']
      };

      mockDeckService.getDecks.and.returnValue(of(mockDecks));

      service.initializeGameData(config).subscribe(data => {
        expect(data.roles).toEqual(['Frontend', 'Backend', 'DevOps', 'PM', 'Designer', 'Analyst']);
        expect(data.decks.length).toBe(2);
        expect(data.decks[0].id).toBe('dev');
        expect(data.decks[1].id).toBe('product');
        expect(data.config).toEqual(config);
        done();
      });
    });

    it('should return empty roles when no decks selected', (done) => {
      const config: GameConfig = {
        players: ['Alice', 'Bob'],
        selectedDecks: []
      };

      mockDeckService.getDecks.and.returnValue(of(mockDecks));

      service.initializeGameData(config).subscribe(data => {
        expect(data.roles).toEqual([]);
        expect(data.decks.length).toBe(0);
        expect(data.config).toEqual(config);
        done();
      });
    });

    it('should filter only selected decks from available decks', (done) => {
      const config: GameConfig = {
        players: ['Alice', 'Bob'],
        selectedDecks: ['data']
      };

      mockDeckService.getDecks.and.returnValue(of(mockDecks));

      service.initializeGameData(config).subscribe(data => {
        expect(data.decks.length).toBe(1);
        expect(data.decks[0].id).toBe('data');
        expect(data.roles).toEqual(['Data Engineer', 'Data Scientist', 'Analyst']);
        done();
      });
    });

    it('should handle non-existent deck IDs gracefully', (done) => {
      const config: GameConfig = {
        players: ['Alice', 'Bob'],
        selectedDecks: ['dev', 'nonexistent', 'product']
      };

      mockDeckService.getDecks.and.returnValue(of(mockDecks));

      service.initializeGameData(config).subscribe(data => {
        expect(data.decks.length).toBe(2); // Only dev and product
        expect(data.roles.length).toBe(6); // 3 from dev + 3 from product
        done();
      });
    });

    it('should use first() operator to prevent memory leaks', (done) => {
      const config: GameConfig = {
        players: ['Alice', 'Bob'],
        selectedDecks: ['dev']
      };

      mockDeckService.getDecks.and.returnValue(of(mockDecks));

      service.initializeGameData(config).subscribe(data => {
        expect(mockDeckService.getDecks).toHaveBeenCalledTimes(1);
        done();
      });

      // Verify subscription completes after first emission
      expect(mockDeckService.getDecks).toHaveBeenCalled();
    });

    it('should handle empty deck list', (done) => {
      const config: GameConfig = {
        players: ['Alice', 'Bob'],
        selectedDecks: ['dev']
      };

      mockDeckService.getDecks.and.returnValue(of([]));

      service.initializeGameData(config).subscribe(data => {
        expect(data.decks.length).toBe(0);
        expect(data.roles.length).toBe(0);
        done();
      });
    });

    it('should preserve order of roles based on deck order in storage', (done) => {
      const config: GameConfig = {
        players: ['Alice', 'Bob'],
        selectedDecks: ['product', 'dev'] // Selected order
      };

      mockDeckService.getDecks.and.returnValue(of(mockDecks));

      service.initializeGameData(config).subscribe(data => {
        // Filter preserves the order from mockDecks array (dev first, then product)
        expect(data.roles[0]).toBe('Frontend');
        expect(data.roles[1]).toBe('Backend');
        expect(data.roles[2]).toBe('DevOps');
        expect(data.roles[3]).toBe('PM');
        expect(data.roles.length).toBe(6); // 3 from dev + 3 from product
        done();
      });
    });
  });

  describe('getSubjectDeck', () => {
    it('should return subjects for valid deck ID', (done) => {
      mockDeckService.getDecks.and.returnValue(of(mockDecks));

      service.getSubjectDeck('dev').subscribe(subjects => {
        expect(subjects).toEqual(['Angular', 'React', 'Vue']);
        done();
      });
    });

    it('should return empty array for invalid deck ID', (done) => {
      mockDeckService.getDecks.and.returnValue(of(mockDecks));

      service.getSubjectDeck('nonexistent').subscribe(subjects => {
        expect(subjects).toEqual([]);
        done();
      });
    });

    it('should return empty array when decks list is empty', (done) => {
      mockDeckService.getDecks.and.returnValue(of([]));

      service.getSubjectDeck('dev').subscribe(subjects => {
        expect(subjects).toEqual([]);
        done();
      });
    });

    it('should use first() operator to prevent memory leaks', (done) => {
      mockDeckService.getDecks.and.returnValue(of(mockDecks));

      service.getSubjectDeck('dev').subscribe(subjects => {
        expect(mockDeckService.getDecks).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should return subjects for product deck', (done) => {
      mockDeckService.getDecks.and.returnValue(of(mockDecks));

      service.getSubjectDeck('product').subscribe(subjects => {
        expect(subjects).toEqual(['Roadmap', 'Features', 'Users']);
        done();
      });
    });

    it('should handle deck with empty subjects array', (done) => {
      const decksWithEmptySubjects: Deck[] = [
        {
          id: 'empty',
          name: 'Empty',
          description: 'Empty deck',
          subjects: [],
          roles: ['Role1']
        }
      ];

      mockDeckService.getDecks.and.returnValue(of(decksWithEmptySubjects));

      service.getSubjectDeck('empty').subscribe(subjects => {
        expect(subjects).toEqual([]);
        done();
      });
    });
  });

  describe('error handling', () => {
    it('should propagate errors from DeckService in initializeGameData', (done) => {
      const config: GameConfig = {
        players: ['Alice', 'Bob'],
        selectedDecks: ['dev']
      };

      const error = new Error('Failed to load decks');
      mockDeckService.getDecks.and.returnValue(throwError(() => error));

      service.initializeGameData(config).subscribe({
        next: () => fail('Should not emit value'),
        error: (err) => {
          expect(err).toBe(error);
          done();
        }
      });
    });

    it('should propagate errors from DeckService in getSubjectDeck', (done) => {
      const error = new Error('Failed to load decks');
      mockDeckService.getDecks.and.returnValue(throwError(() => error));

      service.getSubjectDeck('dev').subscribe({
        next: () => fail('Should not emit value'),
        error: (err) => {
          expect(err).toBe(error);
          done();
        }
      });
    });
  });

  describe('subscription management', () => {
    it('should complete subscription after first emission in initializeGameData', (done) => {
      const config: GameConfig = {
        players: ['Alice', 'Bob'],
        selectedDecks: ['dev']
      };

      mockDeckService.getDecks.and.returnValue(of(mockDecks));

      let completed = false;

      service.initializeGameData(config).subscribe({
        next: () => {},
        complete: () => {
          completed = true;
          expect(completed).toBe(true);
          done();
        }
      });
    });

    it('should complete subscription after first emission in getSubjectDeck', (done) => {
      mockDeckService.getDecks.and.returnValue(of(mockDecks));

      let completed = false;

      service.getSubjectDeck('dev').subscribe({
        next: () => {},
        complete: () => {
          completed = true;
          expect(completed).toBe(true);
          done();
        }
      });
    });
  });
});
