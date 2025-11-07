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

// useruser Pages
import FamilyProfile from '../pages/user/profile';
import ChildrenList from '../pages/user/children/AllChildren';
import ChildProfile from '../pages/user/children/ChildProfile';
import ChildSchedule from '../pages/user/children/ChildSchedule';
import MyWallet from '../pages/user/wallet';
import MyPackages from '../pages/user/packages';
import Notifications from '../pages/user/notifications';

// Admin Pages
import AdminDashboard from '../pages/admin/dashboard';
import BranchManagement from '../pages/admin/branchManagement';
import FacilityManagement from '../pages/admin/facilityManagement';
import RoomManagement from '../pages/admin/roomManagement';
import ManagerManagement from '../pages/admin/managerManagement';
import BenefitManagement from '../pages/admin/benefitManagement';
import StudentLevelManagement from '../pages/admin/studentLevelManagement';
import PackageManagement from '../pages/admin/packageManagement';
import SchoolManagement from '../pages/admin/schoolManagement';

// Manager Pages
import ManagerDashboard from '../pages/manager/dashboard';
import ManagerRoomManagement from '../pages/manager/roomManagement';
import StaffAndParentManagement from '../pages/manager/staffAndParentManagement';

// Teacher Pages
import TeacherDashboard from '../pages/teacher/dashboard';
import ClassManagement from '../pages/teacher/classes';
import AttendanceManagement from '../pages/teacher/attendance';
import PerformanceReviews from '../pages/teacher/performance';
import TeacherSchedule from '../pages/teacher/schedule';
import StudentRoster from '../pages/teacher/students';
import TeacherMaterials from '../pages/teacher/materials';

// Staff Pages
import StaffDashboard from '../pages/staff/dashboard';
import StaffStudentLevels from '../pages/staff/studentLevels';
import StaffActivityTypes from '../pages/staff/activityTypes';
import StaffActivities from '../pages/staff/activities';

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
        path: 'packages',
        element: <MyPackages />,
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
        element: <ManagerManagement />,
      },
      {
        path: 'benefits',
        element: <BenefitManagement />,
      },
      {
        path: 'student-levels',
        element: <StudentLevelManagement />,
      },
      {
        path: 'packages',
        element: <PackageManagement />,
      },
      {
        path: 'schools',
        element: <SchoolManagement />,
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
        path: 'staffAndParent',
        element: <StaffAndParentManagement />,
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
        element: <StaffStudentLevels />,
      },
      {
        path: 'dashboard',
        element: <StaffDashboard />,
      },
      {
        path: 'student-levels',
        element: <StaffStudentLevels />,
      },
      {
        path: 'activity-types',
        element: <StaffActivityTypes />,
      },
      {
        path: 'activities',
        element: <StaffActivities />,
      },
    ],
  },
  
  // 404 Page
  {
    path: '*',
    element: <NotFound />,
  },
]);
