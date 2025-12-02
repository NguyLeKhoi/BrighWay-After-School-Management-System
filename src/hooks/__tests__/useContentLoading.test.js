import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import useContentLoading from '../useContentLoading';

describe('useContentLoading', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with loading false and default text', () => {
    const { result } = renderHook(() => useContentLoading());
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.loadingText).toBe('Đang tải...');
  });

  it('should show loading with default text', () => {
    const { result } = renderHook(() => useContentLoading());
    
    act(() => {
      result.current.showLoading();
    });
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.loadingText).toBe('Đang tải...');
  });

  it('should show loading with custom text', () => {
    const { result } = renderHook(() => useContentLoading());
    
    act(() => {
      result.current.showLoading('Đang xử lý...');
    });
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.loadingText).toBe('Đang xử lý...');
  });

  it('should hide loading after minimum duration', async () => {
    const { result } = renderHook(() => useContentLoading(200));
    
    act(() => {
      result.current.showLoading();
    });
    
    expect(result.current.isLoading).toBe(true);
    
    act(() => {
      result.current.hideLoading();
    });
    
    // Fast-forward time by 200ms
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    // Should be hidden now
    expect(result.current.isLoading).toBe(false);
  });

  it('should respect custom minimum duration', async () => {
    const { result } = renderHook(() => useContentLoading(500));
    
    act(() => {
      result.current.showLoading();
    });
    
    expect(result.current.isLoading).toBe(true);
    
    act(() => {
      result.current.hideLoading();
    });
    
    // Fast-forward time by 200ms (not enough)
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    // Still loading
    expect(result.current.isLoading).toBe(true);
    
    // Fast-forward time by 300ms more (total 500ms)
    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    // Should be hidden now
    expect(result.current.isLoading).toBe(false);
  });

  it('should update loading text using setText', () => {
    const { result } = renderHook(() => useContentLoading());
    
    act(() => {
      result.current.showLoading('Initial text');
    });
    
    expect(result.current.loadingText).toBe('Initial text');
    
    act(() => {
      result.current.setText('Updated text');
    });
    
    expect(result.current.loadingText).toBe('Updated text');
  });

  it('should handle multiple show/hide cycles', async () => {
    const { result } = renderHook(() => useContentLoading(100));
    
    // First cycle
    act(() => {
      result.current.showLoading('First');
    });
    expect(result.current.isLoading).toBe(true);
    
    act(() => {
      result.current.hideLoading();
    });
    
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    expect(result.current.isLoading).toBe(false);
    
    // Second cycle
    act(() => {
      result.current.showLoading('Second');
    });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.loadingText).toBe('Second');
    
    act(() => {
      result.current.hideLoading();
    });
    
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    expect(result.current.isLoading).toBe(false);
  });
});

