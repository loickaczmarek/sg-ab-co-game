import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DeckService } from './deck.service';
import { Deck } from '../models/game.interface';

describe('DeckService', () => {
  let service: DeckService;
  let httpMock: HttpTestingController;

  const mockDecks: Deck[] = [
    {
      id: '1',
      name: 'Test Deck',
      description: 'Test Description',
      subjects: ['Subject 1', 'Subject 2'],
      roles: ['Role 1', 'Role 2']
    }
  ];

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DeckService]
    });
    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(DeckService);

    // Flush the initial HTTP request made in constructor if localStorage is empty
    const initialRequest = httpMock.match('assets/data/default-decks.json');
    if (initialRequest.length > 0) {
      initialRequest[0].flush([]);
    }
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load decks from localStorage if available', () => {
    // This test verifies the behavior when localStorage has data
    // Since service is created in beforeEach with empty localStorage,
    // we test the scenario by setting data and verifying it loads correctly
    const testDecks = JSON.parse(JSON.stringify(mockDecks));
    localStorage.setItem('game_decks', JSON.stringify(testDecks));

    // Create new TestBed with localStorage containing data
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DeckService]
    });

    const newService = TestBed.inject(DeckService);

    // When localStorage has data, no HTTP request should be made
    const httpMockNew = TestBed.inject(HttpTestingController);
    httpMockNew.expectNone('assets/data/default-decks.json');

    newService.getDecks().subscribe(decks => {
      expect(decks).toEqual(testDecks);
    });

    httpMockNew.verify();
  });

  it('should load decks from HTTP when localStorage is empty', () => {
    // Create a fresh service with empty localStorage
    TestBed.resetTestingModule();
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DeckService]
    });

    const httpMockNew = TestBed.inject(HttpTestingController);
    const newService = TestBed.inject(DeckService);

    // The HTTP request should be triggered by constructor
    const req = httpMockNew.expectOne('assets/data/default-decks.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockDecks);

    newService.getDecks().subscribe(decks => {
      expect(decks).toEqual(mockDecks);
    });

    httpMockNew.verify();
  });

  it('should not create memory leak when loading decks from HTTP', () => {
    // Create a fresh service with empty localStorage
    TestBed.resetTestingModule();
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DeckService]
    });

    const httpMockNew = TestBed.inject(HttpTestingController);
    const newService = TestBed.inject(DeckService);

    // This test verifies that the subscription completes after one emission
    const req = httpMockNew.expectOne('assets/data/default-decks.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockDecks);

    // Verify only one request was made, not multiple
    httpMockNew.expectNone('assets/data/default-decks.json');
    httpMockNew.verify();
  });

  it('should save decks to localStorage', () => {
    spyOn(localStorage, 'setItem');
    service.saveDecks(mockDecks);
    expect(localStorage.setItem).toHaveBeenCalledWith('game_decks', JSON.stringify(mockDecks));
  });

  it('should add deck and save to localStorage', () => {
    const newDeck: Deck = {
      id: '2',
      name: 'New Deck',
      description: 'New Description',
      subjects: ['New Subject'],
      roles: ['New Role']
    };

    spyOn(localStorage, 'setItem');
    service.addDeck(newDeck);

    service.getDecks().subscribe(decks => {
      expect(decks).toContain(newDeck);
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  it('should update deck and save to localStorage', () => {
    // First add the deck
    const decksCopy = JSON.parse(JSON.stringify(mockDecks));
    service['decks'].next(decksCopy);

    // Update the deck
    const deckToUpdate = decksCopy[0];
    deckToUpdate.name = 'Updated Name';

    spyOn(localStorage, 'setItem');
    service.updateDeck(deckToUpdate);

    service.getDecks().subscribe(decks => {
      expect(decks[0].name).toBe('Updated Name');
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  it('should update deck when passed a new object with same id (immutable pattern)', () => {
    // Set up initial decks
    const decksCopy = JSON.parse(JSON.stringify(mockDecks));
    service['decks'].next(decksCopy);

    // Create a NEW object with the same id but different data (mimics immutable update)
    const originalDeck = decksCopy[0];
    const updatedDeck = {
      ...originalDeck,
      roles: [...originalDeck.roles, 'New Role']
    };

    spyOn(localStorage, 'setItem');
    service.updateDeck(updatedDeck);

    service.getDecks().subscribe(decks => {
      // This should pass after the fix
      expect(decks[0].roles).toEqual(['Role 1', 'Role 2', 'New Role']);
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  it('should update deck with new subjects array (immutable pattern)', () => {
    // Set up initial decks
    const decksCopy = JSON.parse(JSON.stringify(mockDecks));
    service['decks'].next(decksCopy);

    // Create a NEW object with the same id but different subjects
    const originalDeck = decksCopy[0];
    const updatedDeck = {
      ...originalDeck,
      subjects: [...originalDeck.subjects, 'New Subject']
    };

    spyOn(localStorage, 'setItem');
    service.updateDeck(updatedDeck);

    service.getDecks().subscribe(decks => {
      // This should pass after the fix
      expect(decks[0].subjects).toEqual(['Subject 1', 'Subject 2', 'New Subject']);
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  it('should reset decks by removing from localStorage', () => {
    spyOn(localStorage, 'removeItem');
    service.resetDecks();
    expect(localStorage.removeItem).toHaveBeenCalledWith('game_decks');

    // resetDecks now calls loadDefaultDecks, which makes an HTTP request
    const req = httpMock.expectOne('assets/data/default-decks.json');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should return Observable of decks', () => {
    service['decks'].next(mockDecks);

    service.getDecks().subscribe(decks => {
      expect(decks).toEqual(mockDecks);
    });
  });
});
