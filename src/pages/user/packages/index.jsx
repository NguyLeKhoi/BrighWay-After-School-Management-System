import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ChildCare as ChildIcon,
  Inventory as PackageIcon,
  Receipt as ServiceIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { Box, Typography, Chip } from '@mui/material';
import ContentLoading from '@components/Common/ContentLoading';
import Tabs from '@components/Common/Tabs';
import Card from '@components/Common/Card';
import ManagementFormDialog from '@components/Management/FormDialog';
import Form from '@components/Common/Form';
import { useApp } from '../../../contexts/AppContext';
import useContentLoading from '../../../hooks/useContentLoading';
import packageService from '../../../services/package.service';
import studentService from '../../../services/student.service';
import serviceService from '../../../services/service.service';
import * as yup from 'yup';
import styles from './Packages.module.css';

const buyPackageSchema = yup.object().shape({
  studentId: yup.string().required('Vui lòng chọn con')
});

const getFieldWithFallback = (source, candidates, defaultValue = 0) => {
  if (!source) return defaultValue;
  
  for (const key of candidates) {
    if (key in source && source[key] !== null && source[key] !== undefined) {
      return source[key];
    }
  }
  
  return defaultValue;
};

const MyPackages = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isInitialMount = useRef(true);
  const [activeTab, setActiveTab] = useState('available');
  const [availablePackages, setAvailablePackages] = useState([]);
  const [purchasedPackages, setPurchasedPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
  const [isLoadingPurchased, setIsLoadingPurchased] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [error, setError] = useState(null);
  const [availableError, setAvailableError] = useState(null);
  const [servicesError, setServicesError] = useState(null);
  
  // Buy package dialog state
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [children, setChildren] = useState([]);
  const [hasChildren, setHasChildren] = useState(false);
  const [buyForm, setBuyForm] = useState({
    studentId: ''
  });
  const [isBuying, setIsBuying] = useState(false);

  const { showGlobalError, addNotification } = useApp();
  const { isLoading: isPageLoading, loadingText, showLoading, hideLoading } = useContentLoading();

  // Load available packages (suitable packages) from API
  const loadAvailablePackages = useCallback(async () => {
    setIsLoadingAvailable(true);
    setAvailableError(null);

    try {
      // Fetch all children of current user
      const children = await studentService.getMyChildren();
      
      if (!Array.isArray(children) || children.length === 0) {
        setAvailablePackages([]);
        setHasChildren(false);
        return;
      }
      
      setHasChildren(true);

      // Fetch suitable packages for each child
      const packagesPromises = children.map(child => 
        packageService.getSuitablePackages(child.id)
      );

      const packagesArrays = await Promise.all(packagesPromises);
      
      // Flatten and remove duplicates by package ID
      const allPackages = [];
      const seenPackageIds = new Set();
      
      packagesArrays.forEach((packages) => {
        if (Array.isArray(packages)) {
          packages.forEach(pkg => {
            // Only add if we haven't seen this package ID before
            if (!seenPackageIds.has(pkg.id)) {
              seenPackageIds.add(pkg.id);
              
              // Map API response to component format
              const totalSlots = getFieldWithFallback(pkg, [
                'totalSlots',
                'totalslots',
                'totalSlot',
                'totalslot',
                'slotTotal',
                'slotsTotal',
                'slots',
                'slotCount'
              ], 0);
              
              const durationInMonths = getFieldWithFallback(pkg, [
                'durationInMonths',
                'durationmonths',
                'durationMonth',
                'durationMonths',
                'duration',
                'monthsDuration'
              ], 0);

              allPackages.push({
                id: pkg.id,
                name: pkg.name || 'Gói không tên',
                desc: pkg.desc || '',
                price: pkg.price || 0,
                durationInMonths,
                totalSlots,
                branch: pkg.branch 
                  ? { branchName: pkg.branch.branchName || pkg.branchName || '' }
                  : { branchName: pkg.branchName || '' },
                studentLevel: pkg.studentLevel 
                  ? { levelName: pkg.studentLevel.name || pkg.studentLevel.levelName || '' } 
                  : { levelName: pkg.studentLevelName || '' },
                benefits: Array.isArray(pkg.benefits) 
                  ? pkg.benefits.map(b => ({ name: b.name || '' }))
                  : [],
                status: pkg.isActive !== false // Default to true if not specified
              });
            }
          });
        }
      });

      setAvailablePackages(allPackages);
    } catch (err) {
      const errorMessage = typeof err === 'string'
        ? err
        : err?.message || err?.error || 'Không thể tải danh sách gói dịch vụ';
      
      setAvailableError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      setIsLoadingAvailable(false);
    }
  }, [showGlobalError]);

  // Load purchased packages (subscriptions) from API
  const loadPurchasedPackages = useCallback(async () => {
    setIsLoadingPurchased(true);
    setError(null);

    try {
      // Fetch all children of current user
      const children = await studentService.getMyChildren();
      
      if (!Array.isArray(children) || children.length === 0) {
        setPurchasedPackages([]);
        setHasChildren(false);
        return;
      }
      
      setHasChildren(true);

      // Create a map of studentId to student info (including branch)
      const childrenMap = new Map();
      children.forEach(child => {
        childrenMap.set(child.id, {
          id: child.id,
          name: child.name || child.userName || 'Không tên',
          branchName: child.branchName || child.branch?.branchName || '',
          levelName: child.studentLevelName || child.studentLevel?.levelName || ''
        });
      });

      // Fetch subscriptions for each child
      const subscriptionPromises = children.map(async (child) => {
        try {
          const subscriptionResponse = await packageService.getSubscriptionsByStudent(child.id);
          return { childId: child.id, subscriptionResponse };
        } catch {
          return { childId: child.id, subscriptionResponse: null };
        }
      });

      const subscriptionResults = await Promise.all(subscriptionPromises);
      
      // Flatten and map subscriptions to component format
      const mappedPackages = [];
      
      // Dùng for...of thay vì forEach để có thể dùng await
      for (const { childId, subscriptionResponse } of subscriptionResults) {
        if (!subscriptionResponse) continue;
        
        const childInfo = childrenMap.get(childId);
        if (!childInfo) continue;
        
        // API có thể trả về object hoặc array
        let subscriptions = [];
        if (Array.isArray(subscriptionResponse)) {
          subscriptions = subscriptionResponse;
        } else if (subscriptionResponse && typeof subscriptionResponse === 'object') {
          // Nếu là object, có thể là single subscription hoặc có items property
          if (subscriptionResponse.items && Array.isArray(subscriptionResponse.items)) {
            subscriptions = subscriptionResponse.items;
          } else {
            // Single subscription object - kiểm tra xem có phải là subscription object không
            if (subscriptionResponse.id || subscriptionResponse.packageName) {
              subscriptions = [subscriptionResponse];
            }
          }
        }
        
        // Fetch package details for subscriptions that need it
        // Thay vì dùng getPackageById (bị 403), dùng getSuitablePackages cho studentId
        // Tối ưu: chỉ fetch một lần cho mỗi child, không fetch nhiều lần cho mỗi subscription
        let suitablePackagesForChild = null;
        const needsPackageDetails = subscriptions.some(sub => {
          const needsTotalSlots = sub.totalslotsSnapshot === null || sub.totalslotsSnapshot === undefined;
          const needsDuration = sub.durationMonthsSnapshot === null || sub.durationMonthsSnapshot === undefined;
          return (needsTotalSlots || needsDuration) && sub.packageId;
        });
        
        if (needsPackageDetails && childId) {
          try {
            // Fetch suitable packages một lần cho child
            suitablePackagesForChild = await packageService.getSuitablePackages(childId);
          } catch {
            // Silently fail - package details will be null
          }
        }
        
        // Map subscriptions với package details
        const subscriptionsWithPackageDetails = subscriptions.map((sub) => {
          let packageDetails = null;
          
          // Tìm package có id trùng với packageId trong subscription
          if (suitablePackagesForChild) {
            if (Array.isArray(suitablePackagesForChild)) {
              packageDetails = suitablePackagesForChild.find(pkg => pkg.id === sub.packageId);
            } else if (suitablePackagesForChild.id === sub.packageId) {
              packageDetails = suitablePackagesForChild;
            }
          }
          
          return { sub, packageDetails };
        });
        
        subscriptionsWithPackageDetails.forEach(({ sub, packageDetails }) => {
          // Ưu tiên dùng snapshot, nếu null/undefined thì dùng từ package details
          // Xử lý cả camelCase và lowercase, và cả các biến thể khác
          // Lấy totalSlots từ package - ưu tiên totalslots (lowercase) như trong available packages
          const totalSlotsFromPackage = packageDetails?.totalslots 
            ?? packageDetails?.totalSlots 
            ?? packageDetails?.totalSlotsSnapshot
            ?? 0;
          
          // Kiểm tra snapshot trước, nếu null/undefined thì dùng từ package
          // Không check !== 0 vì 0 có thể là giá trị hợp lệ
          const totalSlots = (sub.totalslotsSnapshot !== null && sub.totalslotsSnapshot !== undefined) 
            ? sub.totalslotsSnapshot 
            : totalSlotsFromPackage;
          
          // Lấy durationInMonths từ package - ưu tiên durationInMonths (camelCase)
          const durationInMonthsFromPackage = packageDetails?.durationInMonths 
            ?? packageDetails?.durationmonths 
            ?? packageDetails?.durationMonthsSnapshot
            ?? 0;
          
          // Kiểm tra snapshot trước, nếu null/undefined thì dùng từ package
          // Không check !== 0 vì 0 có thể là giá trị hợp lệ
          const durationInMonths = (sub.durationMonthsSnapshot !== null && sub.durationMonthsSnapshot !== undefined)
            ? sub.durationMonthsSnapshot
            : durationInMonthsFromPackage;
          
          // Xử lý cả camelCase và lowercase cho usedSlot
          const usedSlots = sub.usedSlot ?? sub.usedslot ?? 0;
          const remainingSlots = Math.max(0, totalSlots - usedSlots);
          
          // Lấy branch và level từ package nếu chưa có từ student
          const branchName = childInfo.branchName || packageDetails?.branch?.branchName || '';
          const levelName = childInfo.levelName || packageDetails?.studentLevel?.name || '';
          
          mappedPackages.push({
            id: sub.id,
            name: sub.packageName || packageDetails?.name || 'Gói không tên',
            desc: packageDetails?.desc || '', // Lấy desc từ package nếu có
            price: sub.priceFinal ?? packageDetails?.price ?? 0,
            durationInMonths: durationInMonths,
            totalSlots: totalSlots,
            usedSlots: usedSlots,
            remainingSlots: remainingSlots,
            purchasedDate: sub.startDate,
            expiryDate: sub.endDate,
            childName: sub.studentName || childInfo.name,
            studentId: sub.studentId || childId,
            branch: { 
              branchName: branchName
            },
            studentLevel: { 
              levelName: levelName
            },
            status: sub.status?.toLowerCase() === 'active' ? 'active' : 'expired',
            benefits: packageDetails?.benefits || [] // Lấy benefits từ package nếu có
          });
        });
      }

      setPurchasedPackages(mappedPackages);
    } catch (err) {
      const errorMessage = typeof err === 'string'
        ? err
        : err?.message || err?.error || 'Không thể tải danh sách gói đã mua';
      
      setError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      setIsLoadingPurchased(false);
    }
  }, [showGlobalError]);

  const loadServices = useCallback(async () => {
    setIsLoadingServices(true);
    setServicesError(null);

    try {
      const response = await serviceService.getMyAddOns();
      const items = Array.isArray(response) ? response : [];

      const mappedServices = items.map((service) => ({
        id: service.serviceId || service.id,
        name: service.name || 'Dịch vụ không tên',
        type: service.serviceType || 'Add-on',
        isActive: service.isActive !== false,
        description: service.description || service.desc || '',
        price: service.priceOverride ?? service.price ?? service.effectivePrice ?? 0,
        effectivePrice: service.effectivePrice ?? service.priceOverride ?? service.price ?? 0,
        priceOverride: service.priceOverride,
        benefits: service.benefits || [],
        note: service.note || ''
      }));

      setServices(mappedServices);
    } catch (err) {
      const errorMessage = typeof err === 'string'
        ? err
        : err?.message || err?.error || 'Không thể tải danh sách dịch vụ';

      setServicesError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      setIsLoadingServices(false);
    }
  }, [showGlobalError]);

  // Load children list
  const loadChildren = async () => {
    try {
      const childrenList = await studentService.getMyChildren();
      const childrenArray = Array.isArray(childrenList) ? childrenList : [];
      setChildren(childrenArray);
      setHasChildren(childrenArray.length > 0);
    } catch {
      // Silently fail
      setHasChildren(false);
    }
  };

  useEffect(() => {
    loadAvailablePackages();
    loadPurchasedPackages();
    loadServices();
    loadChildren();
  }, []);

  // Reload data when navigate back to this page
  useEffect(() => {
    if (location.pathname === '/family/packages') {
      // Skip first mount to avoid double loading
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }
      loadAvailablePackages();
      loadPurchasedPackages();
      loadServices();
      loadChildren();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Handle buy package
  const handleBuyClick = (pkg) => {
    setSelectedPackage(pkg);
    setBuyForm({
      studentId: ''
    });
    setShowBuyDialog(true);
  };

  const handleBuyPackage = async (data) => {
    if (!selectedPackage) return;

    setIsBuying(true);
    showLoading();

    try {
      // Always use current date as start date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDateISO = today.toISOString();
      
      await packageService.buyPackageForChild({
        packageId: selectedPackage.id,
        studentId: data.studentId,
        startDate: startDateISO
      });

      addNotification({
        message: 'Mua gói thành công!',
        severity: 'success'
      });

      setShowBuyDialog(false);
      setSelectedPackage(null);
      setBuyForm({
        studentId: ''
      });
      
      // Always refresh purchased packages list after successful purchase
        await loadPurchasedPackages();
      
      // Also refresh available packages to update counts
      await loadAvailablePackages();
      
      // Switch to purchased tab to show the newly purchased package
      setActiveTab('purchased');
    } catch (err) {
      const errorMessage = typeof err === 'string'
        ? err
        : err?.message || err?.error || 'Không thể mua gói';
      
      showGlobalError(errorMessage);
      addNotification({
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setIsBuying(false);
      hideLoading();
    }
  };

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
    { id: 'purchased', label: `Gói đã mua (${purchasedPackages.length})` },
    { id: 'services', label: `Dịch vụ (${services.length})` }
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
            {pkg.usedSlots !== undefined && pkg.totalSlots !== undefined && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Đã dùng:</span>
                <span className={styles.infoValue}>
                  {pkg.usedSlots}/{pkg.totalSlots} slot
                  {pkg.remainingSlots !== undefined && (
                    <span className={styles.remainingSlots}>
                      {' '}(Còn lại: {pkg.remainingSlots} slot)
                    </span>
                  )}
                </span>
              </div>
            )}
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
            {pkg.status === 'active' && (
              <button className={styles.extendButton}>
                Gia hạn
              </button>
            )}
          </>
        ) : (
          <>
            <button 
              className={styles.registerButton}
              onClick={() => handleBuyClick(pkg)}
            >
              Đăng ký ngay
            </button>
          </>
        )}
      </div>
    </div>
  );

  const renderServiceCard = (service) => (
    <div key={service.id || service.name} className={styles.packageCard}>
      <div className={styles.packageHeader}>
        <h3 className={styles.packageName}>{service.name}</h3>
        <span className={`${styles.statusBadge} ${service.isActive ? styles.active : styles.expired}`}>
          {service.isActive ? 'Hoạt động' : 'Tạm dừng'}
        </span>
      </div>

      <div className={styles.packageInfo}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Loại dịch vụ:</span>
          <span className={styles.infoValue}>{service.type || 'Add-on'}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Giá:</span>
          <span className={styles.infoValue}>{formatCurrency(service.effectivePrice)}</span>
        </div>
        {service.priceOverride !== null && service.priceOverride !== undefined && (
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Giá gốc:</span>
            <span className={styles.infoValue}>{formatCurrency(service.priceOverride)}</span>
          </div>
        )}
      </div>

      {service.description && (
        <p className={styles.packageDescription}>{service.description}</p>
      )}

      {service.benefits && service.benefits.length > 0 && (
        <div className={styles.benefitsSection}>
          <h4 className={styles.benefitsTitle}>Lợi ích:</h4>
          <ul className={styles.benefitsList}>
            {service.benefits.map((benefit, index) => (
              <li key={index} className={styles.benefitItem}>
                <span className={styles.benefitIcon}>✓</span>
                {benefit.name || benefit}
              </li>
            ))}
          </ul>
        </div>
      )}

      {service.note && (
        <div className={styles.packageNote}>
          <strong>Lưu ý:</strong> {service.note}
        </div>
      )}
    </div>
  );

  return (
    <motion.div 
      className={styles.packagesPage}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {isPageLoading && <ContentLoading isLoading={isPageLoading} text={loadingText} />}
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
            {isLoadingAvailable ? (
              <div className={styles.inlineLoading}>
                <ContentLoading isLoading={true} text="Đang tải gói dịch vụ..." />
              </div>
            ) : availableError ? (
              <div className={styles.errorState}>
                <p className={styles.errorMessage}>{availableError}</p>
                <button className={styles.retryButton} onClick={loadAvailablePackages}>
                  Thử lại
                </button>
              </div>
            ) : availablePackages.length > 0 ? (
              <div className={styles.packagesGrid}>
                {availablePackages.map((pkg) => renderPackageCard(pkg, false))}
              </div>
            ) : !hasChildren ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <ChildIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
                </div>
                <h3>Chưa có trẻ em</h3>
                <p>Bạn cần thêm thông tin trẻ em trước khi xem các gói dịch vụ. Các gói sẽ được hiển thị dựa trên thông tin trẻ em của bạn.</p>
                <button 
                  className={styles.browseButton}
                  onClick={() => navigate('/family/children/create')}
                >
                  Thêm trẻ em ngay
                </button>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <PackageIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
                </div>
                <h3>Không có gói nào</h3>
                <p>Hiện tại không có gói dịch vụ nào phù hợp với con của bạn</p>
              </div>
            )}
          </div>
        )}

        {/* Purchased Packages */}
        {activeTab === 'purchased' && (
          <div className={styles.packagesSection}>
            {isLoadingPurchased ? (
              <div className={styles.inlineLoading}>
                <ContentLoading isLoading={true} text="Đang tải gói đã mua..." />
              </div>
            ) : error ? (
              <div className={styles.errorState}>
                <p className={styles.errorMessage}>{error}</p>
                <button className={styles.retryButton} onClick={loadPurchasedPackages}>
                  Thử lại
                </button>
              </div>
            ) : purchasedPackages.length > 0 ? (
              <div className={styles.packagesGrid}>
                {purchasedPackages.map((pkg) => {
                  const infoRows = [
                    { label: 'Giá', value: formatCurrency(pkg.price) },
                    { label: 'Thời hạn', value: `${pkg.durationInMonths} tháng` },
                    { label: 'Ngày mua', value: formatDate(pkg.purchasedDate) },
                    { label: 'Hết hạn', value: formatDate(pkg.expiryDate) },
                    { label: 'Con', value: pkg.childName || '—' }
                  ];

                  if (pkg.usedSlots !== undefined && pkg.totalSlots !== undefined) {
                    infoRows.push({
                      label: 'Đã dùng',
                      value: `${pkg.usedSlots}/${pkg.totalSlots} slot${pkg.remainingSlots !== undefined ? ` (Còn lại: ${pkg.remainingSlots} slot)` : ''}`
                    });
                  }

                  if (pkg.branch?.branchName) {
                    infoRows.push({ label: 'Chi nhánh', value: pkg.branch.branchName });
                  }

                  if (pkg.studentLevel?.levelName) {
                    infoRows.push({ label: 'Cấp độ', value: pkg.studentLevel.levelName });
                  }

                  const badges = pkg.benefits && pkg.benefits.length > 0
                    ? pkg.benefits.map((benefit, index) => ({
                        text: benefit.name || benefit,
                        type: 'fullweek'
                      }))
                    : [];

                  return (
                    <Card
                      key={pkg.id}
                      title={pkg.name}
                      subtitle={pkg.desc || undefined}
                      status={{
                        text: pkg.status === 'active' ? 'Đang sử dụng' : 'Đã hết hạn',
                        type: pkg.status === 'active' ? 'active' : 'pending'
                      }}
                      infoRows={infoRows}
                      badges={badges}
                      actions={pkg.status === 'active' ? [
                        {
                          text: 'Gia hạn',
                          primary: true,
                          onClick: () => {
                            // TODO: Implement extend functionality
                            addNotification({
                              message: 'Tính năng gia hạn đang được phát triển',
                              severity: 'info'
                            });
                          }
                        }
                      ] : []}
                    />
                  );
                })}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <PackageIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
                </div>
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

        {/* Services Add-ons */}
        {activeTab === 'services' && (
          <div className={styles.packagesSection}>
            {isLoadingServices ? (
              <div className={styles.inlineLoading}>
                <ContentLoading isLoading={true} text="Đang tải dịch vụ..." />
              </div>
            ) : servicesError ? (
              <div className={styles.errorState}>
                <p className={styles.errorMessage}>{servicesError}</p>
                <button className={styles.retryButton} onClick={loadServices}>
                  Thử lại
                </button>
              </div>
            ) : services.length > 0 ? (
              <div className={styles.packagesGrid}>
                {services.map((service) => renderServiceCard(service))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <ServiceIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
                </div>
                <h3>Chưa có dịch vụ nào</h3>
                <p>Hiện tại chi nhánh chưa cung cấp dịch vụ add-on nào cho phụ huynh.</p>
              </div>
            )}
          </div>
        )}

        {/* Buy Package Dialog */}
        <ManagementFormDialog
          open={showBuyDialog}
          onClose={() => {
            setShowBuyDialog(false);
            setSelectedPackage(null);
            setBuyForm({
              studentId: ''
            });
          }}
          mode="create"
          title="Mua gói dịch vụ"
          icon={ShoppingCartIcon}
          loading={isBuying}
          maxWidth="md"
        >
              {selectedPackage && (
            <Box sx={{ 
              mb: 3,
              p: 3,
              backgroundColor: 'rgba(0, 123, 255, 0.05)',
              borderRadius: 2,
              border: '1px solid rgba(0, 123, 255, 0.1)'
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 1,
                color: 'text.primary'
              }}>
                {selectedPackage.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={`Giá: ${formatCurrency(selectedPackage.price)}`}
                  sx={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}
                />
                {selectedPackage.durationInMonths && (
                  <Chip 
                    label={`Thời hạn: ${selectedPackage.durationInMonths} tháng`}
                    variant="outlined"
                    sx={{ fontSize: '0.85rem' }}
                  />
                )}
                {selectedPackage.totalSlots && (
                  <Chip 
                    label={`${selectedPackage.totalSlots} slot`}
                    variant="outlined"
                    sx={{ fontSize: '0.85rem' }}
                  />
                )}
              </Box>
            </Box>
          )}

          <Form
            schema={buyPackageSchema}
            defaultValues={buyForm}
            onSubmit={handleBuyPackage}
            submitText="Xác nhận mua"
            loading={isBuying}
                    disabled={isBuying}
            fields={[
              {
                name: 'studentId',
                label: 'Chọn con',
                type: 'select',
                required: true,
                placeholder: '-- Chọn con --',
                options: children.map(child => ({
                  value: child.id,
                  label: child.name || 'Không tên'
                }))
              }
            ]}
          />
        </ManagementFormDialog>
      </div>
    </motion.div>
  );
};

export default MyPackages;
