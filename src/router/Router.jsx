import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import AuthLayout from '../components/Layout/AuthLayout';
import ParentLayout from '../components/Layout/ParentLayout';
import AdminLayout from '../components/Layout/AdminLayout';

// Main Pages
import Homepage from '../pages/main/Homepage';
import CourseCatalog from '../pages/main/CourseCatalog';
import FacilitiesAbout from '../pages/main/FacilitiesAbout';
import Contact from '../pages/main/Contact';

// Auth Pages
import Login from '../pages/auth/Login';

// Parent Pages
import ParentProfile from '../pages/parent/profile';
import ChildrenList from '../pages/parent/children/AllChildren';
import ChildProfile from '../pages/parent/children/ChildProfile';
import ChildSchedule from '../pages/parent/children/ChildSchedule';
import MyWallet from '../pages/parent/wallet';
import MyCourses from '../pages/parent/courses';
import Notifications from '../pages/parent/notifications';

// Admin Pages
import AdminDashboard from '../pages/admin/dashboard';
import RoleManagement from '../pages/admin/roleManagement';
import BranchManagement from '../pages/admin/branchManagement';
import FacilityManagement from '../pages/admin/facilityManagement';
import CourseManagement from '../pages/admin/coursesManagement';
import Reports from '../pages/admin/reports';
import Settings from '../pages/admin/settings';

// Other Pages
import NotFound from '../components/Common/NotFound';

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
  
  // Auth Routes (Authentication Pages)
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
        path: 'children/:childId/schedule',
        element: <ChildSchedule />,
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
  
  // Admin Layout Routes (Admin Portal)
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: 'dashboard',
        element: <AdminDashboard />,
      },
      {
        path: 'roles',
        element: <RoleManagement />,
      },
      {
        path: 'branches',
        element: <BranchManagement />,
      },
      {
        path: 'facilities',
        element: <FacilityManagement />,
      },
      {
        path: 'courses',
        element: <CourseManagement />,
      },
      {
        path: 'reports',
        element: <Reports />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
  
  // 404 Page
  {
    path: '*',
    element: <NotFound />,
  },
]);
