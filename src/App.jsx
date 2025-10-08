import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { routes } from './router/Router.jsx';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import ErrorBoundary from './core/error/ErrorBoundary';
import GlobalErrorHandler from './core/error/GlobalErrorHandler';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AuthProvider>
          <RouterProvider router={routes} />
          <GlobalErrorHandler />
          <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </AuthProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
