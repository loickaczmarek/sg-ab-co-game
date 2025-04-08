import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { GameSetupComponent } from './components/game-setup/game-setup.component';
import { GameComponent } from './components/game/game.component';
import { DeckEditorComponent } from './components/deck-editor/deck-editor.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'setup', component: GameSetupComponent },
  { path: 'game', component: GameComponent },
  { path: 'editor', component: DeckEditorComponent },
  { path: '**', redirectTo: '' }
];
