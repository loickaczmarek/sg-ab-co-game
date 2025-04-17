import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeckEditorComponent } from './deck-editor.component';
import { DeckService } from '../../services/deck.service';
import { of } from 'rxjs';
import { Deck } from '../../models/game.interface';
import { By } from '@angular/platform-browser';

describe('DeckEditorComponent', () => {
  let component: DeckEditorComponent;
  let fixture: ComponentFixture<DeckEditorComponent>;
  let deckService: jasmine.SpyObj<DeckService>;

  const mockDecks: Deck[] = [
    {
      id: '1',
      name: 'Test Deck',
      description: 'Test Description',
      subjects: ['Subject 1', 'Subject 2'],
      roles: ['Role 1', 'Role 2']
    }
  ];

  beforeEach(async () => {
    const deckServiceSpy = jasmine.createSpyObj('DeckService', [
      'getDecks',
      'updateDeck',
      'resetDecks',
      'addDeck'
    ]);

    await TestBed.configureTestingModule({
      imports: [DeckEditorComponent],
      providers: [
        { provide: DeckService, useValue: deckServiceSpy }
      ]
    })
    .compileComponents();

    deckService = TestBed.inject(DeckService) as jasmine.SpyObj<DeckService>;
    deckService.getDecks.and.returnValue(of(mockDecks));

    fixture = TestBed.createComponent(DeckEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load decks on init', () => {
    expect(deckService.getDecks).toHaveBeenCalled();
    expect(component.decks).toEqual(mockDecks);
  });

  it('should toggle deck expansion', () => {
    component.toggleDeck(0);
    expect(component.expandedDecks[0]).toBeTrue();
    component.toggleDeck(0);
    expect(component.expandedDecks[0]).toBeFalse();
  });

  it('should toggle info expansion', () => {
    component.toggleInfo();
    expect(component.isInfoExpanded).toBeFalse();
    component.toggleInfo();
    expect(component.isInfoExpanded).toBeTrue();
  });

  it('should remove role from deck', () => {
    const deck = mockDecks[0];
    component.removeRole(deck, 'Role 1');
    expect(deckService.updateDeck).toHaveBeenCalledWith(deck);
  });

  it('should remove subject from deck', () => {
    const deck = mockDecks[0];
    component.removeSubject(deck, 'Subject 1');
    expect(deckService.updateDeck).toHaveBeenCalledWith(deck);
  });

  it('should add role to deck', () => {
    const deck = mockDecks[0];
    component.addRole(deck);
    expect(deckService.updateDeck).toHaveBeenCalledWith(deck);
  });

  it('should add subject to deck', () => {
    const deck = mockDecks[0];
    component.addSubject(deck);
    expect(deckService.updateDeck).toHaveBeenCalledWith(deck);
  });

  it('should update role in deck', () => {
    const deck = mockDecks[0];
    const event = { target: { value: 'New Role' } } as unknown as Event;
    component.updateRole(deck, 0, event);
    expect(deckService.updateDeck).toHaveBeenCalledWith(deck);
  });

  it('should update subject in deck', () => {
    const deck = mockDecks[0];
    const event = { target: { value: 'New Subject' } } as unknown as Event;
    component.updateSubject(deck, 0, event);
    expect(deckService.updateDeck).toHaveBeenCalledWith(deck);
  });

  it('should export decks', () => {
    spyOn(window.URL, 'createObjectURL');
    spyOn(window.URL, 'revokeObjectURL');
    component.exportDecks();
    expect(window.URL.createObjectURL).toHaveBeenCalled();
    expect(window.URL.revokeObjectURL).toHaveBeenCalled();
  });

  it('should trigger file input click when import button is clicked', () => {
    const importButton = fixture.debugElement.query(By.css('.import-button'));
    spyOn(component, 'importDecksClick');
    importButton.triggerEventHandler('click', null);
    expect(component.importDecksClick).toHaveBeenCalled();
  });

  it('should have correct deck card styles', () => {
    const deckCard = fixture.debugElement.query(By.css('.deck-card'));
    const styles = window.getComputedStyle(deckCard.nativeElement);
    expect(styles.margin).toBe('1rem');
    expect(styles.padding).toBe('1rem');
    expect(styles.borderRadius).toBe('8px');
  });

  it('should have correct button styles', () => {
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    buttons.forEach(button => {
      const styles = window.getComputedStyle(button.nativeElement);
      expect(styles.margin).toBe('0.5rem');
      expect(styles.padding).toBe('0.5rem 1rem');
    });
  });

  it('should have correct input styles', () => {
    const inputs = fixture.debugElement.queryAll(By.css('input'));
    inputs.forEach(input => {
      const styles = window.getComputedStyle(input.nativeElement);
      expect(styles.margin).toBe('0.5rem');
      expect(styles.padding).toBe('0.5rem');
    });
  });
}); 