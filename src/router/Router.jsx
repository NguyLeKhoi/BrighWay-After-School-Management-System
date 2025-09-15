import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import AuthLayout from '../components/Layout/AuthLayout';

// Pages
import Homepage from '../pages/main/Homepage';
import CourseCatalog from '../pages/main/CourseCatalog';
import FacilitiesAbout from '../pages/main/FacilitiesAbout';
import Contact from '../pages/main/Contact';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import NotFound from '../pages/NotFound';

export const routes = createBrowserRouter([
  {
    path: '/',
    element: (
      <MainLayout>
        <Homepage />
      </MainLayout>
    ),
  },
  {
    path: '/courses',
    element: (
      <MainLayout>
        <CourseCatalog />
      </MainLayout>
    ),
  },
  {
    path: '/facilities',
    element: (
      <MainLayout>
        <FacilitiesAbout />
      </MainLayout>
    ),
  },
  {
    path: '/contact',
    element: (
      <MainLayout>
        <Contact />
      </MainLayout>
    ),
  },
  {
    path: '/login',
    element: (
      <AuthLayout>
        <Login />
      </AuthLayout>
    ),
  },
  {
    path: '/register',
    element: (
      <AuthLayout>
        <Register />
      </AuthLayout>
    ),
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
