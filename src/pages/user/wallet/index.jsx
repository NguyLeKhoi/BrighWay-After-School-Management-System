import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Tabs from '@components/Common/Tabs';
import Card from '@components/Common/Card';
import Loading from '@components/Common/Loading';
import { useApp } from '../../../contexts/AppContext';
import { useLoading } from '../../../hooks/useLoading';
import depositService from '../../../services/deposit.service';
import walletService from '../../../services/wallet.service';
import studentService from '../../../services/student.service';
import styles from './Wallet.module.css';

const DEFAULT_ALLOWANCE_WALLET = {
  balance: 0,
  currency: 'VND',
  monthlyLimit: 0,
  restrictions: []
};

const DEFAULT_WALLET_DATA = {
  mainWallet: {
    balance: 0,
    currency: 'VND',
    type: 'Parent',
    walletId: '',
    createdTime: '',
    userEmail: ''
  },
  allowanceWallet: { ...DEFAULT_ALLOWANCE_WALLET },
  allowanceWallets: []
};

const MyWallet = () => {
  const location = useLocation();
  const isInitialMount = useRef(true);
  const [activeTab, setActiveTab] = useState('main');
  const [walletError, setWalletError] = useState(null);
  const [childWalletError, setChildWalletError] = useState(null);
  const [isWalletLoading, setIsWalletLoading] = useState(true);
  const [isChildWalletLoading, setIsChildWalletLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

  const checkoutMonitorRef = useRef(null);
  const shouldAutoSyncRef = useRef(false);
  const [walletData, setWalletData] = useState(DEFAULT_WALLET_DATA);
  const [childWallets, setChildWallets] = useState([]);
  const [transferForm, setTransferForm] = useState({
    toStudentId: '',
    amount: '',
    note: ''
  });

  const [transactions, setTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [transactionError, setTransactionError] = useState(null);
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 20,
    totalPages: 1,
    totalCount: 0
  });

  const { showGlobalError, addNotification } = useApp();
  const { showLoading, hideLoading } = useLoading();

  const loadWalletData = async ({ showSpinner = false } = {}) => {
    setWalletError(null);
    if (showSpinner) {
      setIsWalletLoading(true);
    }

    try {
      const walletResponse = await walletService.getCurrentWallet();

      setWalletData((prev) => ({
        ...prev,
        mainWallet: {
          ...prev.mainWallet,
          balance: walletResponse.balance ?? 0,
          currency: 'VND',
          type: walletResponse.type || prev.mainWallet.type,
          walletId: walletResponse.id || prev.mainWallet.walletId,
          createdTime: walletResponse.createdTime || prev.mainWallet.createdTime,
          userEmail: walletResponse.userEmail || prev.mainWallet.userEmail
        }
      }));

      return walletResponse;
    } catch (error) {
      const errorMessage = typeof error === 'string'
        ? error
        : error?.message || error?.error || 'Không thể tải thông tin ví';

      setWalletError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      if (showSpinner) {
        setIsWalletLoading(false);
      }
    }
  };

  const loadChildWallets = async () => {
    setChildWalletError(null);
    setIsChildWalletLoading(true);

    try {
      const response = await studentService.getMyChildren();

      // API mới trả về array trực tiếp, không phải object có items
      const students = Array.isArray(response) ? response : (Array.isArray(response?.items) ? response.items : []);

      const wallets = await Promise.all(
        students.map(async (student) => {
          try {
            const wallet = await walletService.getStudentWallet(student.id);
            return {
              studentId: student.id,
              studentName: student.name || student.userName || 'Học viên',
              balance: wallet?.balance ?? 0,
              currency: wallet?.currency || 'VND',
              walletId: wallet?.id || '',
              createdTime: wallet?.createdTime || '',
              branchName: student.branchName || student.branch?.branchName || '',
              schoolName: student.schoolName || student.school?.schoolName || '',
              levelName: student.studentLevelName || student.studentLevel?.levelName || ''
            };
          } catch (error) {
            console.error('Failed to load student wallet', student.id, error);
            return null;
          }
        })
      );

      setChildWallets(wallets.filter(Boolean));
    } catch (error) {
      const errorMessage = typeof error === 'string'
        ? error
        : error?.message || error?.error || 'Không thể tải ví tiêu vặt của con';
      setChildWalletError(errorMessage);
      console.error(errorMessage);
    } finally {
      setIsChildWalletLoading(false);
    }
  };

  useEffect(() => {
    loadWalletData({ showSpinner: true });
    loadChildWallets();
    loadTransactions(1); // Load first page of transactions
  }, []);

  // Reload data when navigate back to this page
  useEffect(() => {
    if (location.pathname === '/family/wallet') {
      // Skip first mount to avoid double loading
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }
      loadWalletData({ showSpinner: false });
      loadChildWallets();
      loadTransactions(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleTransfer = async (event) => {
    event.preventDefault();

    if (!transferForm.toStudentId) {
      addNotification({
        message: 'Vui lòng chọn con để chuyển tiền',
        severity: 'warning'
      });
      return;
    }

    const amount = Number(transferForm.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      addNotification({
        message: 'Số tiền chuyển phải lớn hơn 0',
        severity: 'warning'
      });
      return;
    }

    try {
      setIsTransferring(true);
      showLoading();

      await walletService.transferToStudent({
        toStudentId: transferForm.toStudentId,
        amount,
        note: transferForm.note
      });

      addNotification({
        message: 'Chuyển tiền thành công!',
        severity: 'success'
      });

      setTransferForm({
        toStudentId: '',
        amount: '',
        note: ''
      });

      await Promise.all([
        loadWalletData(),
        loadChildWallets()
      ]);
    } catch (error) {
      const errorMessage = typeof error === 'string'
        ? error
        : error?.message || error?.error || 'Không thể chuyển tiền';

      showGlobalError(errorMessage);
      addNotification({
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setIsTransferring(false);
      hideLoading();
    }
  };

  // Load transaction history (deposits)
  const loadTransactions = async (pageIndex = 1, pageSize = 20) => {
    setIsLoadingTransactions(true);
    setTransactionError(null);

    try {
      const response = await depositService.getMyDeposits({
        pageIndex,
        pageSize
      });

      // API response có structure: { items: [...], totalPages, totalCount, ... }
      const deposits = response.items || [];
      
      // Map deposits từ API sang format của component
      const mappedTransactions = deposits.map((deposit) => ({
        id: deposit.id,
        type: 'topup', // Tất cả deposits đều là topup
        amount: deposit.amount || 0,
        description: `Nạp tiền - Order #${deposit.payOSOrderCode || 'N/A'}`,
        date: deposit.timestamp || new Date().toISOString(),
        status: deposit.status?.toLowerCase() || 'pending',
        wallet: 'main',
        payOSOrderCode: deposit.payOSOrderCode,
        payOSTransactionId: deposit.payOSTransactionId
      }));

      setTransactions(mappedTransactions);
      
      // Update pagination info
      setPagination(prev => ({
        ...prev,
        pageIndex,
        pageSize,
        totalPages: response.totalPages || 1,
        totalCount: response.totalCount || 0
      }));
    } catch (err) {
      const errorMessage = typeof err === 'string'
        ? err
        : err?.message || err?.error || 'Không thể tải lịch sử giao dịch';
      
      setTransactionError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'topup':
      case 'refill':
        return '↗️';
      case 'payment':
        return '💳';
      case 'purchase':
        return '🛒';
      default:
        return '💰';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'topup':
      case 'refill':
        return '#28a745';
      case 'payment':
      return '#dc3545';
      case 'purchase':
        return '#ffc107';
      default:
        return '#6c757d';
    }
  };

  const handleTopUp = async () => {
    const inputValue = window.prompt('Nhập số tiền cần nạp (VND):');
    if (inputValue === null) {
      return;
    }

    const amount = Number(inputValue);

    if (Number.isNaN(amount) || amount <= 0) {
      addNotification({
        message: 'Vui lòng nhập số tiền hợp lệ lớn hơn 0',
        severity: 'warning'
      });
      return;
    }

    let checkoutWindow = null;

    try {
      checkoutWindow = window.open('about:blank', '_blank');
      showLoading();

      const depositResponse = await depositService.createDeposit(amount);
      const checkoutUrl = depositResponse?.checkoutUrl;

      if (checkoutUrl) {
        if (checkoutWindow) {
          checkoutWindow.location.href = checkoutUrl;
          checkoutWindow.focus();
        } else {
          window.location.href = checkoutUrl;
        }

        shouldAutoSyncRef.current = true;

        if (checkoutMonitorRef.current) {
          clearInterval(checkoutMonitorRef.current);
        }
        checkoutMonitorRef.current = setInterval(() => {
          if (!checkoutWindow || checkoutWindow.closed) {
            clearInterval(checkoutMonitorRef.current);
            checkoutMonitorRef.current = null;
            handleSyncWallet({ silent: true });
          }
        }, 2000);
      } else if (checkoutWindow) {
        checkoutWindow.close();
      }

      addNotification({
        message: 'Đang chuyển tới PayOS để hoàn tất nạp tiền.',
        severity: 'success'
      });
    } catch (error) {
      if (checkoutWindow) {
        checkoutWindow.close();
      }
      const errorMessage = typeof error === 'string'
        ? error
        : error?.message || error?.error || 'Có lỗi xảy ra khi nạp tiền';

      showGlobalError(errorMessage);
      addNotification({
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      hideLoading();
    }
  };

  const handleSyncWallet = async ({ silent = false } = {}) => {
    if (isSyncing || !shouldAutoSyncRef.current) return;

    try {
      setIsSyncing(true);
      if (!silent) {
        showLoading();
      }

      const previousBalance = walletData.mainWallet.balance;

      await depositService.triggerPayosWebhook();
      const latestWallet = await loadWalletData();
      await loadChildWallets();

      const newBalance = latestWallet?.balance ?? previousBalance;
      const hasBalanceChanged = newBalance !== previousBalance;

      if (hasBalanceChanged) {
        shouldAutoSyncRef.current = false;
        addNotification({
          message: 'Số dư ví đã được cập nhật từ PayOS',
          severity: 'success'
        });
      } else {
        shouldAutoSyncRef.current = silent;
        if (!silent) {
        addNotification({
          message: 'Chưa nhận được giao dịch mới từ PayOS. Vui lòng kiểm tra lại sau.',
          severity: 'info'
        });
        }
      }
    } catch (error) {
      shouldAutoSyncRef.current = true;

      const errorMessage = typeof error === 'string'
        ? error
        : error?.message || error?.error || 'Không thể đồng bộ ví từ PayOS';

      if (!silent) {
        showGlobalError(errorMessage);
        addNotification({
          message: errorMessage,
          severity: 'error'
        });
      } else {
        console.error(errorMessage);
      }
    } finally {
      setIsSyncing(false);
      if (!silent) {
        hideLoading();
      }
    }
  };

  useEffect(() => {
    const handleWindowFocus = () => {
      if (shouldAutoSyncRef.current) {
        handleSyncWallet({ silent: true });
      }
    };

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      if (checkoutMonitorRef.current) {
        clearInterval(checkoutMonitorRef.current);
      }
    };
  }, []);

  // Filter transactions based on active tab
  // For main wallet, show all deposits (topup)
  // For allowance wallet, show empty (no deposits for allowance wallet)
  const filteredTransactions = activeTab === 'main' 
    ? transactions.filter(tx => tx.wallet === 'main')
    : []; // Allowance wallet doesn't have deposits

  const handlePageChange = (newPageIndex) => {
    if (newPageIndex >= 1 && newPageIndex <= pagination.totalPages) {
      loadTransactions(newPageIndex);
    }
  };

  const tabs = [
    { id: 'main', label: 'Ví chính' },
    { id: 'allowance', label: 'Ví tiêu vặt' }
  ];

  const mainWalletInfo = [
    { label: 'Số dư', value: formatCurrency(walletData.mainWallet.balance) },
    { label: 'Loại ví', value: walletData.mainWallet.type === 'Parent' ? 'Ví phụ huynh' : walletData.mainWallet.type || '—' },
    { label: 'Email liên kết', value: walletData.mainWallet.userEmail || '—' },
    walletData.mainWallet.createdTime && {
      label: 'Ngày tạo',
      value: new Date(walletData.mainWallet.createdTime).toLocaleString('vi-VN')
    },
    { label: 'Mục đích', value: 'Thanh toán học phí, phí thành viên và các khoản phí chính' }
  ].filter(Boolean);

  if (isWalletLoading) {
    return <Loading />;
  }

  return (
    <div className={styles.walletPage}>
      <div className={styles.container}>
        <h1 className={styles.title}>Ví của tôi</h1>

        {walletError && (
          <div className={styles.errorState}>
            <p className={styles.errorMessage}>{walletError}</p>
            <button className={styles.retryButton} onClick={loadWalletData}>
              Thử lại
            </button>
          </div>
        )}
        
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Main Wallet */}
        {activeTab === 'main' && (
          <Card
            title="Ví chính"
            infoRows={mainWalletInfo}
            actions={[
              { text: 'Nạp tiền', primary: true, onClick: handleTopUp },
              { text: 'Lịch sử giao dịch', primary: false, onClick: () => {} }
            ]}
          />
        )}

        {/* Allowance Wallets */}
        {activeTab === 'allowance' && (
          <div className={styles.allowanceSection}>
            {isChildWalletLoading ? (
              <div className={styles.inlineLoading}>
                <Loading />
              </div>
            ) : childWalletError ? (
              <div className={styles.errorState}>
                <p className={styles.errorMessage}>{childWalletError}</p>
                <button className={styles.retryButton} onClick={loadChildWallets}>
                  Thử lại
                </button>
              </div>
            ) : childWallets.length > 0 ? (
              <>
                <div className={styles.transferCard}>
                  <form onSubmit={handleTransfer}>
                    <div className={styles.transferHeader}>
                      <div>
                        <h3 className={styles.transferTitle}>Chuyển tiền cho con</h3>
                        <p className={styles.transferDesc}>
                          Chuyển từ ví chính sang ví tiêu vặt của con để quản lý chi tiêu dễ dàng hơn.
                        </p>
                      </div>
                    </div>

                    <div className={styles.transferRow}>
                      <div className={styles.transferField}>
                        <label className={styles.transferLabel}>Chọn con</label>
                        <select
                          className={styles.transferSelect}
                          value={transferForm.toStudentId}
                          onChange={(e) => setTransferForm((prev) => ({
                            ...prev,
                            toStudentId: e.target.value
                          }))}
                          required
                        >
                          <option value="">-- Chọn con --</option>
                          {childWallets.map((child) => (
                            <option key={child.studentId} value={child.studentId}>
                              {child.studentName} ({formatCurrency(child.balance)})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className={styles.transferField}>
                        <label className={styles.transferLabel}>Số tiền (VND)</label>
                        <input
                          type="number"
                          min="1000"
                          step="1000"
                          className={styles.transferInput}
                          placeholder="Ví dụ: 500000"
                          value={transferForm.amount}
                          onChange={(e) => setTransferForm((prev) => ({
                            ...prev,
                            amount: e.target.value
                          }))}
                          required
                        />
                        <span className={styles.transferNote}>
                          Số tiền phải lớn hơn 0. Nên nhập bội số của 1.000 VND.
                        </span>
                      </div>
                    </div>

                    <div className={styles.transferField}>
                      <label className={styles.transferLabel}>Ghi chú (không bắt buộc)</label>
                      <textarea
                        className={styles.transferTextarea}
                        placeholder="Ví dụ: Tiền ăn vặt tuần này"
                        value={transferForm.note}
                        onChange={(e) => setTransferForm((prev) => ({
                          ...prev,
                          note: e.target.value
                        }))}
                      />
                    </div>

                    <div className={styles.transferActions}>
                      <button
                        type="submit"
                        className={styles.transferButton}
                        disabled={isTransferring || childWallets.length === 0}
                      >
                        {isTransferring ? 'Đang chuyển...' : 'Chuyển tiền'}
                      </button>
                    </div>
                  </form>
                </div>

                {childWallets.map((childWallet) => (
                  <Card
                    key={childWallet.walletId || childWallet.studentId}
                    title={`Ví tiêu vặt của ${childWallet.studentName}`}
                    infoRows={[
                      { label: 'Số dư', value: formatCurrency(childWallet.balance) },
                      childWallet.levelName ? { label: 'Cấp độ', value: childWallet.levelName } : null,
                      childWallet.schoolName ? { label: 'Trường', value: childWallet.schoolName } : null,
                      childWallet.branchName ? { label: 'Chi nhánh', value: childWallet.branchName } : null,
                      childWallet.createdTime
                        ? { label: 'Ngày khởi tạo', value: new Date(childWallet.createdTime).toLocaleDateString('vi-VN') }
                        : null,
                      { label: 'Mục đích', value: 'Mua đồ ăn vặt, chơi game tại trung tâm' }
                    ].filter(Boolean)}
                    actions={[
                      { text: 'Xem Profile', primary: false, onClick: () => window.location.href = `/parent/children/${childWallet.studentId}/profile` },
                      { text: 'Lịch học', primary: true, onClick: () => window.location.href = `/parent/children/${childWallet.studentId}/schedule` }
                    ]}
                  />
                ))}
              </>
            ) : (
              <div className={styles.noAllowanceWallets}>
                <p>Chưa có ví tiêu vặt nào. Thêm con và tạo ví để quản lý chi tiêu.</p>
              </div>
            )}
          </div>
        )}

        {/* Transaction History */}
        <div className={styles.transactionSection}>
          <h3>Lịch sử giao dịch</h3>
          {isLoadingTransactions ? (
            <div className={styles.transactionLoading}>
              <Loading />
            </div>
          ) : transactionError ? (
            <div className={styles.transactionError}>
              <p>{transactionError}</p>
              <button className={styles.retryButton} onClick={() => loadTransactions(pagination.pageIndex)}>
                Thử lại
              </button>
            </div>
          ) : (
            <>
              <div className={styles.transactionList}>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <div key={transaction.id} className={styles.transactionItem}>
                      <div className={styles.transactionIcon}>
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div className={styles.transactionDetails}>
                        <div className={styles.transactionDescription}>
                          {transaction.description}
                        </div>
                        <div className={styles.transactionDate}>
                          {new Date(transaction.date).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        {transaction.status && (
                          <div className={styles.transactionStatus}>
                            Trạng thái: <span className={styles[transaction.status]}>
                              {transaction.status === 'pending' ? 'Đang chờ' : 
                               transaction.status === 'completed' ? 'Hoàn thành' : 
                               transaction.status}
                            </span>
                          </div>
                        )}
                      </div>
                      <div 
                        className={styles.transactionAmount}
                        style={{ color: getTransactionColor(transaction.type) }}
                      >
                        {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.noTransactions}>
                    <p>Chưa có giao dịch nào</p>
                  </div>
                )}
              </div>
              
              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    className={styles.paginationButton}
                    onClick={() => handlePageChange(pagination.pageIndex - 1)}
                    disabled={pagination.pageIndex === 1 || isLoadingTransactions}
                  >
                    Trước
                  </button>
                  <span className={styles.paginationInfo}>
                    Trang {pagination.pageIndex} / {pagination.totalPages}
                    {pagination.totalCount > 0 && (
                      <span className={styles.paginationCount}>
                        ({pagination.totalCount} giao dịch)
                      </span>
                    )}
                  </span>
                  <button
                    className={styles.paginationButton}
                    onClick={() => handlePageChange(pagination.pageIndex + 1)}
                    disabled={pagination.pageIndex >= pagination.totalPages || isLoadingTransactions}
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyWallet;
