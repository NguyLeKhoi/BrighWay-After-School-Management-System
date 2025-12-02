import React from 'react';
import { render } from '@testing-library/react';
import { AppProvider } from '../contexts/AppContext';

/**
 * Wrapper component for testing hooks/components that need AppContext
 */
export const TestWrapper = ({ children }) => {
  return <AppProvider>{children}</AppProvider>;
};

/**
 * Render hook with AppProvider wrapper
 */
export const renderWithAppProvider = (ui, options) => {
  return render(ui, {
    wrapper: TestWrapper,
    ...options
  });
};

