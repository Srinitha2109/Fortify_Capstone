import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PolicySearchService {
  searchQuery = signal('');

  setQuery(query: string) {
    this.searchQuery.set(query);
  }

  reset() {
    this.searchQuery.set('');
  }
}
