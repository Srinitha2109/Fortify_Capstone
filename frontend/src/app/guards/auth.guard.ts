import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) {
    const expectedRoles = route.data?.['roles'] as Array<string>;
    if (expectedRoles && expectedRoles.length > 0) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const uRole = payload.role || payload.sub;
        if (!uRole || !expectedRoles.includes(uRole)) {
          router.navigate(['/landing']);
          return false;
        }
      } catch (e) {
        router.navigate(['/login']);
        return false;
      }
    }
    return true;
  }

  router.navigate(['/login']);
  return false;
};
