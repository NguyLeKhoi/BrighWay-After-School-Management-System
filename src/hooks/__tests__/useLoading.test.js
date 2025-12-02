import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLoading } from '../useLoading';

describe('useLoading', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with loading false', () => {
    const { result } = renderHook(() => useLoading());
    
    expect(result.current.isLoading).toBe(false);
  });

  it('should show loading when showLoading is called', () => {
    const { result } = renderHook(() => useLoading());
    
    act(() => {
      result.current.showLoading();
    });
    
    expect(result.current.isLoading).toBe(true);
  });

  it('should hide loading immediately if minimum duration has passed', async () => {
    const { result } = renderHook(() => useLoading(300));
    
    act(() => {
      result.current.showLoading();
    });
    
    // Fast-forward time by 400ms (more than minimum duration)
    act(() => {
      vi.advanceTimersByTime(400);
    });
    
    act(() => {
      result.current.hideLoading();
    });
    
    // Should hide immediately since enough time has passed
    expect(result.current.isLoading).toBe(false);
  });

  it('should wait for remaining time if minimum duration has not passed', async () => {
    const { result } = renderHook(() => useLoading(500));
    
    act(() => {
      result.current.showLoading();
    });
    
    // Fast-forward time by 200ms (less than minimum duration)
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    act(() => {
      result.current.hideLoading();
    });
    
    // Should still be loading
    expect(result.current.isLoading).toBe(true);
    
    // Fast-forward remaining 300ms
    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    // Should be hidden now
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle multiple show/hide cycles', async () => {
    const { result } = renderHook(() => useLoading(200));
    
    // First cycle
    act(() => {
      result.current.showLoading();
    });
    expect(result.current.isLoading).toBe(true);
    
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    act(() => {
      result.current.hideLoading();
    });
    
    expect(result.current.isLoading).toBe(false);
    
    // Second cycle
    act(() => {
      result.current.showLoading();
    });
    expect(result.current.isLoading).toBe(true);
    
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    act(() => {
      result.current.hideLoading();
    });
    
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle hideLoading called without showLoading', () => {
    const { result } = renderHook(() => useLoading());
    
    act(() => {
      result.current.hideLoading();
    });
    
    expect(result.current.isLoading).toBe(false);
  });

  it('should respect custom minimum duration', async () => {
    const { result } = renderHook(() => useLoading(1000));
    
    act(() => {
      result.current.showLoading();
    });
    
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    act(() => {
      result.current.hideLoading();
    });
    
    // Should still be loading (only 500ms passed, need 1000ms)
    expect(result.current.isLoading).toBe(true);
    
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    // Should be hidden now
    expect(result.current.isLoading).toBe(false);
  });
});

