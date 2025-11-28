import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Receipt as ServiceIcon, ShoppingCart as ShoppingCartIcon, Payment as PaymentIcon } from '@mui/icons-material';
import { Box, Typography, Chip, Button } from '@mui/material';
import ContentLoading from '@components/Common/ContentLoading';
import AnimatedCard from '../../../components/Common/AnimatedCard';
import ManagementFormDialog from '@components/Management/FormDialog';
import ConfirmDialog from '@components/Common/ConfirmDialog';
import Form from '@components/Common/Form';
import { useApp } from '../../../contexts/AppContext';
import serviceService from '../../../services/service.service';
import orderService from '../../../services/order.service';
import studentService from '../../../services/student.service';
import studentSlotService from '../../../services/studentSlot.service';
import * as yup from 'yup';
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
  const [selectedWalletType, setSelectedWalletType] = useState(null);
  const [showConfirmPaymentDialog, setShowConfirmPaymentDialog] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
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
      // First, get children to get studentId
      const childrenResponse = await studentService.getMyChildren();
      const childrenList = Array.isArray(childrenResponse) ? childrenResponse : [];
      
      if (childrenList.length === 0) {
        setServices([]);
        setServicesError('Bạn chưa có trẻ em nào. Vui lòng thêm trẻ em trước.');
        return;
      }

      // Use the first child to get add-ons (all children should be in the same branch)
      const firstChild = childrenList[0];
      if (!firstChild?.id) {
        setServices([]);
        setServicesError('Không tìm thấy thông tin trẻ em.');
        return;
      }

      // Get add-ons for the first child
      const response = await serviceService.getAddOnsForStudent(firstChild.id);
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

  const handleOrderSubmit = async (data) => {
    if (!selectedService) return;

    setIsOrdering(true);
    try {
      const response = await orderService.createOrder({
        studentSlotId: data.studentSlotId,
        items: [
          {
            serviceId: selectedService.id,
            quantity: data.quantity
          }
        ]
      });

      setOrderSuccessInfo({
        orderId: response?.orderId || response?.id,
        orderTotal:
          response?.totalAmount ||
          selectedService.effectivePrice * data.quantity,
        childName:
          children.find((child) => child.id === data.childId)?.name ||
          children.find((child) => child.id === data.childId)?.userName ||
          'Không tên'
      });
      setPaymentResult(null);
      setShowOrderDialog(false);
      setOrderForm({
        childId: '',
        studentSlotId: '',
        quantity: 1
      });
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

  const orderSchema = yup.object().shape({
    childId: yup.string().required('Vui lòng chọn trẻ em'),
    studentSlotId: yup.string().when('childId', {
      is: (val) => val && val !== '',
      then: (schema) => schema.required('Vui lòng chọn lịch học đã đặt'),
      otherwise: (schema) => schema.nullable()
    }),
    quantity: yup.number().min(1, 'Số lượng phải lớn hơn 0').required('Vui lòng nhập số lượng')
  });

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

      {/* Buy Service Dialog */}
      <ManagementFormDialog
        open={showOrderDialog}
        onClose={() => {
          if (!isOrdering) {
            setShowOrderDialog(false);
            setSelectedService(null);
            setOrderForm({
              childId: '',
              studentSlotId: '',
              quantity: 1
            });
          }
        }}
        mode="create"
        title="Mua dịch vụ"
        icon={ShoppingCartIcon}
        loading={isOrdering}
        maxWidth="md"
      >
        {selectedService && (
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
              {selectedService.name}
            </Typography>
            <Chip 
              label={`Giá: ${formatCurrency(selectedService.effectivePrice)}`}
              sx={{
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            />
          </Box>
        )}

        <Form
          key={`order-form-${orderForm.childId}-${studentSlots.length}`}
          schema={orderSchema}
          defaultValues={{
            childId: orderForm.childId || '',
            studentSlotId: orderForm.studentSlotId || '',
            quantity: orderForm.quantity || 1
          }}
          onSubmit={handleOrderSubmit}
          submitText="Xác nhận mua"
          loading={isOrdering}
          disabled={isOrdering}
          fields={[
            {
              name: 'childId',
              label: 'Chọn trẻ em',
              type: 'select',
              required: true,
              placeholder: '-- Chọn trẻ em --',
              options: children.length > 0 ? children.map(child => ({
                value: child.id,
                label: child.name || child.userName || 'Không tên'
              })) : [],
              onChange: (value) => {
                handleChildChange(value);
              }
            },
            ...(orderForm.childId && studentSlots.length > 0 ? [{
              name: 'studentSlotId',
              label: 'Lịch học (Student Slot)',
              type: 'select',
              required: true,
              placeholder: '-- Chọn lịch học --',
              options: studentSlots.map(slot => ({
                value: slot.id,
                label: `${new Date(slot.date).toLocaleString('vi-VN')} · ${slot.status}`
              }))
            }] : orderForm.childId && isLoadingSlots ? [{
              name: 'studentSlotId',
              label: 'Lịch học (Student Slot)',
              type: 'text',
              disabled: true,
              placeholder: 'Đang tải lịch học...'
            }] : orderForm.childId && slotsError ? [{
              name: 'studentSlotId',
              label: 'Lịch học (Student Slot)',
              type: 'text',
              disabled: true,
              placeholder: slotsError
            }] : orderForm.childId ? [{
              name: 'studentSlotId',
              label: 'Lịch học (Student Slot)',
              type: 'text',
              disabled: true,
              placeholder: 'Chưa có lịch học nào. Vui lòng đặt lịch trước.'
            }] : []),
            {
              name: 'quantity',
              label: 'Số lượng',
              type: 'number',
              required: true,
              min: 1
            }
          ]}
        />
      </ManagementFormDialog>

      {/* Payment Dialog */}
      <ManagementFormDialog
        open={!!orderSuccessInfo}
        onClose={() => {
          setOrderSuccessInfo(null);
          setPaymentResult(null);
        }}
        mode="create"
        title="Thanh toán đơn hàng"
        icon={PaymentIcon}
        loading={false}
        maxWidth="sm"
      >
        {orderSuccessInfo && (
          <>
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
                Đơn #{orderSuccessInfo.orderId}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body1">
                  <strong>Tổng tiền:</strong> {formatCurrency(orderSuccessInfo.orderTotal)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Học sinh: {orderSuccessInfo.childName}
                </Typography>
              </Box>
            </Box>

            <Typography variant="body1" sx={{ mb: 2, fontWeight: 600 }}>
              Chọn ví để thanh toán:
            </Typography>

            {paymentResult && (
              <Box sx={{ 
                mb: 3,
                p: 2,
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderRadius: 2,
                border: '1px solid rgba(76, 175, 80, 0.3)'
              }}>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Trạng thái:</strong> {paymentResult.status}
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Số tiền đã trả:</strong> {formatCurrency(paymentResult.paidAmount)}
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Số dư còn lại:</strong> {formatCurrency(paymentResult.remainingBalance)}
                </Typography>
                <Typography variant="body2">
                  <strong>Tin nhắn:</strong> {paymentResult.message}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => {
                  setSelectedWalletType('Parent');
                  setShowConfirmPaymentDialog(true);
                }}
                disabled={isPaying || !!paymentResult}
                sx={{ flex: 1, minWidth: '120px' }}
              >
                Ví phụ huynh
              </Button>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => {
                  setSelectedWalletType('Student');
                  setShowConfirmPaymentDialog(true);
                }}
                disabled={isPaying || !!paymentResult}
                sx={{ flex: 1, minWidth: '120px' }}
              >
                Ví trẻ em
              </Button>
            </Box>
          </>
        )}
      </ManagementFormDialog>

      {/* Confirm Payment Dialog */}
      <ConfirmDialog
        open={showConfirmPaymentDialog}
        onClose={() => {
          setShowConfirmPaymentDialog(false);
          setSelectedWalletType(null);
        }}
        onConfirm={async () => {
          if (!orderSuccessInfo || !selectedWalletType) return;
          
          setIsPaying(true);
          setShowConfirmPaymentDialog(false);
          
          try {
            const res = await orderService.payOrderWithWallet({
              orderId: orderSuccessInfo.orderId,
              walletType: selectedWalletType
            });
            setPaymentResult(res);
            addNotification({
              message: `Thanh toán từ ${selectedWalletType === 'Parent' ? 'ví phụ huynh' : 'ví học sinh'} thành công!`,
              severity: 'success'
            });
            setSelectedWalletType(null);
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
            setSelectedWalletType(null);
          } finally {
            setIsPaying(false);
          }
        }}
        title="Xác nhận thanh toán"
        description={`Bạn có chắc chắn muốn thanh toán đơn hàng #${orderSuccessInfo?.orderId} với số tiền ${orderSuccessInfo ? formatCurrency(orderSuccessInfo.orderTotal) : ''} từ ${selectedWalletType === 'Parent' ? 'ví phụ huynh' : 'ví học sinh'}?`}
        confirmText="Xác nhận thanh toán"
        cancelText="Hủy"
        confirmColor="primary"
        showWarningIcon={true}
      />
    </motion.div>
  );
};

export default FamilyServices;

