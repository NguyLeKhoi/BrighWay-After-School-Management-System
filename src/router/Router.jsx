import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import AuthLayout from '../components/Layout/AuthLayout';
import ParentLayout from '../components/Layout/ParentLayout';

// Main Pages
import Homepage from '../pages/main/Homepage';
import CourseCatalog from '../pages/main/CourseCatalog';
import FacilitiesAbout from '../pages/main/FacilitiesAbout';
import Contact from '../pages/main/Contact';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Parent Pages
import ParentProfile from '../pages/parent/profile';
import ChildrenList from '../pages/parent/children';
import ChildProfile from '../pages/parent/children/ChildProfile';
import MyWallet from '../pages/parent/wallet';
import MyCourses from '../pages/parent/courses';
import Notifications from '../pages/parent/notifications';

// Other Pages
import NotFound from '../pages/NotFound';

export const routes = createBrowserRouter([
  // Main Layout Routes (Landing Pages)
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Homepage />,
      },
      {
        path: 'courses',
        element: <CourseCatalog />,
      },
      {
        path: 'facilities',
        element: <FacilitiesAbout />,
      },
      {
        path: 'contact',
        element: <Contact />,
      },
    ],
  },
  
  // Auth Layout Routes (Authentication Pages)
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
    ],
  },
  
  // Legacy auth routes for backward compatibility
  {
    path: '/login',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <Login />,
      },
    ],
  },
  {
    path: '/register',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <Register />,
      },
    ],
  },
  
  // Parent Layout Routes (Parent Portal)
  {
    path: '/parent',
    element: <ParentLayout />,
    children: [
      {
        path: 'profile',
        element: <ParentProfile />,
      },
      {
        path: 'children',
        element: <ChildrenList />,
      },
      {
        path: 'children/:childId/profile',
        element: <ChildProfile />,
      },
      {
        path: 'wallet',
        element: <MyWallet />,
      },
      {
        path: 'courses',
        element: <MyCourses />,
      },
      {
        path: 'notifications',
        element: <Notifications />,
      },
    ],
  },
  
  // 404 Page
  {
    path: '*',
    element: <NotFound />,
  },
]);
