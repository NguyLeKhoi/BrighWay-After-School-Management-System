import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import AuthLayout from '../components/Layout/AuthLayout';
import FamilyLayout from '../components/Layout/FamilyLayout';
import AdminLayout from '../components/Layout/AdminLayout';
import ManagerLayout from '../components/Layout/ManagerLayout';
import TeacherLayout from '../components/Layout/TeacherLayout';
import StaffLayout from '../components/Layout/StaffLayout';

// Main Pages
import Homepage from '../pages/main/Homepage';
import CourseCatalog from '../pages/main/CourseCatalog';
import FacilitiesAbout from '../pages/main/FacilitiesAbout';
import Contact from '../pages/main/Contact';

// Auth Pages
import Login from '../pages/auth/Login';

// family Pages
import FamilyProfile from '../pages/family/profile';
import ChildrenList from '../pages/family/children/AllChildren';
import ChildProfile from '../pages/family/children/ChildProfile';
import ChildSchedule from '../pages/family/children/ChildSchedule';
import MyWallet from '../pages/family/wallet';
import MyCourses from '../pages/family/courses';
import Notifications from '../pages/family/notifications';

// Admin Pages
import AdminDashboard from '../pages/admin/dashboard';
import BranchManagement from '../pages/admin/branchManagement';
import FacilityManagement from '../pages/admin/facilityManagement';
import RoomManagement from '../pages/admin/roomManagement';
import StaffAndManagerManagement from '../pages/admin/staffAndManagerManagement';
import CourseManagement from '../pages/admin/coursesManagement';
import Reports from '../pages/admin/reports';
import Settings from '../pages/admin/settings';

// Manager Pages
import ManagerDashboard from '../pages/manager/dashboard';
import ManagerRoomManagement from '../pages/manager/roomManagement';
import StaffAndTeacherManagement from '../pages/manager/staffAndTeacherManagement';

// Teacher Pages
import TeacherDashboard from '../pages/teacher/dashboard';
import ClassManagement from '../pages/teacher/classes';
import AttendanceManagement from '../pages/teacher/attendance';
import PerformanceReviews from '../pages/teacher/performance';
import TeacherSchedule from '../pages/teacher/schedule';
import StudentRoster from '../pages/teacher/students';
import TeacherMaterials from '../pages/teacher/materials';

// Staff Pages
import UserManagement from '../pages/staff/userManagement';

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
    path: '/family',
    element: <FamilyLayout />,
    children: [
      {
        path: 'profile',
        element: <FamilyProfile />,
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
        path: 'branches',
        element: <BranchManagement />,
      },
      {
        path: 'facilities',
        element: <FacilityManagement />,
      },
      {
        path: 'rooms',
        element: <RoomManagement />,
      },
      {
        path: 'staffAndManager',
        element: <StaffAndManagerManagement />,
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
  
  // Manager Layout Routes (Manager Portal)
  {
    path: '/manager',
    element: <ManagerLayout />,
    children: [
      {
        index: true,
        element: <ManagerDashboard />,
      },
      {
        path: 'dashboard',
        element: <ManagerDashboard />,
      },
      {
        path: 'staffAndTeacher',
        element: <StaffAndTeacherManagement />,
      },
      {
        path: 'rooms',
        element: <ManagerRoomManagement />,
      },
    ],
  },
  
  // Teacher Layout Routes (Teacher Portal)
  {
    path: '/teacher',
    element: <TeacherLayout />,
    children: [
      {
        index: true,
        element: <TeacherDashboard />,
      },
      {
        path: 'dashboard',
        element: <TeacherDashboard />,
      },
      {
        path: 'schedule',
        element: <TeacherSchedule />,
      },
      {
        path: 'classes',
        element: <ClassManagement />,
      },
      {
        path: 'students',
        element: <StudentRoster />,
      },
      {
        path: 'attendance',
        element: <AttendanceManagement />,
      },
      {
        path: 'performance',
        element: <PerformanceReviews />,
      },
      {
        path: 'materials',
        element: <TeacherMaterials />,
      },
    ],
  },
  
  // Staff Layout Routes (Staff Portal)
  {
    path: '/staff',
    element: <StaffLayout />,
    children: [
      {
        index: true,
        element: <UserManagement />,
      },
      {
        path: 'users',
        element: <UserManagement />,
      },
    ],
  },
  
  // 404 Page
  {
    path: '*',
    element: <NotFound />,
  },
]);
