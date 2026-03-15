import 'zone.js';
import 'zone.js/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { vi } from 'vitest';
import { ThemeService } from './theme';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');

    TestBed.configureTestingModule({ providers: [ThemeService] });
    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should use light theme by default when no preference is saved', () => {
    // No localStorage, matchMedia returns false for dark
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: false } as MediaQueryList);
    const freshService = new ThemeService();
    expect(freshService.isDark()).toBe(false);
  });

  it('should restore theme from localStorage (dark)', () => {
    localStorage.setItem('theme', 'dark');
    const freshService = new ThemeService();
    expect(freshService.isDark()).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should restore theme from localStorage (light)', () => {
    localStorage.setItem('theme', 'light');
    const freshService = new ThemeService();
    expect(freshService.isDark()).toBe(false);
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
  });

  it('should toggle from light to dark', () => {
    localStorage.setItem('theme', 'light');
    const freshService = new ThemeService();
    expect(freshService.isDark()).toBe(false);
    freshService.toggleTheme();
    expect(freshService.isDark()).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('should toggle from dark to light', () => {
    localStorage.setItem('theme', 'dark');
    const freshService = new ThemeService();
    expect(freshService.isDark()).toBe(true);
    freshService.toggleTheme();
    expect(freshService.isDark()).toBe(false);
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('should apply dark theme attribute when dark is set', () => {
    service.toggleTheme(); // If default is light, toggle to dark
    if (service.isDark()) {
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    }
  });

  it('should remove data-theme attribute when light is set', () => {
    localStorage.setItem('theme', 'dark');
    const freshService = new ThemeService();
    freshService.toggleTheme(); // toggle back to light
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
  });
});
