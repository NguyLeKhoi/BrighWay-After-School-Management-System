import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import AuthLayout from '../components/Layout/AuthLayout';
import FamilyLayout from '../components/Layout/FamilyLayout';
import AdminLayout from '../components/Layout/AdminLayout';
import ManagerLayout from '../components/Layout/ManagerLayout';
import StaffLayout from '../components/Layout/StaffLayout';
import ProtectedRoute from './ProtectedRoute';

// Main Pages
import Homepage from '../pages/main/Homepage';
import PackageCatalog from '../pages/main/PackageCatalog';
import FacilitiesAbout from '../pages/main/FacilitiesAbout';
import Contact from '../pages/main/Contact';

// Auth Pages
import Login from '../pages/auth/Login';

// useruser Pages
import FamilyProfile from '../pages/user/profile';
import FamilyServices from '../pages/user/services';
import MySchedule from '../pages/user/schedule';
import ChildrenList from '../pages/user/children/AllChildren';
import CreateChild from '../pages/user/children/CreateChild';
import ChildProfile from '../pages/user/children/ChildProfile';
import ChildSchedule from '../pages/user/children/ChildSchedule';
import MyWallet from '../pages/user/wallet';
import MyPackages from '../pages/user/packages';
import Notifications from '../pages/user/notifications';

// Admin Pages
import AdminDashboard from '../pages/admin/dashboard';
import BranchManagement from '../pages/admin/branchManagement';
import CreateBranch from '../pages/admin/branchManagement/CreateBranch';
import UpdateBranch from '../pages/admin/branchManagement/UpdateBranch';
import FacilityManagement from '../pages/admin/facilityManagement';
import RoomManagement from '../pages/admin/roomManagement';
import ManagerManagement from '../pages/admin/managerManagement';
import BenefitManagement from '../pages/admin/benefitManagement';
import StudentLevelManagement from '../pages/admin/studentLevelManagement';
import PackageManagement from '../pages/admin/packageManagement';
import AdminCreateTemplate from '../pages/admin/packageManagement/CreateTemplate';
import AdminUpdateTemplate from '../pages/admin/packageManagement/UpdateTemplate';
import AdminCreatePackage from '../pages/admin/packageManagement/CreatePackage';
import AdminUpdatePackage from '../pages/admin/packageManagement/UpdatePackage';
import SchoolManagement from '../pages/admin/schoolManagement';

// Manager Pages
import ManagerDashboard from '../pages/manager/dashboard';
import ManagerRoomManagement from '../pages/manager/roomManagement';
import StaffAndParentManagement from '../pages/manager/staffAndParentManagement';
import ParentManagement from '../pages/manager/parentManagement';
import CreateParent from '../pages/manager/staffAndParentManagement/CreateParent';
import ManagerPackageManagement from '../pages/manager/packageManagement';
import CreatePackage from '../pages/manager/packageManagement/CreatePackage';
import UpdatePackage from '../pages/manager/packageManagement/UpdatePackage';
import ManagerStudentManagement from '../pages/manager/studentManagement';
import ManagerBranchSlotManagement from '../pages/manager/branchSlotManagement';
import CreateBranchSlot from '../pages/manager/branchSlotManagement/CreateBranchSlot';
import UpdateBranchSlot from '../pages/manager/branchSlotManagement/UpdateBranchSlot';
import CreateStudent from '../pages/manager/studentManagement/CreateStudent';
import UpdateStudent from '../pages/manager/studentManagement/UpdateStudent';


// Staff Pages
import StaffDashboard from '../pages/staff/dashboard';
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
        path: 'packages',
        element: <PackageCatalog />,
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
    element: (
      <ProtectedRoute allowedRoles={['User']}>
        <FamilyLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <FamilyServices />,
      },
      {
        path: 'services',
        element: <FamilyServices />,
      },
      {
        path: 'profile',
        element: <FamilyProfile />,
      },
      {
        path: 'children',
        element: <ChildrenList />,
      },
      {
        path: 'children/create',
        element: <CreateChild />,
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
        path: 'children/:childId/schedule/register',
        element: <MySchedule />,
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
    element: (
      <ProtectedRoute allowedRoles={['Admin']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
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
        path: 'branches/create',
        element: <CreateBranch />,
      },
      {
        path: 'branches/update/:id',
        element: <UpdateBranch />,
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
      { path: 'packages/templates/create', element: <AdminCreateTemplate /> },
      { path: 'packages/templates/update/:id', element: <AdminUpdateTemplate /> },
      { path: 'packages/create', element: <AdminCreatePackage /> },
      { path: 'packages/update/:id', element: <AdminUpdatePackage /> },
      {
        path: 'schools',
        element: <SchoolManagement />,
      },
    ],
  },
  
  // Manager Layout Routes (Manager Portal)
  {
    path: '/manager',
    element: (
      <ProtectedRoute allowedRoles={['Manager']}>
        <ManagerLayout />
      </ProtectedRoute>
    ),
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
        path: 'staff',
        element: <StaffAndParentManagement />,
      },
      {
        path: 'parents',
        element: <ParentManagement />,
      },
      {
        path: 'parents/create',
        element: <CreateParent />,
      },
      {
        path: 'rooms',
        element: <ManagerRoomManagement />,
      },
      {
        path: 'packages',
        element: <ManagerPackageManagement />,
      },
      {
        path: 'packages/create',
        element: <CreatePackage />,
      },
      {
        path: 'packages/update/:id',
        element: <UpdatePackage />,
      },
      {
        path: 'students',
        element: <ManagerStudentManagement />,
      },
      {
        path: 'students/create',
        element: <CreateStudent />,
      },
      {
        path: 'students/update/:id',
        element: <UpdateStudent />,
      },
      {
        path: 'branch-slots',
        element: <ManagerBranchSlotManagement />,
      },
      {
        path: 'branch-slots/create',
        element: <CreateBranchSlot />,
      },
      {
        path: 'branch-slots/update/:id',
        element: <UpdateBranchSlot />,
      },
    ],
  },
  
  
  // Staff Layout Routes (Staff Portal)
  {
    path: '/staff',
    element: (
      <ProtectedRoute allowedRoles={['Staff']}>
        <StaffLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <StaffDashboard />,
      },
      {
        path: 'dashboard',
        element: <StaffDashboard />,
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

