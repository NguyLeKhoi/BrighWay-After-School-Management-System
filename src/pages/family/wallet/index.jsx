import React, { useState } from 'react';
import Tabs from '@components/Common/Tabs';
import Card from '@components/Common/Card';
import InfoGrid from '@components/Common/InfoGrid';
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

  const tabs = [
    { id: 'main', label: 'Ví chính' },
    { id: 'allowance', label: 'Ví tiêu vặt' }
  ];

  const mainWalletInfo = [
    { label: 'Số dư', value: formatCurrency(walletData.mainWallet.balance) },
    { label: 'Mục đích', value: 'Thanh toán học phí, phí thành viên và các khoản phí chính' }
  ];

  const allowanceWalletInfo = [
    { label: 'Số dư', value: formatCurrency(walletData.allowanceWallet.balance) },
    { label: 'Hạn mức tháng', value: formatCurrency(walletData.allowanceWallet.monthlyLimit) },
    { label: 'Còn lại tháng này', value: formatCurrency(walletData.allowanceWallet.monthlyLimit - walletData.allowanceWallet.balance) },
    { label: 'Mục đích', value: 'Mua đồ ăn vặt, chơi game tại trung tâm' }
  ];

  return (
    <div className={styles.walletPage}>
      <div className={styles.container}>
        <h1 className={styles.title}>Ví của tôi</h1>
        
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
              { text: 'Nạp tiền', primary: true, onClick: () => console.log('Top up main wallet') },
              { text: 'Lịch sử giao dịch', primary: false, onClick: () => console.log('View history') }
            ]}
          />
        )}

        {/* Allowance Wallet */}
        {activeTab === 'allowance' && (
          <Card
            title="Ví tiêu vặt"
            infoRows={allowanceWalletInfo}
            actions={[
              { text: 'Nạp tiền', primary: true, onClick: () => console.log('Top up allowance wallet') },
              { text: 'Cài đặt hạn chế', primary: false, onClick: () => console.log('Settings') }
            ]}
          >
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
          </Card>
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
