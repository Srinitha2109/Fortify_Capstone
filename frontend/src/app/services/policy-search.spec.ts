import 'zone.js';
import 'zone.js/testing';
import { TestBed } from '@angular/core/testing';
import { PolicySearchService } from './policy-search.service';

describe('PolicySearchService', () => {
  let service: PolicySearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PolicySearchService] });
    service = TestBed.inject(PolicySearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with empty search query', () => {
    expect(service.searchQuery()).toBe('');
  });

  it('should set query via setQuery()', () => {
    service.setQuery('fire insurance');
    expect(service.searchQuery()).toBe('fire insurance');
  });

  it('should reset query to empty string via reset()', () => {
    service.setQuery('some query');
    service.reset();
    expect(service.searchQuery()).toBe('');
  });

  it('should update query on multiple setQuery calls', () => {
    service.setQuery('query 1');
    service.setQuery('query 2');
    expect(service.searchQuery()).toBe('query 2');
  });
});
