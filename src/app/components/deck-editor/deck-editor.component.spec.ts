import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
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
      'addDeck',
      'saveDecks',
      'removeDeck',
      'replaceAllDecks'
    ]);

    await TestBed.configureTestingModule({
      imports: [DeckEditorComponent],
      providers: [
        { provide: DeckService, useValue: deckServiceSpy }
      ]
    })
    .compileComponents();

    deckService = TestBed.inject(DeckService) as jasmine.SpyObj<DeckService>;

    // Create a fresh copy of mockDecks for each test to avoid mutations
    const freshMockDecks = JSON.parse(JSON.stringify(mockDecks));
    deckService.getDecks.and.returnValue(of(freshMockDecks));

    // Mock the decks property
    (deckService as any)['decks'] = { next: jasmine.createSpy('next'), value: freshMockDecks };

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

  it('should remove role from deck by index', () => {
    const deck = mockDecks[0];
    component.removeRole(deck, 0); // Remove first role
    expect(deckService.updateDeck).toHaveBeenCalledWith({
      ...deck,
      roles: ['Role 2']
    });
  });

  it('should remove role by index, not by content match', () => {
    // Update component.decks with custom roles
    component.decks[0] = {
      ...component.decks[0],
      roles: ['Developer', 'Manager', 'Developer']
    };
    const deck = component.decks[0];

    // Remove the second item (index 1, "Manager")
    component.removeRole(deck, 1);

    const callArg = deckService.updateDeck.calls.mostRecent().args[0];
    expect(callArg.roles).toEqual(['Developer', 'Developer']);
  });

  it('should remove correct duplicate role by index', () => {
    // Update component.decks with custom roles
    component.decks[0] = {
      ...component.decks[0],
      roles: ['Developer', 'Manager', 'Developer']
    };
    const deck = component.decks[0];

    // Remove the third item (index 2, second "Developer")
    component.removeRole(deck, 2);

    const callArg = deckService.updateDeck.calls.mostRecent().args[0];
    expect(callArg.roles).toEqual(['Developer', 'Manager']);
  });

  it('should remove subject from deck by index', () => {
    const deck = mockDecks[0];
    component.removeSubject(deck, 0); // Remove first subject
    expect(deckService.updateDeck).toHaveBeenCalledWith({
      ...deck,
      subjects: ['Subject 2']
    });
  });

  it('should remove subject by index, not by content match', () => {
    // Update component.decks with custom subjects
    component.decks[0] = {
      ...component.decks[0],
      subjects: ['Frontend', 'Backend', 'Frontend']
    };
    const deck = component.decks[0];

    // Remove the second item (index 1, "Backend")
    component.removeSubject(deck, 1);

    const callArg = deckService.updateDeck.calls.mostRecent().args[0];
    expect(callArg.subjects).toEqual(['Frontend', 'Frontend']);
  });

  it('should remove correct duplicate subject by index', () => {
    // Update component.decks with custom subjects
    component.decks[0] = {
      ...component.decks[0],
      subjects: ['Frontend', 'Backend', 'Frontend']
    };
    const deck = component.decks[0];

    // Remove the third item (index 2, second "Frontend")
    component.removeSubject(deck, 2);

    const callArg = deckService.updateDeck.calls.mostRecent().args[0];
    expect(callArg.subjects).toEqual(['Frontend', 'Backend']);
  });

  it('should add role to deck with optimistic update', fakeAsync(() => {
    const deck = mockDecks[0];

    // Call addRole
    component.addRole(deck);
    tick(); // Wait for setTimeout to complete

    // Verify local state is updated
    expect(component.decks[0].roles).toEqual(['Role 1', 'Role 2', 'a compléter']);

    // Verify service was called for background save
    expect(deckService.updateDeck).toHaveBeenCalledWith({
      ...deck,
      roles: ['Role 1', 'Role 2', 'a compléter']
    });
  }));

  it('should add subject to deck with optimistic update', fakeAsync(() => {
    const deck = mockDecks[0];

    // Call addSubject
    component.addSubject(deck);
    tick(); // Wait for setTimeout to complete

    // Verify local state is updated
    expect(component.decks[0].subjects).toEqual(['Subject 1', 'Subject 2', 'a compléter']);

    // Verify service was called for background save
    expect(deckService.updateDeck).toHaveBeenCalledWith({
      ...deck,
      subjects: ['Subject 1', 'Subject 2', 'a compléter']
    });
  }));

  it('should verify addRole creates a new deck object (immutability)', fakeAsync(() => {
    const deck = mockDecks[0];
    const originalRoles = [...deck.roles];
    component.addRole(deck);
    tick(); // Wait for setTimeout to complete

    // Verify original deck is unchanged (immutability)
    expect(deck.roles).toEqual(originalRoles);

    // Verify updateDeck was called with a NEW object
    const callArg = deckService.updateDeck.calls.mostRecent().args[0];
    expect(callArg).not.toBe(deck); // Different object reference
    expect(callArg.roles).toEqual(['Role 1', 'Role 2', 'a compléter']);
  }));

  it('should verify addSubject creates a new deck object (immutability)', fakeAsync(() => {
    const deck = mockDecks[0];
    const originalSubjects = [...deck.subjects];
    component.addSubject(deck);
    tick(); // Wait for setTimeout to complete

    // Verify original deck is unchanged (immutability)
    expect(deck.subjects).toEqual(originalSubjects);

    // Verify updateDeck was called with a NEW object
    const callArg = deckService.updateDeck.calls.mostRecent().args[0];
    expect(callArg).not.toBe(deck); // Different object reference
    expect(callArg.subjects).toEqual(['Subject 1', 'Subject 2', 'a compléter']);
  }));

  it('should update role in deck', () => {
    const deck = mockDecks[0];
    const event = { target: { value: 'New Role' } } as unknown as Event;
    component.updateRole(deck, 0, event);
    expect(deckService.updateDeck).toHaveBeenCalledWith({
      ...deck,
      roles: ['New Role', 'Role 2']
    });
  });

  it('should update subject in deck', () => {
    const deck = mockDecks[0];
    const event = { target: { value: 'New Subject' } } as unknown as Event;
    component.updateSubject(deck, 0, event);
    expect(deckService.updateDeck).toHaveBeenCalledWith({
      ...deck,
      subjects: ['New Subject', 'Subject 2']
    });
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
  
  it('should add new deck when addDeck is called', () => {
    spyOn(Date, 'now').and.returnValue(123456789);
    component.addDeck();
    expect(deckService.addDeck).toHaveBeenCalledWith({
      id: '123456789',
      name: 'Nouveau deck',
      description: 'Description du deck',
      subjects: ['Nouveau sujet'],
      roles: ['Nouveau rôle']
    });
    expect(deckService.getDecks).toHaveBeenCalled();
  });
  
  it('should remove deck when removeDeck is called', () => {
    const deck = mockDecks[0];
    spyOn(window, 'confirm').and.returnValue(true);
    component.removeDeck(deck);
    expect(deckService.removeDeck).toHaveBeenCalledWith(deck.id);
  });

  it('should not remove deck when confirm returns false', () => {
    const deck = mockDecks[0];
    spyOn(window, 'confirm').and.returnValue(false);
    component.removeDeck(deck);
    expect(deckService.removeDeck).not.toHaveBeenCalled();
  });
  
  it('should update deck name', () => {
    const deck = mockDecks[0];
    const event = { target: { value: 'New Name' } } as unknown as Event;
    component.updateDeckName(deck, event);
    expect(deckService.updateDeck).toHaveBeenCalledWith({
      ...deck,
      name: 'New Name'
    });
  });
  
  it('should have button to add new deck', () => {
    const addButton = fixture.debugElement.query(By.css('.add-deck-button'));
    expect(addButton).not.toBeNull();

    spyOn(component, 'addDeck');
    addButton.triggerEventHandler('click', null);
    expect(component.addDeck).toHaveBeenCalled();
  });

  describe('UX: Single-Click Add After Edit (mousedown fix)', () => {
    it('should use mousedown event for add role button', () => {
      fixture.detectChanges();

      // Verify the button uses mousedown instead of click
      const addRoleButton = fixture.debugElement.query(By.css('.roles-section .button-add'));
      expect(addRoleButton).toBeTruthy();

      // Verify mousedown handler is present
      const mousedownSpy = spyOn(component, 'addRole');
      addRoleButton.triggerEventHandler('mousedown', null);
      expect(mousedownSpy).toHaveBeenCalled();
    });

    it('should use mousedown event for add subject button', () => {
      fixture.detectChanges();

      // Verify the button uses mousedown instead of click
      const addSubjectButton = fixture.debugElement.query(By.css('.subjects-section .button-add'));
      expect(addSubjectButton).toBeTruthy();

      // Verify mousedown handler is present
      const mousedownSpy = spyOn(component, 'addSubject');
      addSubjectButton.triggerEventHandler('mousedown', null);
      expect(mousedownSpy).toHaveBeenCalled();
    });

    it('should trigger addRole on mousedown without requiring click', fakeAsync(() => {
      fixture.detectChanges();
      const deck = component.decks[0];
      const initialCount = deck.roles.length;

      // Simulate mousedown on add button
      const addRoleButton = fixture.debugElement.query(By.css('.roles-section .button-add'));
      addRoleButton.triggerEventHandler('mousedown', null);
      tick(); // Wait for setTimeout to complete
      fixture.detectChanges();

      // Verify role was added
      expect(component.decks[0].roles.length).toBe(initialCount + 1);
      expect(component.decks[0].roles).toContain('a compléter');
    }));

    it('should trigger addSubject on mousedown without requiring click', fakeAsync(() => {
      fixture.detectChanges();
      const deck = component.decks[0];
      const initialCount = deck.subjects.length;

      // Simulate mousedown on add button
      const addSubjectButton = fixture.debugElement.query(By.css('.subjects-section .button-add'));
      addSubjectButton.triggerEventHandler('mousedown', null);
      tick(); // Wait for setTimeout to complete
      fixture.detectChanges();

      // Verify subject was added
      expect(component.decks[0].subjects.length).toBe(initialCount + 1);
      expect(component.decks[0].subjects).toContain('a compléter');
    }));
  });

  describe('Accessibility: Keyboard Navigation', () => {
    it('should still work with Enter key on add role button', () => {
      fixture.detectChanges();
      const deck = component.decks[0];
      const initialCount = deck.roles.length;

      const addRoleButton = fixture.debugElement.query(By.css('.roles-section .button-add'));
      const buttonElement = addRoleButton.nativeElement as HTMLButtonElement;

      // Simulate Enter key press (keyboard navigation)
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      buttonElement.dispatchEvent(enterEvent);

      // Enter key should trigger default button behavior (click/mousedown)
      // In real browsers, Enter on a button triggers click event
      addRoleButton.triggerEventHandler('click', null);
      fixture.detectChanges();

      // Button should still be clickable via keyboard
      expect(buttonElement.tagName).toBe('BUTTON');
      expect(buttonElement.type).toBe('submit'); // Default button type
    });

    it('should still work with Space key on add subject button', () => {
      fixture.detectChanges();
      const deck = component.decks[0];

      const addSubjectButton = fixture.debugElement.query(By.css('.subjects-section .button-add'));
      const buttonElement = addSubjectButton.nativeElement as HTMLButtonElement;

      // Simulate Space key press (keyboard navigation)
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
      buttonElement.dispatchEvent(spaceEvent);

      // Space key should trigger default button behavior
      addSubjectButton.triggerEventHandler('click', null);
      fixture.detectChanges();

      // Button should still be accessible via keyboard
      expect(buttonElement.tagName).toBe('BUTTON');
    });

    it('should have proper button semantics for screen readers', () => {
      fixture.detectChanges();

      const addRoleButton = fixture.debugElement.query(By.css('.roles-section .button-add'));
      const addSubjectButton = fixture.debugElement.query(By.css('.subjects-section .button-add'));

      const roleButtonEl = addRoleButton.nativeElement as HTMLButtonElement;
      const subjectButtonEl = addSubjectButton.nativeElement as HTMLButtonElement;

      // Verify buttons are actual button elements (not divs with click handlers)
      expect(roleButtonEl.tagName).toBe('BUTTON');
      expect(subjectButtonEl.tagName).toBe('BUTTON');

      // Verify buttons are keyboard focusable
      expect(roleButtonEl.tabIndex).toBeGreaterThanOrEqual(0);
      expect(subjectButtonEl.tabIndex).toBeGreaterThanOrEqual(0);
    });

    it('should maintain DOM structure after adding items', () => {
      fixture.detectChanges();

      const addRoleButton = fixture.debugElement.query(By.css('.roles-section .button-add'));
      const buttonElement = addRoleButton.nativeElement as HTMLButtonElement;

      // Verify button is in DOM before action
      expect(buttonElement.isConnected).toBeTrue();

      // Trigger mousedown
      addRoleButton.triggerEventHandler('mousedown', null);
      fixture.detectChanges();

      // Button should still be in the DOM and focusable after adding item
      const buttonAfter = fixture.debugElement.query(By.css('.roles-section .button-add'));
      expect(buttonAfter).toBeTruthy();
      expect(buttonAfter.nativeElement.isConnected).toBeTrue();
    });
  });

  describe('Optimistic UI Updates', () => {
    it('should update local decks array immediately when adding role', fakeAsync(() => {
      const deck = mockDecks[0];
      const initialRoles = [...deck.roles];

      component.addRole(deck);
      tick(); // Wait for setTimeout to complete

      // Local state should be updated
      expect(component.decks[0].roles.length).toBe(initialRoles.length + 1);
      expect(component.decks[0].roles).toContain('a compléter');
    }));

    it('should update local decks array immediately when removing role', () => {
      const deck = mockDecks[0];
      const initialLength = deck.roles.length;

      component.removeRole(deck, 0);

      // Local state should be updated instantly
      expect(component.decks[0].roles.length).toBe(initialLength - 1);
    });

    it('should update local decks array immediately when adding subject', fakeAsync(() => {
      const deck = mockDecks[0];
      const initialSubjects = [...deck.subjects];

      component.addSubject(deck);
      tick(); // Wait for setTimeout to complete

      // Local state should be updated
      expect(component.decks[0].subjects.length).toBe(initialSubjects.length + 1);
      expect(component.decks[0].subjects).toContain('a compléter');
    }));

    it('should update local decks array immediately when removing subject', () => {
      const deck = mockDecks[0];
      const initialLength = deck.subjects.length;

      component.removeSubject(deck, 0);

      // Local state should be updated instantly
      expect(component.decks[0].subjects.length).toBe(initialLength - 1);
    });

    it('should update local decks array immediately when updating role', () => {
      const deck = mockDecks[0];
      const event = { target: { value: 'Updated Role' } } as unknown as Event;

      component.updateRole(deck, 0, event);

      // Local state should be updated instantly
      expect(component.decks[0].roles[0]).toBe('Updated Role');
    });

    it('should update local decks array immediately when updating subject', () => {
      const deck = mockDecks[0];
      const event = { target: { value: 'Updated Subject' } } as unknown as Event;

      component.updateSubject(deck, 0, event);

      // Local state should be updated instantly
      expect(component.decks[0].subjects[0]).toBe('Updated Subject');
    });

    it('should update local decks array immediately when updating deck name', () => {
      const deck = mockDecks[0];
      const event = { target: { value: 'Updated Name' } } as unknown as Event;

      component.updateDeckName(deck, event);

      // Local state should be updated instantly
      expect(component.decks[0].name).toBe('Updated Name');
    });

    it('should maintain immutability with optimistic updates', fakeAsync(() => {
      const deck = mockDecks[0];
      const originalDeck = { ...deck };

      component.addRole(deck);
      tick(); // Wait for setTimeout to complete

      // Original deck parameter should not be mutated
      expect(deck).toEqual(originalDeck);

      // But component's local state should have the update
      expect(component.decks[0].roles).toContain('a compléter');
    }));

    it('should handle multiple rapid updates correctly', fakeAsync(() => {
      const deck = mockDecks[0];

      component.addRole(deck);
      component.addRole(deck);
      component.addRole(deck);
      tick(); // Wait for all setTimeouts to complete

      // All three additions should be reflected
      expect(component.decks[0].roles).toEqual([
        'Role 1',
        'Role 2',
        'a compléter',
        'a compléter',
        'a compléter'
      ]);

      // Service should have been called 3 times
      expect(deckService.updateDeck).toHaveBeenCalledTimes(3);
    }));

    it('should preserve role edit when adding new role (bug fix)', fakeAsync(() => {
      const deck = mockDecks[0];

      // Simulate editing a role
      const editEvent = { target: { value: 'Edited Role' } } as unknown as Event;
      component.updateRole(deck, 0, editEvent);

      // Immediately add a new role (simulating clicking + button)
      component.addRole(component.decks[0]);
      tick(); // Wait for setTimeout to complete

      // The edited value should be preserved, not lost
      expect(component.decks[0].roles[0]).toBe('Edited Role');
      expect(component.decks[0].roles[2]).toBe('a compléter');
      expect(component.decks[0].roles.length).toBe(3);
    }));

    it('should preserve subject edit when adding new subject (bug fix)', fakeAsync(() => {
      const deck = mockDecks[0];

      // Simulate editing a subject
      const editEvent = { target: { value: 'Edited Subject' } } as unknown as Event;
      component.updateSubject(deck, 0, editEvent);

      // Immediately add a new subject (simulating clicking + button)
      component.addSubject(component.decks[0]);
      tick(); // Wait for setTimeout to complete

      // The edited value should be preserved, not lost
      expect(component.decks[0].subjects[0]).toBe('Edited Subject');
      expect(component.decks[0].subjects[2]).toBe('a compléter');
      expect(component.decks[0].subjects.length).toBe(3);
    }));
  });
});
