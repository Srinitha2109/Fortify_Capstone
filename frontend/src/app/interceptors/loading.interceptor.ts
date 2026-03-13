import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  //loading excluded
  if (req.url.includes('/api/notifications') ||
    req.url.includes('/api/claims/policy-application') ||
    req.url.includes('/api/policy-applications/user')) {
    return next(req);
  }

  loadingService.show();

  //pipe ensures after http req made spinner is hidden finalizes runs when observable ends
  return next(req).pipe(
    finalize(() => loadingService.hide()) //finalize subscriber+error ,hide will run if req is succeded or their is error
  );
};
