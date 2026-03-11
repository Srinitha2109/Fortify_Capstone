import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  
  // Optionally skip loading indicator for polling endpoints to prevent flashing every 30 seconds
  if (req.url.includes('/api/notifications')) {
      return next(req);
  }
  
  loadingService.show();

  return next(req).pipe(
    finalize(() => loadingService.hide())
  );
};
