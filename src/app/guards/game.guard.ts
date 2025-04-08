import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { GameService } from '../services/game.service';
import { map } from 'rxjs/operators';

export const gameGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const gameService = inject(GameService);

  return gameService.getGameState().pipe(
    map(gameState => {
      // Si une partie est en cours (il y a un joueur actif), bloquer la navigation
      if (gameState.currentPlayer) {
        router.navigate(['/']);
        return false;
      }
      return true;
    })
  );
}; 