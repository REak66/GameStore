import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { filter, take, map } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isInitialized$.pipe(
    filter(init => init),
    take(1),
    map(() => {
      if (authService.isLoggedIn) return true;
      router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }),
  );
};
