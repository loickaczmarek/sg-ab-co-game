import { TestBed } from '@angular/core/testing';
import { GameStateService } from './game-state.service';
import { GamePhase, CompleteGameState, GameConfig } from '../models/game.interface';

describe('GameStateService', () => {
  let service: GameStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GameStateService]
    });
    service = TestBed.inject(GameStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with correct default state', (done) => {
    service.state$.subscribe(state => {
      expect(state.phase).toBe(GamePhase.NOT_STARTED);
      expect(state.players).toEqual([]);
      expect(state.currentPlayerIndex).toBe(-1);
      expect(state.currentSubject).toBe('');
      expect(state.currentRole).toBe('');
      expect(state.availableRoles).toEqual([]);
      expect(state.selectedSubjectDeckInRound).toEqual([]);
      expect(state.hasChangedRole).toBeFalse();
      expect(state.hasChangedSubject).toBeFalse();
      expect(state.timeRemaining).toBe(300);
      expect(state.isPlaying).toBeFalse();
      expect(state.config).toBeNull();
      done();
    });
  });

  it('should update state immutably', (done) => {
    const initialState = service.getState();

    service.updateState({ timeRemaining: 100 });

    service.state$.subscribe(newState => {
      expect(newState).not.toBe(initialState);
      expect(newState.timeRemaining).toBe(100);
      expect(newState.phase).toBe(GamePhase.NOT_STARTED); // Other fields unchanged
      done();
    });
  });

  it('should update multiple state fields at once', (done) => {
    service.updateState({
      players: ['Player 1', 'Player 2'],
      currentPlayerIndex: 0,
      phase: GamePhase.DECK_SELECTION
    });

    service.state$.subscribe(state => {
      expect(state.players).toEqual(['Player 1', 'Player 2']);
      expect(state.currentPlayerIndex).toBe(0);
      expect(state.phase).toBe(GamePhase.DECK_SELECTION);
      done();
    });
  });

  it('should return current player via selector', (done) => {
    service.updateState({
      players: ['Player 1', 'Player 2', 'Player 3'],
      currentPlayerIndex: 1
    });

    service.getCurrentPlayer$().subscribe(player => {
      expect(player).toBe('Player 2');
      done();
    });
  });

  it('should return empty string when no current player', (done) => {
    service.getCurrentPlayer$().subscribe(player => {
      expect(player).toBe('');
      done();
    });
  });

  it('should return phase via selector', (done) => {
    service.updateState({ phase: GamePhase.PLAYING });

    service.getPhase$().subscribe(phase => {
      expect(phase).toBe(GamePhase.PLAYING);
      done();
    });
  });

  it('should return isPlaying via selector', (done) => {
    service.updateState({ isPlaying: true });

    service.isPlaying$().subscribe(isPlaying => {
      expect(isPlaying).toBeTrue();
      done();
    });
  });

  it('should return timeRemaining via selector', (done) => {
    service.updateState({ timeRemaining: 120 });

    service.getTimeRemaining$().subscribe(time => {
      expect(time).toBe(120);
      done();
    });
  });

  it('should reset to initial state', (done) => {
    service.updateState({
      players: ['Player 1'],
      currentPlayerIndex: 0,
      currentRole: 'Role 1',
      currentSubject: 'Subject 1',
      phase: GamePhase.PLAYING,
      isPlaying: true,
      timeRemaining: 100
    });

    service.resetState();

    service.state$.subscribe(state => {
      expect(state.phase).toBe(GamePhase.NOT_STARTED);
      expect(state.players).toEqual([]);
      expect(state.currentPlayerIndex).toBe(-1);
      expect(state.currentSubject).toBe('');
      expect(state.currentRole).toBe('');
      expect(state.isPlaying).toBeFalse();
      expect(state.timeRemaining).toBe(300);
      done();
    });
  });

  it('should get current state snapshot', () => {
    service.updateState({ timeRemaining: 250 });
    const snapshot = service.getState();

    expect(snapshot.timeRemaining).toBe(250);
    expect(snapshot.phase).toBe(GamePhase.NOT_STARTED);
  });

  it('should handle config update', (done) => {
    const config: GameConfig = {
      players: ['P1', 'P2'],
      selectedDecks: ['deck1', 'deck2']
    };

    service.updateState({ config });

    service.state$.subscribe(state => {
      expect(state.config).toEqual(config);
      done();
    });
  });

  it('should handle card state updates', (done) => {
    service.updateState({
      currentRole: 'Developer',
      currentSubject: 'API Design',
      hasChangedRole: true,
      hasChangedSubject: false
    });

    service.state$.subscribe(state => {
      expect(state.currentRole).toBe('Developer');
      expect(state.currentSubject).toBe('API Design');
      expect(state.hasChangedRole).toBeTrue();
      expect(state.hasChangedSubject).toBeFalse();
      done();
    });
  });

  it('should handle available roles and subjects updates', (done) => {
    const roles = ['Role 1', 'Role 2', 'Role 3'];
    const subjects = ['Subject A', 'Subject B'];

    service.updateState({
      availableRoles: roles,
      selectedSubjectDeckInRound: subjects
    });

    service.state$.subscribe(state => {
      expect(state.availableRoles).toEqual(roles);
      expect(state.selectedSubjectDeckInRound).toEqual(subjects);
      done();
    });
  });

  it('should preserve immutability when updating arrays', (done) => {
    const roles = ['Role 1', 'Role 2'];
    service.updateState({ availableRoles: [...roles] });

    // Mutate the original array - this should NOT affect the state
    roles.push('Role 3');

    service.state$.subscribe(state => {
      // State should still have only 2 roles, not affected by mutation
      expect(state.availableRoles).toEqual(['Role 1', 'Role 2']);
      expect(state.availableRoles.length).toBe(2);
      done();
    });
  });
});
