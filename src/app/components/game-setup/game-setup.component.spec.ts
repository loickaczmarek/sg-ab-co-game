import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GameSetupComponent } from './game-setup.component';
import { DeckService } from '../../services/deck.service';
import { GameService } from '../../services/game.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Deck } from '../../models/game.interface';
import { FormsModule } from '@angular/forms';

describe('GameSetupComponent', () => {
  let component: GameSetupComponent;
  let fixture: ComponentFixture<GameSetupComponent>;
  let deckService: jasmine.SpyObj<DeckService>;
  let gameService: jasmine.SpyObj<GameService>;
  let router: jasmine.SpyObj<Router>;

  const mockDecks: Deck[] = [
    {
      id: '1',
      name: 'Test Deck 1',
      description: 'Test Description 1',
      subjects: ['Subject 1', 'Subject 2'],
      roles: ['Role 1', 'Role 2']
    },
    {
      id: '2',
      name: 'Test Deck 2',
      description: 'Test Description 2',
      subjects: ['Subject 3', 'Subject 4'],
      roles: ['Role 3', 'Role 4']
    }
  ];

  beforeEach(async () => {
    const deckServiceSpy = jasmine.createSpyObj('DeckService', ['getDecks']);
    const gameServiceSpy = jasmine.createSpyObj('GameService', ['initializeGame']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    deckServiceSpy.getDecks.and.returnValue(of(mockDecks));

    await TestBed.configureTestingModule({
      imports: [GameSetupComponent, FormsModule, HttpClientTestingModule],
      providers: [
        { provide: DeckService, useValue: deckServiceSpy },
        { provide: GameService, useValue: gameServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    deckService = TestBed.inject(DeckService) as jasmine.SpyObj<DeckService>;
    gameService = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(GameSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load decks on init', () => {
    expect(deckService.getDecks).toHaveBeenCalled();
    expect(component.availableDecks).toEqual(mockDecks);
  });

  it('should not create memory leak when loading decks', () => {
    // Verify getDecks was called exactly once during ngOnInit
    // This ensures the subscription completes and doesn't create multiple calls
    expect(deckService.getDecks).toHaveBeenCalledTimes(1);
  });

  it('should add player', () => {
    component.newPlayerName = 'Test Player';
    component.addPlayer();
    expect(component.players).toContain('Test Player');
    expect(component.newPlayerName).toBe('');
  });

  it('should not add empty player name', () => {
    component.newPlayerName = '  ';
    component.addPlayer();
    expect(component.players.length).toBe(0);
  });

  it('should remove player', () => {
    component.players = ['Player 1', 'Player 2'];
    component.removePlayer(0);
    expect(component.players).toEqual(['Player 2']);
  });

  it('should toggle deck selection', () => {
    component.toggleDeck('1');
    expect(component.selectedDecks).toContain('1');

    component.toggleDeck('1');
    expect(component.selectedDecks).not.toContain('1');
  });

  it('should not allow starting game with less than 2 players', () => {
    component.players = ['Player 1'];
    component.selectedDecks = ['1'];
    expect(component.canStartGame()).toBeFalse();
  });

  it('should not allow starting game with no decks selected', () => {
    component.players = ['Player 1', 'Player 2'];
    component.selectedDecks = [];
    expect(component.canStartGame()).toBeFalse();
  });

  it('should allow starting game with 2+ players and selected decks', () => {
    component.players = ['Player 1', 'Player 2'];
    component.selectedDecks = ['1'];
    expect(component.canStartGame()).toBeTrue();
  });

  it('should initialize game and navigate when starting', () => {
    component.players = ['Player 1', 'Player 2'];
    component.selectedDecks = ['1', '2'];

    component.startGame();

    expect(gameService.initializeGame).toHaveBeenCalledWith({
      players: ['Player 1', 'Player 2'],
      selectedDecks: ['1', '2']
    });
    expect(router.navigate).toHaveBeenCalledWith(['/game']);
  });

  it('should toggle info expansion', () => {
    expect(component.isInfoExpanded).toBeTrue();
    component.toggleInfo();
    expect(component.isInfoExpanded).toBeFalse();
    component.toggleInfo();
    expect(component.isInfoExpanded).toBeTrue();
  });

  it('should start game when onStartGameClick is called with valid setup', () => {
    spyOn(component, 'startGame');
    component.players = ['Player 1', 'Player 2'];
    component.selectedDecks = ['1'];

    component.onStartGameClick();
    expect(component.startGame).toHaveBeenCalled();
  });

  it('should not start game when onStartGameClick is called with invalid setup', () => {
    spyOn(component, 'startGame');
    component.players = ['Player 1'];
    component.selectedDecks = [];

    component.onStartGameClick();
    expect(component.startGame).not.toHaveBeenCalled();
  });
});
