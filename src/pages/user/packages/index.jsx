import React, { useState } from 'react';
import Tabs from '@components/Common/Tabs';
import styles from './Packages.module.css';

const MyPackages = () => {
  const [activeTab, setActiveTab] = useState('available');

  // Mock data - các gói có sẵn
  const [availablePackages] = useState([
    {
      id: 1,
      name: 'Gói Full-Week',
      desc: 'Gói học cả tuần với đầy đủ các hoạt động và chăm sóc',
      price: 5000000,
      durationInMonths: 1,
      totalSlots: 20,
      branch: { branchName: 'Chi nhánh Quận 1' },
      studentLevel: { levelName: 'Mầm non' },
      benefits: [
        { name: 'Học phí ưu đãi' },
        { name: 'Tặng đồ dùng học tập' },
        { name: 'Miễn phí bữa trưa' }
      ],
      status: true
    },
    {
      id: 2,
      name: 'Gói Even-Day',
      desc: 'Gói học các ngày chẵn trong tuần',
      price: 3000000,
      durationInMonths: 1,
      totalSlots: 15,
      branch: { branchName: 'Chi nhánh Quận 2' },
      studentLevel: { levelName: 'Tiểu học' },
      benefits: [
        { name: 'Học phí ưu đãi' },
        { name: 'Tặng sách giáo khoa' }
      ],
      status: true
    },
    {
      id: 3,
      name: 'Gói Weekend',
      desc: 'Gói học cuối tuần dành cho trẻ em bận rộn',
      price: 2000000,
      durationInMonths: 1,
      totalSlots: 10,
      branch: { branchName: 'Chi nhánh Quận 3' },
      studentLevel: { levelName: 'Trung học' },
      benefits: [
        { name: 'Học phí ưu đãi' },
        { name: 'Tặng đồng phục' }
      ],
      status: true
    },
    {
      id: 4,
      name: 'Gói Premium',
      desc: 'Gói cao cấp với nhiều ưu đãi và dịch vụ đặc biệt',
      price: 8000000,
      durationInMonths: 3,
      totalSlots: 5,
      branch: { branchName: 'Chi nhánh Quận 1' },
      studentLevel: { levelName: 'Mầm non' },
      benefits: [
        { name: 'Học phí ưu đãi' },
        { name: 'Tặng đồ dùng học tập' },
        { name: 'Miễn phí bữa trưa' },
        { name: 'Tặng đồng phục' },
        { name: 'Chăm sóc đặc biệt' }
      ],
      status: true
    }
  ]);

  // Mock data - các gói đã mua
  const [purchasedPackages] = useState([
    {
      id: 5,
      name: 'Gói Full-Week',
      desc: 'Gói học cả tuần với đầy đủ các hoạt động và chăm sóc',
      price: 5000000,
      durationInMonths: 1,
      purchasedDate: '2024-01-10',
      expiryDate: '2024-02-10',
      childName: 'Nguyễn Văn B',
      branch: { branchName: 'Chi nhánh Quận 1' },
      studentLevel: { levelName: 'Mầm non' },
      status: 'active',
      benefits: [
        { name: 'Học phí ưu đãi' },
        { name: 'Tặng đồ dùng học tập' },
        { name: 'Miễn phí bữa trưa' }
      ]
    },
    {
      id: 6,
      name: 'Gói Even-Day',
      desc: 'Gói học các ngày chẵn trong tuần',
      price: 3000000,
      durationInMonths: 1,
      purchasedDate: '2024-01-05',
      expiryDate: '2024-02-05',
      childName: 'Nguyễn Thị C',
      branch: { branchName: 'Chi nhánh Quận 2' },
      studentLevel: { levelName: 'Tiểu học' },
      status: 'active',
      benefits: [
        { name: 'Học phí ưu đãi' },
        { name: 'Tặng sách giáo khoa' }
      ]
    }
  ]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const tabs = [
    { id: 'available', label: `Các gói (${availablePackages.length})` },
    { id: 'purchased', label: `Gói đã mua (${purchasedPackages.length})` }
  ];

  const renderPackageCard = (pkg, isPurchased = false) => (
    <div key={pkg.id} className={styles.packageCard}>
      <div className={styles.packageHeader}>
        <h3 className={styles.packageName}>{pkg.name}</h3>
        {isPurchased ? (
          <span className={`${styles.statusBadge} ${styles[pkg.status]}`}>
            {pkg.status === 'active' ? 'Đang sử dụng' : 'Đã hết hạn'}
          </span>
        ) : (
          pkg.status && (
            <span className={styles.statusBadge}>Hoạt động</span>
          )
        )}
      </div>

      {pkg.desc && (
        <p className={styles.packageDescription}>{pkg.desc}</p>
      )}

      <div className={styles.packagePrice}>
        <span className={styles.priceLabel}>Giá:</span>
        <span className={styles.priceValue}>{formatCurrency(pkg.price)}</span>
      </div>

      <div className={styles.packageInfo}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Thời hạn:</span>
          <span className={styles.infoValue}>{pkg.durationInMonths} tháng</span>
        </div>
        {isPurchased && (
          <>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Ngày mua:</span>
              <span className={styles.infoValue}>{formatDate(pkg.purchasedDate)}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Hết hạn:</span>
              <span className={styles.infoValue}>{formatDate(pkg.expiryDate)}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Con:</span>
              <span className={styles.infoValue}>{pkg.childName}</span>
            </div>
          </>
        )}
        {!isPurchased && (
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Số slot:</span>
            <span className={styles.infoValue}>{pkg.totalSlots}</span>
          </div>
        )}
        {pkg.branch && (
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Chi nhánh:</span>
            <span className={styles.infoValue}>{pkg.branch.branchName}</span>
          </div>
        )}
        {pkg.studentLevel && (
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Cấp độ:</span>
            <span className={styles.infoValue}>{pkg.studentLevel.levelName}</span>
          </div>
        )}
      </div>

      {pkg.benefits && pkg.benefits.length > 0 && (
        <div className={styles.benefitsSection}>
          <h4 className={styles.benefitsTitle}>Lợi ích:</h4>
          <ul className={styles.benefitsList}>
            {pkg.benefits.map((benefit, index) => (
              <li key={index} className={styles.benefitItem}>
                <span className={styles.benefitIcon}>✓</span>
                {benefit.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.packageActions}>
        {isPurchased ? (
          <>
            <button className={styles.viewButton}>
              Xem chi tiết
            </button>
            {pkg.status === 'active' && (
              <button className={styles.extendButton}>
                Gia hạn
              </button>
            )}
          </>
        ) : (
          <>
            <button className={styles.viewButton}>
              Xem chi tiết
            </button>
            <button className={styles.registerButton}>
              Đăng ký ngay
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.packagesPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Các gói dịch vụ</h1>
          <p className={styles.subtitle}>Xem và quản lý các gói dịch vụ của bạn</p>
        </div>

        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Available Packages */}
        {activeTab === 'available' && (
          <div className={styles.packagesSection}>
            {availablePackages.length > 0 ? (
              <div className={styles.packagesGrid}>
                {availablePackages.map((pkg) => renderPackageCard(pkg, false))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📦</div>
                <h3>Không có gói nào</h3>
                <p>Hiện tại không có gói dịch vụ nào có sẵn</p>
              </div>
            )}
          </div>
        )}

        {/* Purchased Packages */}
        {activeTab === 'purchased' && (
          <div className={styles.packagesSection}>
            {purchasedPackages.length > 0 ? (
              <div className={styles.packagesGrid}>
                {purchasedPackages.map((pkg) => renderPackageCard(pkg, true))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📦</div>
                <h3>Chưa mua gói nào</h3>
                <p>Bạn chưa mua gói dịch vụ nào. Hãy xem các gói có sẵn và đăng ký ngay!</p>
                <button 
                  className={styles.browseButton}
                  onClick={() => setActiveTab('available')}
                >
                  Xem các gói
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPackages;
