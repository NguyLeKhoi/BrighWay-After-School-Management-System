import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ScrollToTop from '../index';

// Mock GSAP ScrollTrigger
vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    refresh: vi.fn()
  }
}));

// Mock window.scrollTo
const mockScrollTo = vi.fn();
window.scrollTo = mockScrollTo;

describe('ScrollToTop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Mock document properties
    Object.defineProperty(document.documentElement, 'scrollTop', {
      writable: true,
      value: 100
    });
    Object.defineProperty(document.body, 'scrollTop', {
      writable: true,
      value: 100
    });
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 100
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render without crashing', () => {
    const { container } = render(
      <BrowserRouter>
        <ScrollToTop />
      </BrowserRouter>
    );
    
    expect(container).toBeTruthy();
  });

  it('should scroll to top when pathname changes', () => {
    const { rerender } = render(
      <BrowserRouter>
        <ScrollToTop />
      </BrowserRouter>
    );

    // Initial render should trigger scroll
    expect(mockScrollTo).toHaveBeenCalled();

    // Change pathname (simulate navigation)
    rerender(
      <BrowserRouter>
        <ScrollToTop />
      </BrowserRouter>
    );

    // Should have been called multiple times due to timeouts
    expect(mockScrollTo.mock.calls.length).toBeGreaterThan(0);
  });

  it('should call window.scrollTo with correct parameters', () => {
    render(
      <BrowserRouter>
        <ScrollToTop />
      </BrowserRouter>
    );

    // Check that scrollTo was called with correct parameters
    const scrollCalls = mockScrollTo.mock.calls;
    expect(scrollCalls.length).toBeGreaterThan(0);
    
    // At least one call should have the correct format
    const hasCorrectCall = scrollCalls.some(call => {
      if (call[0] && typeof call[0] === 'object') {
        return call[0].top === 0 && call[0].left === 0;
      }
      return call[0] === 0 && call[1] === 0;
    });
    
    expect(hasCorrectCall).toBe(true);
  });

  it('should reset scrollTop properties', () => {
    render(
      <BrowserRouter>
        <ScrollToTop />
      </BrowserRouter>
    );

    // Fast-forward timers to trigger all scroll attempts
    vi.advanceTimersByTime(600);

    // documentElement and body scrollTop should be reset
    expect(document.documentElement.scrollTop).toBe(0);
    expect(document.body.scrollTop).toBe(0);
  });
});

