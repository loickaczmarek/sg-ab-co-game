import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameComponent } from './game.component';
import { GameService } from '../../services/game.service';
import { DeckService } from '../../services/deck.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { GameState, Deck, GameConfig } from '../../models/game.interface';
import { By } from '@angular/platform-browser';

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;
  let gameService: jasmine.SpyObj<GameService>;
  let deckService: jasmine.SpyObj<DeckService>;
  let router: jasmine.SpyObj<Router>;

  const mockGameState: GameState = {
    currentPlayer: '0',
    currentSubject: 'Test Subject',
    currentRole: 'Test Role',
    timeRemaining: 60,
    isPlaying: false
  };

  const mockDecks: Deck[] = [
    {
      id: '1',
      name: 'Test Deck',
      description: 'Test Description',
      subjects: ['Subject 1', 'Subject 2'],
      roles: ['Role 1', 'Role 2']
    }
  ];

  const mockGameConfig: GameConfig = {
    selectedDecks: ['1'],
    players: ['Player 1', 'Player 2']
  };

  beforeEach(async () => {
    const gameServiceSpy = jasmine.createSpyObj('GameService', [
      'getGameState',
      'getCurrentConfig',
      'selectSubjectDeck',
      'drawCard',
      'changeSubjectCard',
      'changeRoleCard',
      'hasChangedRoleCard',
      'hasChangedSubjectCard',
      'startTimer',
      'nextPlayer'
    ]);

    const deckServiceSpy = jasmine.createSpyObj('DeckService', ['getDecks']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [GameComponent],
      providers: [
        { provide: GameService, useValue: gameServiceSpy },
        { provide: DeckService, useValue: deckServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    gameService = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
    deckService = TestBed.inject(DeckService) as jasmine.SpyObj<DeckService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    gameService.getGameState.and.returnValue(of(mockGameState));
    gameService.getCurrentConfig.and.returnValue(mockGameConfig);
    deckService.getDecks.and.returnValue(of(mockDecks));

    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load game config and decks on init', () => {
    expect(gameService.getCurrentConfig).toHaveBeenCalled();
    expect(deckService.getDecks).toHaveBeenCalled();
    expect(component.availableDecks).toEqual(mockDecks);
  });

  it('should select subject deck and draw card', () => {
    component.selectSubjectDeck('1');
    expect(gameService.selectSubjectDeck).toHaveBeenCalledWith('1');
    expect(gameService.drawCard).toHaveBeenCalled();
  });

  it('should change subject card', () => {
    component.changeSubjectCard();
    expect(gameService.changeSubjectCard).toHaveBeenCalled();
  });

  it('should change role card', () => {
    component.changeRoleCard();
    expect(gameService.changeRoleCard).toHaveBeenCalled();
  });

  it('should check if role card has been changed', () => {
    gameService.hasChangedRoleCard.and.returnValue(true);
    expect(component.hasChangedRoleCard()).toBeTrue();
  });

  it('should check if subject card has been changed', () => {
    gameService.hasChangedSubjectCard.and.returnValue(true);
    expect(component.hasChangedSubjectCard()).toBeTrue();
  });

  it('should start timer', () => {
    component.startTurn();
    expect(gameService.startTimer).toHaveBeenCalled();
  });

  it('should move to next player', () => {
    component.nextPlayer();
    expect(gameService.nextPlayer).toHaveBeenCalled();
  });

  it('should format time correctly', () => {
    expect(component.formatTime(65)).toBe('1:05');
    expect(component.formatTime(120)).toBe('2:00');
    expect(component.formatTime(45)).toBe('0:45');
  });

  it('should restart game', () => {
    component.restartGame();
    expect(router.navigate).toHaveBeenCalledWith(['/setup']);
  });

  it('should handle rules click', () => {
    spyOn(console, 'log');
    component.onRulesClick();
    expect(console.log).toHaveBeenCalledWith('Règles cliquées');
  });
}); 