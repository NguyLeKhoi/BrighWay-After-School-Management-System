import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  const getDashboardData = () => {
    switch (user?.role) {
      case 'admin':
        return {
          stats: [
            { title: 'Tổng học sinh', value: '245', icon: '👥', color: 'bg-blue-500' },
            { title: 'Giáo viên', value: '18', icon: '👨‍🏫', color: 'bg-purple-500' },
            { title: 'Doanh thu tháng', value: '₫45.2M', icon: '💰', color: 'bg-green-500' },
            { title: 'Lớp hôm nay', value: '32', icon: '📚', color: 'bg-orange-500' }
          ],
          recentActivities: [
            { text: 'Đăng ký học sinh mới: Nguyễn Minh An', time: '2 giờ trước' },
            { text: 'Nhận thanh toán: ₫2.5M từ Trần Văn B', time: '3 giờ trước' },
            { text: 'Cập nhật lịch học Toán lớp 5', time: '5 giờ trước' },
            { text: 'Đánh giá giáo viên từ cô Lan', time: '1 ngày trước' }
          ]
        };
      case 'teacher':
        return {
          stats: [
            { title: 'Lớp của tôi', value: '8', icon: '📚', color: 'bg-blue-500' },
            { title: 'Tổng học sinh', value: '156', icon: '👥', color: 'bg-purple-500' },
            { title: 'Lớp hôm nay', value: '3', icon: '⏰', color: 'bg-green-500' },
            { title: 'Đánh giá chờ', value: '12', icon: '📝', color: 'bg-orange-500' }
          ],
          recentActivities: [
            { text: 'Điểm danh lớp Toán 4A', time: '1 giờ trước' },
            { text: 'Nộp đánh giá cho Minh', time: '2 giờ trước' },
            { text: 'Giao bài tập mới cho lớp 5B', time: '4 giờ trước' },
            { text: 'Hẹn gặp phụ huynh ngày mai', time: '1 ngày trước' }
          ]
        };
      case 'parent':
        return {
          stats: [
            { title: 'Con của tôi', value: '2', icon: '👶', color: 'bg-blue-500' },
            { title: 'Lớp đang học', value: '6', icon: '📚', color: 'bg-purple-500' },
            { title: 'Số dư ví', value: '₫850K', icon: '💰', color: 'bg-green-500' },
            { title: 'Lớp tuần này', value: '12', icon: '📅', color: 'bg-orange-500' }
          ],
          recentActivities: [
            { text: 'Minh check-in lúc 8:30 sáng', time: '2 giờ trước' },
            { text: 'Thanh toán ₫1.2M thành công', time: '1 ngày trước' },
            { text: 'Báo cáo mới cho Lan', time: '2 ngày trước' },
            { text: 'Cập nhật lịch học tuần tới', time: '3 ngày trước' }
          ]
        };
      default:
        return { stats: [], recentActivities: [] };
    }
  };

  const { stats, recentActivities } = getDashboardData();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="hero-gradient rounded-3xl shadow-card-xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Xin chào, {user?.name}! 👋
              </h1>
              <p className="text-primary-100 text-lg">
                Chào mừng bạn đến với BASE - Hệ thống quản lý trung tâm đào tạo Brighway
              </p>
            </div>
            <button className="p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {stat.value}
                </p>
              </div>
              <div className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
            </div>
            <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full ${stat.color} rounded-full w-3/4 transition-all duration-1000`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <div className="card-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">📊 Hoạt động gần đây</h3>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all duration-200 group">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{activity.text}</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="card-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">⚡ Thao tác nhanh</h3>
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-4">
              {user?.role === 'admin' && (
                <>
                  <button className="w-full btn-primary text-left flex items-center space-x-3">
                    <span className="text-xl">👥</span>
                    <span>Thêm học sinh mới</span>
                  </button>
                  <button className="w-full btn-secondary text-left flex items-center space-x-3">
                    <span className="text-xl">📚</span>
                    <span>Tạo lịch lớp học</span>
                  </button>
                  <button className="w-full btn-secondary text-left flex items-center space-x-3">
                    <span className="text-xl">📊</span>
                    <span>Tạo báo cáo</span>
                  </button>
                </>
              )}
              {user?.role === 'teacher' && (
                <>
                  <button className="w-full btn-primary text-left flex items-center space-x-3">
                    <span className="text-xl">✅</span>
                    <span>Điểm danh</span>
                  </button>
                  <button className="w-full btn-secondary text-left flex items-center space-x-3">
                    <span className="text-xl">📝</span>
                    <span>Nộp đánh giá</span>
                  </button>
                  <button className="w-full btn-secondary text-left flex items-center space-x-3">
                    <span className="text-xl">📁</span>
                    <span>Tải tài liệu</span>
                  </button>
                </>
              )}
              {user?.role === 'parent' && (
                <>
                  <button className="w-full btn-primary text-left flex items-center space-x-3">
                    <span className="text-xl">📅</span>
                    <span>Xem lịch học</span>
                  </button>
                  <button className="w-full btn-secondary text-left flex items-center space-x-3">
                    <span className="text-xl">💰</span>
                    <span>Nạp tiền ví</span>
                  </button>
                  <button className="w-full btn-secondary text-left flex items-center space-x-3">
                    <span className="text-xl">💬</span>
                    <span>Liên hệ giáo viên</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Classes (for Parent role) */}
      {user?.role === 'parent' && (
        <div className="card-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">📚 Lớp học sắp tới</h3>
            <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-all duration-200 group">
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-lg group-hover:text-green-600 transition-colors">📐 Toán học - Lớp 5</h4>
                <p className="text-sm text-gray-600 mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  14:00 - 15:30 • Phòng A101
                </p>
              </div>
              <span className="status-badge status-success">Sắp bắt đầu</span>
            </div>
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-200 group">
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">🗣️ Tiếng Anh - Giao tiếp</h4>
                <p className="text-sm text-gray-600 mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  16:00 - 17:00 • Phòng B202
                </p>
              </div>
              <span className="status-badge status-info">Đã đăng ký</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
