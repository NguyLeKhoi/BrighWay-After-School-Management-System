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
    const baseItems = [
      { text: 'Trang chủ', icon: '🏠', path: '/dashboard' }
    ];

    switch (user?.role) {
      case 'admin':
        return [
          ...baseItems,
          { text: 'Học sinh', icon: '👥', path: '/admin/students' },
          { text: 'Giáo viên', icon: '👨‍🏫', path: '/admin/teachers' },
          { text: 'Lớp học', icon: '📚', path: '/admin/classes' },
          { text: 'Thanh toán', icon: '💰', path: '/admin/payments' },
          { text: 'Báo cáo', icon: '📊', path: '/admin/reports' },
          { text: 'Cài đặt', icon: '⚙️', path: '/admin/settings' }
        ];
      case 'teacher':
        return [
          ...baseItems,
          { text: 'Lớp của tôi', icon: '📚', path: '/teacher/classes' },
          { text: 'Học sinh', icon: '👥', path: '/teacher/students' },
          { text: 'Điểm danh', icon: '✅', path: '/teacher/attendance' },
          { text: 'Báo cáo', icon: '📊', path: '/teacher/reports' }
        ];
      case 'parent':
        return [
          ...baseItems,
          { text: 'Con của tôi', icon: '👶', path: '/parent/children' },
          { text: 'Lịch học', icon: '📅', path: '/parent/schedule' },
          { text: 'Thanh toán', icon: '💰', path: '/parent/payments' },
          { text: 'Ví tiền', icon: '💳', path: '/parent/wallet' },
          { text: 'Báo cáo', icon: '📊', path: '/parent/reports' }
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
      <div className="lg:hidden hero-gradient text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-3 rounded-xl hover:bg-white/10 transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-lg">🎓</span>
              </div>
              <h1 className="text-xl font-bold">BASE</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="relative p-3 rounded-xl hover:bg-white/10 transition-all duration-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">3</span>
            </button>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold shadow-lg hover:bg-white/30 transition-all duration-200"
            >
              {user?.name?.charAt(0)}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block hero-gradient text-white shadow-xl">
        <div className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-xl">🎓</span>
              </div>
              <h1 className="text-2xl font-bold">BASE</h1>
            </div>
            <h2 className="text-lg font-medium opacity-90">{currentPage}</h2>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-3 rounded-xl hover:bg-white/10 transition-all duration-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">3</span>
            </button>
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/10 transition-all duration-200"
              >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                  {user?.name?.charAt(0)}
                </div>
                <span className="hidden xl:block font-medium">{user?.name}</span>
              </button>
              
              {profileMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-card-xl py-3 z-50 border border-gray-100">
                  <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">Hồ sơ cá nhân</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.text}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-72 bg-white shadow-card min-h-screen">
          <nav className="p-6">
            {menuItems.map((item) => (
              <button
                key={item.text}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-4 p-4 rounded-xl text-left mb-3 transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 shadow-md'
                    : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="font-medium">{item.text}</span>
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-around py-3">
          {menuItems.slice(0, 4).map((item) => (
            <button
              key={item.text}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 ${
                location.pathname === item.path
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-500 hover:text-primary-500 hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl mb-1">{item.icon}</span>
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
