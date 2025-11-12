import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { GameInitializationService } from './game-initialization.service';
import { GameStateService } from './game-state.service';
import { of } from 'rxjs';
import { GameConfig, GameInitializationData } from '../models/game.interface';

describe('GameService', () => {
  let service: GameService;
  let mockGameInitService: jasmine.SpyObj<GameInitializationService>;
  let gameStateService: GameStateService;

  const mockInitData: GameInitializationData = {
    roles: ['Role 1', 'Role 2', 'Role 3', 'Role 4'],
    decks: [
      {
        id: '1',
        name: 'Test Deck 1',
        description: 'Test Description 1',
        subjects: ['Subject 1', 'Subject 2', 'Subject 3'],
        roles: ['Role 1', 'Role 2']
      },
      {
        id: '2',
        name: 'Test Deck 2',
        description: 'Test Description 2',
        subjects: ['Subject 4', 'Subject 5'],
        roles: ['Role 3', 'Role 4']
      }
    ],
    config: {
      players: ['Player 1', 'Player 2', 'Player 3'],
      selectedDecks: ['1', '2']
    }
  };

  const mockConfig: GameConfig = {
    players: ['Player 1', 'Player 2', 'Player 3'],
    selectedDecks: ['1', '2']
  };

  beforeEach(() => {
    mockGameInitService = jasmine.createSpyObj('GameInitializationService',
      ['initializeGameData', 'getSubjectDeck']);

    TestBed.configureTestingModule({
      providers: [
        GameService,
        GameStateService,
        { provide: GameInitializationService, useValue: mockGameInitService }
      ]
    });

    service = TestBed.inject(GameService);
    gameStateService = TestBed.inject(GameStateService);
    mockGameInitService = TestBed.inject(GameInitializationService) as jasmine.SpyObj<GameInitializationService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize game with config', (done) => {
    mockGameInitService.initializeGameData.and.returnValue(of(mockInitData));

    service.initializeGame(mockConfig);

    service.getGameState().subscribe(state => {
      expect(state.currentPlayer).toBe('Player 1');
      expect(state.timeRemaining).toBe(300);
      expect(state.isPlaying).toBeFalse();
      done();
    });
  });

  it('should not create memory leak when initializing game', () => {
    mockGameInitService.initializeGameData.and.returnValue(of(mockInitData));

    service.initializeGame(mockConfig);

    // Verify initializeGameData was called
    expect(mockGameInitService.initializeGameData).toHaveBeenCalledWith(mockConfig);
    expect(mockGameInitService.initializeGameData).toHaveBeenCalledTimes(1);
  });

  it('should select subject deck', () => {
    mockGameInitService.getSubjectDeck.and.returnValue(of(['Subject 1', 'Subject 2', 'Subject 3']));

    service.selectSubjectDeck('1');

    expect(mockGameInitService.getSubjectDeck).toHaveBeenCalledWith('1');
  });

  it('should not create memory leak when selecting subject deck', () => {
    mockGameInitService.getSubjectDeck.and.returnValue(of(['Subject 1', 'Subject 2', 'Subject 3']));

    service.selectSubjectDeck('1');

    // Verify getSubjectDeck was called only once
    expect(mockGameInitService.getSubjectDeck).toHaveBeenCalledTimes(1);
  });

  it('should draw card with subject and role', (done) => {
    mockGameInitService.initializeGameData.and.returnValue(of(mockInitData));
    mockGameInitService.getSubjectDeck.and.returnValue(of(['Subject 1', 'Subject 2', 'Subject 3']));

    service.initializeGame(mockConfig);
    service.selectSubjectDeck('1');

    // Wait for initialization
    setTimeout(() => {
      service.drawCard();

      service.getGameState().subscribe(state => {
        expect(state.currentSubject).toBeTruthy();
        expect(state.currentRole).toBeTruthy();
        done();
      });
    }, 100);
  });

  it('should change subject card only once per turn', (done) => {
    mockGameInitService.initializeGameData.and.returnValue(of(mockInitData));
    mockGameInitService.getSubjectDeck.and.returnValue(of(['Subject 1', 'Subject 2', 'Subject 3']));

    service.initializeGame(mockConfig);
    service.selectSubjectDeck('1');

    setTimeout(() => {
      service.drawCard();

      service.getGameState().subscribe(initialState => {
        const initialSubject = initialState.currentSubject;
        service.changeSubjectCard();

        service.getGameState().subscribe(changedState => {
          const changedSubject = changedState.currentSubject;

          expect(service.hasChangedSubjectCard()).toBeTrue();

          // Try to change again - should not work
          service.changeSubjectCard();
          service.getGameState().subscribe(finalState => {
            expect(finalState.currentSubject).toBe(changedSubject);
            done();
          });
        });
      });
    }, 100);
  });

  it('should change role card only once per turn', (done) => {
    mockGameInitService.initializeGameData.and.returnValue(of(mockInitData));
    mockGameInitService.getSubjectDeck.and.returnValue(of(['Subject 1', 'Subject 2', 'Subject 3']));

    service.initializeGame(mockConfig);
    service.selectSubjectDeck('1');

    setTimeout(() => {
      service.drawCard();

      service.changeRoleCard();
      service.getGameState().subscribe(changedState => {
        const changedRole = changedState.currentRole;

        expect(service.hasChangedRoleCard()).toBeTrue();

        // Try to change again - should not work
        service.changeRoleCard();
        service.getGameState().subscribe(finalState => {
          expect(finalState.currentRole).toBe(changedRole);
          done();
        });
      });
    }, 100);
  });

  it('should not allow card changes while playing', (done) => {
    mockGameInitService.initializeGameData.and.returnValue(of(mockInitData));
    mockGameInitService.getSubjectDeck.and.returnValue(of(['Subject 1', 'Subject 2', 'Subject 3']));

    service.initializeGame(mockConfig);
    service.selectSubjectDeck('1');

    setTimeout(() => {
      service.drawCard();

      service.getGameState().subscribe(beforePlayState => {
        const initialSubject = beforePlayState.currentSubject;
        const initialRole = beforePlayState.currentRole;

        service.startTimer();
        service.changeSubjectCard();
        service.changeRoleCard();

        service.getGameState().subscribe(afterChangeState => {
          expect(afterChangeState.currentSubject).toBe(initialSubject);
          expect(afterChangeState.currentRole).toBe(initialRole);

          service.stopTimer();
          done();
        });
      });
    }, 100);
  });

  it('should start timer and decrement time', (done) => {
    mockGameInitService.initializeGameData.and.returnValue(of(mockInitData));
    mockGameInitService.getSubjectDeck.and.returnValue(of(['Subject 1', 'Subject 2', 'Subject 3']));

    service.initializeGame(mockConfig);

    setTimeout(() => {
      service.startTimer();

      // Use a small delay to allow the state to update
      setTimeout(() => {
        service.getGameState().subscribe(state => {
          expect(state.isPlaying).toBeTrue();

          // Wait for timer to tick
          setTimeout(() => {
            service.getGameState().subscribe(finalState => {
              expect(finalState.timeRemaining).toBeLessThan(300);
              service.stopTimer();
              done();
            });
          }, 1500);
        });
      }, 10);
    }, 100);
  });

  it('should stop timer and set isPlaying to false', (done) => {
    mockGameInitService.initializeGameData.and.returnValue(of(mockInitData));
    mockGameInitService.getSubjectDeck.and.returnValue(of(['Subject 1', 'Subject 2', 'Subject 3']));

    service.initializeGame(mockConfig);

    setTimeout(() => {
      service.startTimer();
      service.stopTimer();

      service.getGameState().subscribe(state => {
        expect(state.isPlaying).toBeFalse();
        done();
      });
    }, 100);
  });

  it('should properly cleanup timer subscription', (done) => {
    mockGameInitService.initializeGameData.and.returnValue(of(mockInitData));
    mockGameInitService.getSubjectDeck.and.returnValue(of(['Subject 1', 'Subject 2', 'Subject 3']));

    service.initializeGame(mockConfig);

    setTimeout(() => {
      service.startTimer();
      expect(service['timerSubscription']).not.toBeNull();

      service.stopTimer();
      expect(service['timerSubscription']).toBeNull();

      done();
    }, 100);
  });

  it('should move to next player', (done) => {
    mockGameInitService.initializeGameData.and.returnValue(of(mockInitData));
    mockGameInitService.getSubjectDeck.and.returnValue(of(['Subject 1', 'Subject 2', 'Subject 3']));

    service.initializeGame(mockConfig);

    setTimeout(() => {
      service.nextPlayer();

      service.getGameState().subscribe(state => {
        expect(state.currentPlayer).toBe('Player 2');
        expect(state.timeRemaining).toBe(300);
        done();
      });
    }, 100);
  });

  it('should end game when cycling back to first player', (done) => {
    mockGameInitService.initializeGameData.and.returnValue(of(mockInitData));
    mockGameInitService.getSubjectDeck.and.returnValue(of(['Subject 1', 'Subject 2', 'Subject 3']));

    service.initializeGame(mockConfig);

    setTimeout(() => {
      // Cycle through all players
      service.nextPlayer(); // Player 2
      service.nextPlayer(); // Player 3
      service.nextPlayer(); // Back to start - should end game

      service.getGameState().subscribe(state => {
        expect(state.currentPlayer).toBe('');
        expect(state.timeRemaining).toBe(0);
        done();
      });
    }, 100);
  });

  it('should end game and reset state', (done) => {
    mockGameInitService.initializeGameData.and.returnValue(of(mockInitData));
    mockGameInitService.getSubjectDeck.and.returnValue(of(['Subject 1', 'Subject 2', 'Subject 3']));

    service.initializeGame(mockConfig);

    setTimeout(() => {
      service.startTimer();
      service.endGame();

      service.getGameState().subscribe(state => {
        expect(state.currentPlayer).toBe('');
        expect(state.currentSubject).toBe('');
        expect(state.currentRole).toBe('');
        expect(state.timeRemaining).toBe(0);
        expect(state.isPlaying).toBeFalse();
        done();
      });
    }, 100);
  });

  it('should return current config', () => {
    mockGameInitService.initializeGameData.and.returnValue(of(mockInitData));
    mockGameInitService.getSubjectDeck.and.returnValue(of(['Subject 1', 'Subject 2', 'Subject 3']));

    service.initializeGame(mockConfig);

    expect(service.getCurrentConfig()).toEqual(mockConfig);
  });
});
