import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { routes } from './router/Router.jsx';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider, useApp } from './contexts/AppContext';
import ErrorBoundary from './core/error/ErrorBoundary';
import GlobalErrorHandler from './core/error/GlobalErrorHandler';
import SessionEndedDialog from './components/Common/SessionEndedDialog';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Inner component to access AppContext - must be used within AppProvider
const AppContent = () => {
  const { sessionEndedDialog, closeSessionEndedDialog } = useApp();
  
  return (
    <>
      <RouterProvider router={routes} />
      <GlobalErrorHandler />
      <SessionEndedDialog
        open={sessionEndedDialog.open}
        onClose={closeSessionEndedDialog}
        message={sessionEndedDialog.message}
      />
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
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
