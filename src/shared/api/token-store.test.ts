import { describe, expect, it, vi } from 'vitest';
import { tokenStore } from '@/shared/api/token-store';

describe('tokenStore.clear', () => {
  it('lets a subscriber clear again without recursing', () => {
    tokenStore.set('a.b.c');
    const listener = vi.fn(() => {
      if (!tokenStore.get()) tokenStore.clear();
    });
    const unsubscribe = tokenStore.subscribe(listener);
    expect(() => tokenStore.clear()).not.toThrow();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(tokenStore.get()).toBeNull();
    unsubscribe();
  });

  it('does not notify when there was nothing to clear', () => {
    tokenStore.clear();
    const listener = vi.fn();
    const unsubscribe = tokenStore.subscribe(listener);
    tokenStore.clear();
    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
  });
});
