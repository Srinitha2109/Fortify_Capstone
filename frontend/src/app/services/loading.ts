import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  isLoading = signal(false);
  private activeRequests = 0;
  private showTimeout: any = null;

  show() {
    this.activeRequests++;
    if (this.showTimeout) return;

    this.showTimeout = setTimeout(() => {
      if (this.activeRequests > 0) {
        this.isLoading.set(true);
      }
      this.showTimeout = null;
    }, 200); // Only show if request takes > 200ms
  }

  hide() {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    if (this.activeRequests === 0) {
      if (this.showTimeout) {
        clearTimeout(this.showTimeout);
        this.showTimeout = null;
      }
      setTimeout(() => {
        if (this.activeRequests === 0) {
          this.isLoading.set(false);
        }
      }, 200); // Shortened hide delay
    }
  }
}
