import { useAuth } from '../contexts/AuthContext';

const Wallet = () => {
  const { user } = useAuth();

  // Demo data for wallet
  const walletData = {
    totalBalance: '300,000',
    mainWallet: {
      balance: '250,000',
      description: 'Thanh toán học phí và phí thành viên'
    },
    allowanceWallet: {
      balance: '50,000',
      description: 'Chi tiêu hàng ngày cho trẻ',
      autoTopUp: '100,000',
      nextTopUp: '1/10/2024'
    }
  };

  const transactions = [
    { id: 1, type: 'topup', amount: '100,000', description: 'Nạp tiền vào ví chính', time: '2 ngày trước', status: 'success' },
    { id: 2, type: 'payment', amount: '-50,000', description: 'Thanh toán học phí tháng 9', time: '5 ngày trước', status: 'success' },
    { id: 3, type: 'allowance', amount: '100,000', description: 'Nạp tự động ví tiêu vặt', time: '1 tuần trước', status: 'success' },
    { id: 4, type: 'spending', amount: '-15,000', description: 'Mua đồ ăn nhẹ', time: '1 tuần trước', status: 'success' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-primary-600 text-white p-6 rounded-xl">
        <h1 className="text-2xl font-bold mb-2">Ví tiền</h1>
        <p className="text-primary-100">Quản lý tài chính của bạn</p>
      </div>

      {/* Total Balance */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tổng quan ví tiền</h2>
        <div className="bg-primary-600 text-white p-6 rounded-xl">
          <p className="text-primary-200 text-sm mb-2">Tổng số dư</p>
          <p className="text-3xl font-bold">{walletData.totalBalance} VNĐ</p>
        </div>
      </div>

      {/* Wallet Cards */}
      <div className="space-y-4">
        {/* Main Wallet */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">💰</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Ví chính</h3>
                <p className="text-sm text-gray-600">{walletData.mainWallet.description}</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Số dư hiện tại</p>
            <p className="text-2xl font-bold text-gray-900">{walletData.mainWallet.balance} VNĐ</p>
          </div>
          
          <button className="w-full btn-primary flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Nạp tiền</span>
          </button>
        </div>

        {/* Allowance Wallet */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">😊</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Ví tiêu vặt</h3>
                <p className="text-sm text-gray-600">{walletData.allowanceWallet.description}</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Số dư hiện tại</p>
            <p className="text-2xl font-bold text-gray-900">{walletData.allowanceWallet.balance} VNĐ</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-900 mb-1">
              Tự động nạp {walletData.allowanceWallet.autoTopUp} VNĐ vào đầu mỗi tháng
            </p>
            <p className="text-sm text-blue-600">
              Lần nạp tiếp theo: {walletData.allowanceWallet.nextTopUp}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
        <div className="grid grid-cols-2 gap-4">
          <button className="btn-secondary flex items-center justify-center space-x-2 py-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Nạp tiền</span>
          </button>
          <button className="btn-secondary flex items-center justify-center space-x-2 py-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Lịch sử</span>
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử giao dịch</h3>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.type === 'topup' || transaction.type === 'allowance' 
                    ? 'bg-green-100' 
                    : 'bg-red-100'
                }`}>
                  {transaction.type === 'topup' || transaction.type === 'allowance' ? (
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-xs text-gray-500">{transaction.time}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${
                  transaction.type === 'topup' || transaction.type === 'allowance' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {transaction.amount} VNĐ
                </p>
                <span className="status-badge status-success">Thành công</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
