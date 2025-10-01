import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setProfileMenuOpen(false);
  };

  const getMenuItems = () => {
    const HomeIcon = <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>;
    const UsersIcon = <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>;
    const GraduationCapIcon = <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>;
    const BookIcon = <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/></svg>;
    const WalletIcon = <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4V8h16v10zm-2-8h-2V7h-2v3h-2V7h-2v3H8V7H6v3H4V6h16v2z"/></svg>;
    const BarChartIcon = <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11V3H8v8H2v10h20V11h-6zm-6-6h4v6h-4V5zm-6 8h4v6H4v-6zm16 6h-4v-6h4v6z"/></svg>;
    const SettingsIcon = <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.09-.76-1.71-1.06L14 2.21c-.06-.2-.25-.33-.47-.33h-4c-.22 0-.41.13-.47.33L7.6 4.25c-.62.3-1.19.66-1.71 1.06l-2.49-1c-.22-.08-.49 0-.61.22l-2 3.46c-.12.22-.07.49.12.64l2.11 1.65c-.04.32-.07.64-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.09.76 1.71 1.06L9.53 21.79c.06.2.25.33.47.33h4c.22 0 .41-.13.47-.33l.94-2.03c.62-.3 1.19-.66 1.71-1.06l2.49 1c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>;
    const CheckmarkIcon = <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>;
    const CalendarIcon = <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>;
    const ChildIcon = <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0 2c2.67 0 8 1.34 8 4v2H4v-2c0-2.66 5.33-4 8-4z"/></svg>;
    const ProfileIcon = <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>;

    const baseItems = [
      { text: 'Trang chủ', path: '/dashboard', icon: HomeIcon }
    ];

    switch (user?.role) {
      case 'admin':
        return [
          ...baseItems,
          { text: 'Học sinh', path: '/admin/students', icon: UsersIcon },
          { text: 'Giáo viên', path: '/admin/teachers', icon: GraduationCapIcon },
          { text: 'Lớp học', path: '/admin/classes', icon: BookIcon },
          { text: 'Thanh toán', path: '/admin/payments', icon: WalletIcon },
          { text: 'Báo cáo', path: '/admin/reports', icon: BarChartIcon },
          { text: 'Cài đặt', path: '/admin/settings', icon: SettingsIcon }
        ];
      case 'teacher':
        return [
          ...baseItems,
          { text: 'Lớp của tôi', path: '/teacher/classes', icon: BookIcon },
          { text: 'Học sinh', path: '/teacher/students', icon: UsersIcon },
          { text: 'Điểm danh', path: '/teacher/attendance', icon: CheckmarkIcon },
          { text: 'Báo cáo', path: '/teacher/reports', icon: BarChartIcon }
        ];
      case 'parent':
        return [
          ...baseItems,
          { text: 'Con của tôi', path: '/parent/children', icon: ChildIcon },
          { text: 'Lịch học', path: '/parent/schedule', icon: CalendarIcon },
          { text: 'Thanh toán', path: '/parent/payments', icon: WalletIcon },
          { text: 'Ví tiền', path: '/parent/wallet', icon: WalletIcon },
          { text: 'Báo cáo', path: '/parent/reports', icon: BarChartIcon }
        ];
      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItems();
  const currentPage = menuItems.find(item => item.path === location.pathname)?.text || 'Trang chủ';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">BASE</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-all duration-200">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-xs">3</span>
            </button>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold shadow-sm hover:bg-green-600 transition-all duration-200"
            >
              {user?.name?.charAt(0)}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">BASE</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-gray-900 font-medium">{currentPage}</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-all duration-200">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-xs">3</span>
            </button>
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
              >
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0)}
                </div>
                <span className="font-medium text-gray-900">{user?.name}</span>
              </button>
              
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-200">
                  <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">Hồ sơ cá nhân</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-medium">Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}></div>
            <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              </div>
              <nav className="p-4">
                {menuItems.map((item) => (
                  <button
                    key={item.text}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left ${
                      location.pathname === item.path
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`${location.pathname === item.path ? 'text-primary-600' : 'text-gray-500'}`}>
                      {item.icon}
                    </div>
                    <span>{item.text}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 bg-white border-r border-gray-100 min-h-screen">
          <nav className="p-4">
            {menuItems.map((item) => (
              <button
                key={item.text}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left mb-2 transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className={`${location.pathname === item.path ? 'text-primary-600' : 'text-gray-500'}`}>
                  {item.icon}
                </div>
                <span className="font-medium text-sm">{item.text}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6">
          <Outlet />
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex items-center justify-around py-2">
          {menuItems.slice(0, 4).map((item) => (
            <button
              key={item.text}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                location.pathname === item.path
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-500 hover:text-primary-500'
              }`}
            >
              <div className={`${location.pathname === item.path ? 'text-primary-600' : 'text-gray-500'}`}>
                {item.icon}
              </div>
              <span className="text-xs font-medium">{item.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Content Padding */}
      <div className="lg:hidden pb-16"></div>
    </div>
  );
};

export default AppLayout;
