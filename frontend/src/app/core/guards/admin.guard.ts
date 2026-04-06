import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { filter, take, map } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isInitialized$.pipe(
    filter(init => init),
    take(1),
    map(() => {
      if (authService.isAdmin) return true;
      router.navigate(['/']);
      return false;
    }),
  );
};
