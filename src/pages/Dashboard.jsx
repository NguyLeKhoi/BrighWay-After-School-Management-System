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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center shadow-sm`}>
                {stat.title === 'Tổng học sinh' && (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                )}
                {stat.title === 'Giáo viên' && (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                )}
                {stat.title === 'Doanh thu tháng' && (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                  </svg>
                )}
                {stat.title === 'Lớp hôm nay' && (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                )}
                {stat.title === 'Lớp của tôi' && (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                )}
                {stat.title === 'Đánh giá chờ' && (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2.5-9H19V1h-2v1H7V1H5v1H4.5C3.67 2 3 2.67 3 3.5v15c0 .83.67 1.5 1.5 1.5h15c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5zM19 18H5V8h14v10z"/>
                  </svg>
                )}
                {stat.title === 'Con của tôi' && (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                )}
                {stat.title === 'Lớp đang học' && (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                )}
                {stat.title === 'Số dư ví' && (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                  </svg>
                )}
                {stat.title === 'Lớp tuần này' && (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                  </svg>
                )}
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                </svg>
                <h3 className="text-xl font-semibold text-gray-900">Hoạt động gần đây</h3>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 group">
                  <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0 mt-1"></div>
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
                </svg>
                <h3 className="text-xl font-semibold text-gray-900">Thao tác nhanh</h3>
              </div>
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            </div>
            <div className="space-y-3">
              {user?.role === 'admin' && (
                <>
                  <button className="w-full flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all duration-200 group">
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Thêm học sinh mới</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all duration-200 group">
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Tạo lịch lớp học</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all duration-200 group">
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Tạo báo cáo</span>
                  </button>
                </>
              )}
              {user?.role === 'teacher' && (
                <>
                  <button className="w-full flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all duration-200 group">
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Điểm danh</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all duration-200 group">
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Nộp đánh giá</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all duration-200 group">
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Tải tài liệu</span>
                  </button>
                </>
              )}
              {user?.role === 'parent' && (
                <>
                  <button className="w-full flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all duration-200 group">
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Xem lịch học</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all duration-200 group">
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Nạp tiền ví</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all duration-200 group">
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Liên hệ giáo viên</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Classes (for Parent role) */}
      {user?.role === 'parent' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Lớp học sắp tới</h3>
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200 hover:bg-green-100 transition-all duration-200 group">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-base group-hover:text-green-600 transition-colors">Toán học - Lớp 5</h4>
                <p className="text-sm text-gray-600 mt-1">
                  14:00 - 15:30 • Phòng A101
                </p>
              </div>
              <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">Sắp bắt đầu</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200 hover:bg-blue-100 transition-all duration-200 group">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-base group-hover:text-blue-600 transition-colors">Tiếng Anh - Giao tiếp</h4>
                <p className="text-sm text-gray-600 mt-1">
                  16:00 - 17:00 • Phòng B202
                </p>
              </div>
              <span className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">Đã đăng ký</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
