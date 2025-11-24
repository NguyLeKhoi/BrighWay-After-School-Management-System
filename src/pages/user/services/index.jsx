import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Receipt as ServiceIcon } from '@mui/icons-material';
import ContentLoading from '@components/Common/ContentLoading';
import AnimatedCard from '../../../components/Common/AnimatedCard';
import { useApp } from '../../../contexts/AppContext';
import serviceService from '../../../services/service.service';
import orderService from '../../../services/order.service';
import studentService from '../../../services/student.service';
import studentSlotService from '../../../services/studentSlot.service';
import styles from './Services.module.css';

const FamilyServices = () => {
  const location = useLocation();
  const isInitialMount = useRef(true);
  const [services, setServices] = useState([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [servicesError, setServicesError] = useState(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [orderForm, setOrderForm] = useState({
    childId: '',
    studentSlotId: '',
    quantity: 1
  });
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccessInfo, setOrderSuccessInfo] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const [children, setChildren] = useState([]);
  const [childrenError, setChildrenError] = useState(null);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);
  const [studentSlots, setStudentSlots] = useState([]);
  const [slotsError, setSlotsError] = useState(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const { showGlobalError, addNotification } = useApp();

  useEffect(() => {
    loadServices();
  }, []);

  // Reload data when navigate back to this page
  useEffect(() => {
    if (location.pathname === '/family/services') {
      // Skip first mount to avoid double loading
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }
      loadServices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const loadServices = async () => {
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
      const errorMessage =
        typeof err === 'string'
          ? err
          : err?.message || err?.error || 'Không thể tải danh sách dịch vụ';

      setServicesError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      setIsLoadingServices(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const handleOrderClick = (service) => {
    setSelectedService(service);
    setOrderForm({
      childId: '',
      studentSlotId: '',
      quantity: 1
    });
    setShowOrderDialog(true);
    setStudentSlots([]);
    setSlotsError(null);
    if (children.length === 0) {
      loadChildren();
    }
  };

  const loadChildren = async () => {
    setIsLoadingChildren(true);
    setChildrenError(null);
    try {
      const response = await studentService.getMyChildren();
      const items = Array.isArray(response) ? response : [];
      setChildren(items);
    } catch (err) {
      const errorMessage =
        typeof err === 'string'
          ? err
          : err?.message || err?.error || 'Không thể tải danh sách con';
      setChildrenError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      setIsLoadingChildren(false);
    }
  };

  const loadStudentSlots = async (childId) => {
    if (!childId) {
      setStudentSlots([]);
      return;
    }

    setIsLoadingSlots(true);
    setSlotsError(null);
    try {
      const response = await studentSlotService.getStudentSlots({
        pageIndex: 1,
        pageSize: 50,
        studentId: childId,
        status: 'booked',
        upcomingOnly: true
      });

      const items = Array.isArray(response)
        ? response
        : Array.isArray(response?.items)
          ? response.items
          : [];

      const mapped = items.map((slot) => ({
        id: slot.id,
        date: slot.date,
        status: slot.status,
        parentNote: slot.parentNote,
        branchSlotId: slot.branchSlotId,
        roomId: slot.roomId
      }));

      setStudentSlots(mapped);
    } catch (err) {
      const errorMessage =
        typeof err === 'string'
          ? err
          : err?.message || err?.error || 'Không thể tải lịch học đã đặt';
      setSlotsError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleChildChange = (childId) => {
    setOrderForm((prev) => ({
      ...prev,
      childId,
      studentSlotId: ''
    }));
    loadStudentSlots(childId);
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!selectedService) return;

    if (!orderForm.childId) {
      addNotification({
        message: 'Vui lòng chọn trẻ em.',
        severity: 'warning'
      });
      return;
    }

    if (!orderForm.studentSlotId) {
      addNotification({
        message: 'Vui lòng chọn lịch học đã đặt.',
        severity: 'warning'
      });
      return;
    }

    if (orderForm.quantity <= 0) {
      addNotification({
        message: 'Số lượng phải lớn hơn 0.',
        severity: 'warning'
      });
      return;
    }

    setIsOrdering(true);
    try {
      const response = await orderService.createOrder({
        studentSlotId: orderForm.studentSlotId,
        items: [
          {
            serviceId: selectedService.id,
            quantity: orderForm.quantity
          }
        ]
      });

      setOrderSuccessInfo({
        orderId: response?.orderId || response?.id,
        orderTotal:
          response?.totalAmount ||
          selectedService.effectivePrice * orderForm.quantity,
        childName:
          children.find((child) => child.id === orderForm.childId)?.name ||
          children.find((child) => child.id === orderForm.childId)?.userName ||
          'Không tên'
      });
      setPaymentResult(null);
      setShowOrderDialog(false);
    } catch (err) {
      const errorMessage =
        typeof err === 'string'
          ? err
          : err?.message || err?.error || 'Không thể tạo đơn dịch vụ';
      showGlobalError(errorMessage);
      addNotification({
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <motion.div 
      className={styles.servicesPage}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Dịch vụ add-on</h1>
            <p className={styles.subtitle}>
              Danh sách dịch vụ đang mở bán tại chi nhánh của gia đình bạn
            </p>
          </div>
          <button className={styles.secondaryButton} onClick={loadServices}>
            Làm mới
          </button>
        </div>

        {isLoadingServices ? (
          <div className={styles.inlineLoading}>
            <ContentLoading isLoading={true} text="Đang tải dịch vụ..." />
          </div>
        ) : servicesError ? (
          <div className={styles.errorState}>
            <p>{servicesError}</p>
            <button className={styles.retryButton} onClick={loadServices}>
              Thử lại
            </button>
          </div>
        ) : services.length > 0 ? (
          <div className={styles.servicesGrid}>
            {services.map((service) => (
              <div key={service.id || service.name} className={styles.serviceCard}>
                <div className={styles.serviceHeader}>
                  <div>
                    <p className={styles.serviceType}>{service.type}</p>
                    <h3 className={styles.serviceName}>{service.name}</h3>
                  </div>
                  <span
                    className={`${styles.serviceBadge} ${
                      service.isActive ? styles.active : styles.inactive
                    }`}
                  >
                    {service.isActive ? 'Hoạt động' : 'Tạm dừng'}
                  </span>
                </div>

                <div className={styles.servicePrice}>
                  {formatCurrency(service.effectivePrice)}
                  {service.priceOverride && service.priceOverride !== service.effectivePrice && (
                    <span className={styles.originalPrice}>
                      {formatCurrency(service.priceOverride)}
                    </span>
                  )}
                </div>

                {service.description && (
                  <p className={styles.serviceDescription}>{service.description}</p>
                )}

                {service.benefits.length > 0 && (
                  <ul className={styles.serviceBenefits}>
                    {service.benefits.map((benefit, index) => (
                      <li key={index}>
                        <span>✓</span>
                        {benefit.name || benefit}
                      </li>
                    ))}
                  </ul>
                )}

                {service.note && (
                  <div className={styles.serviceNote}>
                    <strong>Lưu ý:</strong> {service.note}
                  </div>
                )}

                {service.isActive && (
                  <button
                    className={styles.orderButton}
                    onClick={() => handleOrderClick(service)}
                  >
                    Mua dịch vụ
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <ServiceIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
            </div>
            <h3>Chưa có dịch vụ add-on</h3>
            <p>Chi nhánh của bạn chưa cung cấp dịch vụ nào. Vui lòng quay lại sau.</p>
          </div>
        )}
      </div>

      {showOrderDialog && (
        <div className={styles.dialogOverlay} onClick={() => !isOrdering && setShowOrderDialog(false)}>
          <div className={styles.dialogContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.dialogHeader}>
              <h2 className={styles.dialogTitle}>Mua dịch vụ</h2>
              <button
                className={styles.dialogClose}
                onClick={() => !isOrdering && setShowOrderDialog(false)}
              >
                ×
              </button>
            </div>

            {selectedService && (
              <div className={styles.dialogServiceInfo}>
                <h3 className={styles.dialogServiceName}>{selectedService.name}</h3>
                <p className={styles.dialogServicePrice}>
                  Giá: {formatCurrency(selectedService.effectivePrice)}
                </p>
              </div>
            )}

            <form className={styles.orderForm} onSubmit={handleOrderSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Chọn trẻ em <span className={styles.required}>*</span>
                </label>
                {isLoadingChildren ? (
                  <div className={styles.inlineLoading}>
                    <ContentLoading isLoading={true} text="Đang tải danh sách con..." />
                  </div>
                ) : childrenError ? (
                  <div className={styles.errorState}>
                    <p>{childrenError}</p>
                    <button
                      type="button"
                      className={styles.retryButton}
                      onClick={loadChildren}
                    >
                      Thử lại
                    </button>
                  </div>
                ) : (
                  <select
                    className={styles.formInput}
                    value={orderForm.childId}
                    onChange={(e) => handleChildChange(e.target.value)}
                    disabled={isOrdering || children.length === 0}
                  >
                    <option value="">-- Chọn trẻ em --</option>
                    {children.map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.name || child.userName || 'Không tên'}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {orderForm.childId && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Lịch học (Student Slot) <span className={styles.required}>*</span>
                  </label>
                  {isLoadingSlots ? (
                    <div className={styles.inlineLoading}>
                      <ContentLoading isLoading={true} text="Đang tải ca học..." />
                    </div>
                  ) : slotsError ? (
                    <div className={styles.errorState}>
                      <p>{slotsError}</p>
                      <button
                        type="button"
                        className={styles.retryButton}
                        onClick={() => loadStudentSlots(orderForm.childId)}
                      >
                        Thử lại
                      </button>
                    </div>
                  ) : studentSlots.length > 0 ? (
                    <select
                      className={styles.formInput}
                      value={orderForm.studentSlotId}
                      onChange={(e) =>
                        setOrderForm((prev) => ({ ...prev, studentSlotId: e.target.value }))
                      }
                      disabled={isOrdering}
                    >
                      <option value="">-- Chọn lịch học --</option>
                      {studentSlots.map((slot) => (
                        <option key={slot.id} value={slot.id}>
                          {new Date(slot.date).toLocaleString('vi-VN')} · {slot.status}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className={styles.formHint}>
                      Chưa có lịch học nào. Vui lòng đặt lịch trước.
                    </p>
                  )}
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Số lượng <span className={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  className={styles.formInput}
                  value={orderForm.quantity}
                  onChange={(e) =>
                    setOrderForm((prev) => ({
                      ...prev,
                      quantity: Number(e.target.value)
                    }))
                  }
                  disabled={isOrdering}
                />
              </div>

              <div className={styles.dialogActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowOrderDialog(false)}
                  disabled={isOrdering}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={styles.confirmButton}
                  disabled={isOrdering}
                >
                  {isOrdering ? 'Đang xử lý...' : 'Xác nhận mua'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {orderSuccessInfo && (
        <div className={styles.dialogOverlay} onClick={() => setOrderSuccessInfo(null)}>
          <div className={styles.dialogContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.dialogHeader}>
              <h2 className={styles.dialogTitle}>Thanh toán đơn hàng</h2>
              <button
                className={styles.dialogClose}
                onClick={() => setOrderSuccessInfo(null)}
              >
                ×
              </button>
            </div>

            <div className={styles.dialogServiceInfo}>
              <h3 className={styles.dialogServiceName}>Đơn #{orderSuccessInfo.orderId}</h3>
              <p className={styles.dialogServicePrice}>
                Tổng tiền: {formatCurrency(orderSuccessInfo.orderTotal)}
              </p>
              <p className={styles.formHint}>Học sinh: {orderSuccessInfo.childName}</p>
            </div>

            <div className={styles.orderForm}>
              <p className={styles.formLabel}>Chọn ví để thanh toán:</p>
              {paymentResult && (
                <div className={styles.paymentResult}>
                  <p>
                    Trạng thái: <strong>{paymentResult.status}</strong>
                  </p>
                  <p>Số tiền đã trả: {formatCurrency(paymentResult.paidAmount)}</p>
                  <p>Số dư còn lại: {formatCurrency(paymentResult.remainingBalance)}</p>
                  <p>Tin nhắn: {paymentResult.message}</p>
                </div>
              )}
              <div className={styles.walletButtons}>
                <button
                  className={styles.walletButton}
                  onClick={async () => {
                    try {
                      const res = await orderService.payOrderWithWallet({
                        orderId: orderSuccessInfo.orderId,
                        walletType: 'Parent'
                      });
                      setPaymentResult(res);
                      addNotification({
                        message: 'Thanh toán từ ví phụ huynh thành công!',
                        severity: 'success'
                      });
                    } catch (err) {
                      const errorMessage =
                        typeof err === 'string'
                          ? err
                          : err?.message || err?.error || 'Thanh toán thất bại';
                      showGlobalError(errorMessage);
                      addNotification({
                        message: errorMessage,
                        severity: 'error'
                      });
                    }
                  }}
                >
                  Ví phụ huynh
                </button>
                <button
                  className={styles.walletButton}
                  onClick={async () => {
                    try {
                      const res = await orderService.payOrderWithWallet({
                        orderId: orderSuccessInfo.orderId,
                        walletType: 'Student'
                      });
                      setPaymentResult(res);
                      addNotification({
                        message: 'Thanh toán từ ví học sinh thành công!',
                        severity: 'success'
                      });
                    } catch (err) {
                      const errorMessage =
                        typeof err === 'string'
                          ? err
                          : err?.message || err?.error || 'Thanh toán thất bại';
                      showGlobalError(errorMessage);
                      addNotification({
                        message: errorMessage,
                        severity: 'error'
                      });
                    }
                  }}
                >
                  Ví trẻ em
                </button>
                <button
                  className={styles.cancelButton}
                  onClick={() => setOrderSuccessInfo(null)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default FamilyServices;

