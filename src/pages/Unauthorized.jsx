import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">403</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Truy cập bị từ chối
          </h2>
          <p className="text-gray-600 mb-8">
            Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary px-8 py-3 text-lg"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
