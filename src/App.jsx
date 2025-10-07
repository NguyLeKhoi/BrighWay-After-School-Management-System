import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { routes } from './router/Router.jsx';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import ErrorBoundary from './core/error/ErrorBoundary';
import GlobalErrorHandler from './core/error/GlobalErrorHandler';

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AuthProvider>
          <RouterProvider router={routes} />
          <GlobalErrorHandler />
        </AuthProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
