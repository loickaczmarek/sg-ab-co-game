# Project Rules - SG-AB-CO Game

## Architecture

### Structure générale
Application Angular modulaire avec séparation claire des responsabilités :

```
src/app/
├── components/     # Composants standalone avec lazy loading
├── services/       # Services de gestion d'état et logique métier
├── models/         # Interfaces TypeScript
├── guards/         # Guards de navigation
└── app.routes.ts   # Configuration du routage
```

### Organisation des routes
- `/` : Page d'accueil
- `/setup` : Configuration du jeu
- `/game` : Jeu principal
- `/editor` : Éditeur de decks

### Composants standalone
- Utilisation de composants standalone (Angular 14+)
- Lazy loading pour l'optimisation des performances
- Injection de dépendances dans les constructeurs

## Conventions de code

### Nommage

#### Fichiers
- Format : **kebab-case**
- Exemples : `game.component.ts`, `deck.service.ts`, `player.model.ts`

#### Classes
- **Composants** : PascalCase + suffixe `Component`
  - Exemple : `GameComponent`, `SetupComponent`
- **Services** : PascalCase + suffixe `Service`
  - Exemple : `GameService`, `DeckService`
- **Interfaces/Models** : PascalCase
  - Exemple : `GameState`, `Player`, `Card`

#### Sélecteurs
- Format : **kebab-case** avec préfixe `app-`
- Exemples : `app-game`, `app-setup`, `app-editor`

### Ordre des imports
Respecter cet ordre systématiquement :
1. Imports Angular core
2. Imports de services
3. Imports de models/interfaces
4. Imports RxJS

Exemple :
```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../services/game.service';
import { DeckService } from '../services/deck.service';
import { GameState, Player } from '../models/game.model';
import { Observable } from 'rxjs';
```

### Structure des composants
Organisation des propriétés et méthodes :
1. Propriétés publiques
2. Propriétés privées
3. Constructeur
4. Méthodes de cycle de vie (`ngOnInit`, `ngOnDestroy`, etc.)
5. Méthodes publiques
6. Méthodes privées

### TypeScript
- Annotations de type explicites
- Utilisation d'interfaces pour les définitions de types
- Propriétés privées pour l'état interne
- Pas de `any` (sauf cas exceptionnels justifiés)

## Gestion d'état

### Pattern principal : BehaviorSubject + Observable

#### Dans les services
```typescript
export class GameService {
  private gameState = new BehaviorSubject<GameState>(initialState);

  // Exposition en lecture seule via Observable
  getGameState(): Observable<GameState> {
    return this.gameState.asObservable();
  }

  // Mise à jour immuable de l'état
  updateState(newState: Partial<GameState>): void {
    this.gameState.next({
      ...this.gameState.value,
      ...newState
    });
  }
}
```

#### Principes
- **BehaviorSubject** pour l'état interne (privé)
- **Observable** pour l'exposition publique via `asObservable()`
- Mises à jour immuables avec spread operator
- Prévention des mutations directes de l'état

### Communication entre composants
- Partage d'état via services
- Flux de données unidirectionnel
- Services découplés avec responsabilités claires

### Exemples de services d'état
- `GameService` : État du jeu, logique métier, progression
- `DeckService` : Gestion des decks de cartes

## Stratégie de test

### Organisation des tests
- **Colocalisation** : Tests à côté des fichiers source (`*.spec.ts`)
- **Frameworks** : Angular TestBed + Jasmine

### Pattern de test standard

```typescript
describe('ComponentName', () => {
  let component: ComponentName;
  let fixture: ComponentFixture<ComponentName>;
  let mockService: jasmine.SpyObj<ServiceName>;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('ServiceName', ['method1', 'method2']);

    await TestBed.configureTestingModule({
      imports: [ComponentName],
      providers: [
        { provide: ServiceName, useValue: mockService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentName);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### Approche de mocking
- **Services** : `jasmine.createSpyObj()` pour créer des mocks
- **Injection** : Utilisation des providers dans TestBed
- **Données** : Objets mock prédéfinis pour états et configurations

### Couverture des tests
- Création des composants
- Comportements des méthodes
- Interactions avec les services
- Cas limites (formatage, changements d'état)

### Commandes
```bash
npm test                  # Lancer tous les tests
npm run test:watch        # Mode watch
npm run test:coverage     # Avec couverture
ng test --include=*/path  # Test unique
```

## Patterns utilisés

### RxJS et Observables

#### Gestion des subscriptions
```typescript
export class Component implements OnInit, OnDestroy {
  private subscription: Subscription;

  ngOnInit() {
    this.subscription = this.service.getData()
      .subscribe(data => this.handleData(data));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
```

#### Timers et intervals
- Utilisation de `interval()` pour les timers
- Nettoyage approprié via `unsubscribe()`

### Programmation défensive

#### Null checks
```typescript
if (player && player.cards && player.cards.length > 0) {
  // Logique sécurisée
}
```

#### Reset et états initiaux
- Méthodes de reset claires pour réinitialiser l'état
- Gestion des transitions d'état

### Immutabilité

#### Mises à jour d'état
```typescript
// Mauvais
this.state.property = newValue;

// Bon
this.state = {
  ...this.state,
  property: newValue
};
```

### Dependency Injection
- Injection via constructeur
- Utilisation de `inject()` pour les services
- Testabilité via mocking

### Lifecycle Management
- `ngOnInit()` : Initialisation du composant
- `ngOnDestroy()` : Nettoyage des ressources
- Subscription cleanup systématique

## Best Practices

### Performance
- Lazy loading des routes
- Composants standalone pour optimiser le bundling
- Change detection strategy (à considérer pour optimisations futures)

### Sécurité du code
- Pas de mutation directe des états
- Null checks systématiques
- Typage fort avec TypeScript

### Maintenabilité
- Séparation des responsabilités (SRP)
- Services pour la logique métier
- Composants pour la présentation
- Interfaces pour les contrats de données

### Évolutivité
- Architecture modulaire
- Services découplés
- State management centralisé
- Tests complets

## Recommandations futures

1. **Gestion d'erreur** : Implémenter une stratégie plus complète
2. **Logging** : Ajouter un système de logging granulaire
3. **Tests** : Enrichir les tests de transitions d'état complexes
4. **State Management** : Considérer NgRx pour une gestion d'état plus complexe
5. **Documentation** : Ajouter JSDoc pour les API publiques
