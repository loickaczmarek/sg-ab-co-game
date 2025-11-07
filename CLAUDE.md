# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Start dev server: `npm start` or `ng serve`
- Build: `npm run build`
- Watch mode: `npm run watch`
- Run all tests: `npm test`
- Run tests (watch mode): `npm run test:watch`
- Run tests with coverage: `npm run test:coverage`
- Run single test: `ng test --include=*/path/to/test-file.spec.ts`

## Code Style Guidelines
- **Components**: PascalCase with Component suffix (GameComponent)
- **Services**: PascalCase with Service suffix (GameService)
- **Files**: kebab-case (game.component.ts)
- **Component selectors**: kebab-case with app- prefix (app-game)
- **Imports**: Angular imports first, then services, then models/interfaces
- **State Management**: Use BehaviorSubject in services, expose as Observable
- **Error Handling**: Defensive programming with null checks, unsubscribe from subscriptions
- **Testing**: Mock services with jasmine.createSpyObj, test component creation and methods
- **Component Structure**: Properties first, constructor, lifecycle methods, public methods, private methods