import React, { useState } from 'react';
import styles from './Wallet.module.css';

const MyWallet = () => {
  const [activeTab, setActiveTab] = useState('main');
  
  const [walletData] = useState({
    mainWallet: {
      balance: 2500000,
      currency: 'VND'
    },
    allowanceWallet: {
      balance: 150000,
      currency: 'VND',
      monthlyLimit: 200000,
      restrictions: ['games', 'canteen']
    }
  });

  const [transactions] = useState([
    {
      id: 1,
      type: 'topup',
      amount: 500000,
      description: 'Nạp tiền ví chính',
      date: '2024-01-15',
      status: 'completed',
      wallet: 'main'
    },
    {
      id: 2,
      type: 'payment',
      amount: -300000,
      description: 'Thanh toán học phí tháng 1',
      date: '2024-01-10',
      status: 'completed',
      wallet: 'main'
    },
    {
      id: 3,
      type: 'purchase',
      amount: -25000,
      description: 'Mua đồ ăn vặt',
      date: '2024-01-14',
      status: 'completed',
      wallet: 'allowance'
    },
    {
      id: 4,
      type: 'refill',
      amount: 200000,
      description: 'Nạp tiền tiêu vặt tháng 1',
      date: '2024-01-01',
      status: 'completed',
      wallet: 'allowance'
    }
  ]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
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

  const filteredTransactions = transactions.filter(tx => 
    activeTab === 'main' ? tx.wallet === 'main' : tx.wallet === 'allowance'
  );

  return (
    <div className={styles.walletPage}>
      <div className={styles.container}>
        <h1 className={styles.title}>Ví của tôi</h1>
        
        {/* Wallet Tabs */}
        <div className={styles.tabContainer}>
          <button 
            className={`${styles.tab} ${activeTab === 'main' ? styles.active : ''}`}
            onClick={() => setActiveTab('main')}
          >
            Ví chính
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'allowance' ? styles.active : ''}`}
            onClick={() => setActiveTab('allowance')}
          >
            Ví tiêu vặt
          </button>
        </div>

        {/* Main Wallet */}
        {activeTab === 'main' && (
          <div className={styles.walletCard}>
            <div className={styles.walletHeader}>
              <h2>Ví chính</h2>
              <span className={styles.balance}>
                {formatCurrency(walletData.mainWallet.balance)}
              </span>
            </div>
            <p className={styles.walletDescription}>
              Dùng để thanh toán học phí, phí thành viên và các khoản phí chính
            </p>
            <div className={styles.walletActions}>
              <button className={styles.topUpButton}>
                Nạp tiền
              </button>
              <button className={styles.historyButton}>
                Lịch sử giao dịch
              </button>
            </div>
          </div>
        )}

        {/* Allowance Wallet */}
        {activeTab === 'allowance' && (
          <div className={styles.walletCard}>
            <div className={styles.walletHeader}>
              <h2>Ví tiêu vặt</h2>
              <span className={styles.balance}>
                {formatCurrency(walletData.allowanceWallet.balance)}
              </span>
            </div>
            <p className={styles.walletDescription}>
              Dành cho con bạn mua đồ ăn vặt, chơi game tại trung tâm
            </p>
            
            <div className={styles.allowanceInfo}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Hạn mức tháng:</span>
                <span className={styles.infoValue}>
                  {formatCurrency(walletData.allowanceWallet.monthlyLimit)}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Còn lại tháng này:</span>
                <span className={styles.infoValue}>
                  {formatCurrency(walletData.allowanceWallet.monthlyLimit - walletData.allowanceWallet.balance)}
                </span>
              </div>
            </div>

            <div className={styles.restrictions}>
              <h4>Hạn chế chi tiêu:</h4>
              <div className={styles.restrictionTags}>
                {walletData.allowanceWallet.restrictions.map((restriction, index) => (
                  <span key={index} className={styles.restrictionTag}>
                    {restriction === 'games' ? 'Chỉ chơi game' : 
                     restriction === 'canteen' ? 'Chỉ căng tin' : restriction}
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.walletActions}>
              <button className={styles.topUpButton}>
                Nạp tiền
              </button>
              <button className={styles.settingsButton}>
                Cài đặt hạn chế
              </button>
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div className={styles.transactionSection}>
          <h3>Lịch sử giao dịch</h3>
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
                      {new Date(transaction.date).toLocaleDateString('vi-VN')}
                    </div>
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
        </div>
      </div>
    </div>
  );
};

export default MyWallet;
