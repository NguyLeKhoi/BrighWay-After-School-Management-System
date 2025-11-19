import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Loading from '@components/Common/Loading';
import { useApp } from '../../../contexts/AppContext';
import studentService from '../../../services/student.service';
import branchSlotService from '../../../services/branchSlot.service';
import packageService from '../../../services/package.service';
import studentSlotService from '../../../services/studentSlot.service';
import styles from './Schedule.module.css';

const WEEKDAY_LABELS = {
  0: 'Chủ nhật',
  1: 'Thứ hai',
  2: 'Thứ ba',
  3: 'Thứ tư',
  4: 'Thứ năm',
  5: 'Thứ sáu',
  6: 'Thứ bảy'
};

const MySchedule = () => {
  const location = useLocation();
  const isInitialMount = useRef(true);
  const [children, setChildren] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [slots, setSlots] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [error, setError] = useState(null);
  const [slotsError, setSlotsError] = useState(null);
  const [roomsError, setRoomsError] = useState(null);
  const [subsError, setSubsError] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    subscriptionId: '',
    parentNote: ''
  });

  const { showGlobalError, addNotification } = useApp();

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      loadAvailableSlots(selectedStudentId);
      loadSubscriptions(selectedStudentId);
      setRooms([]);
      setSelectedSlotId('');
      setSelectedRoomId('');
      setSelectedRoom(null);
      setBookingForm({ subscriptionId: '', parentNote: '' });
    }
  }, [selectedStudentId]);

  // Reload data when navigate back to this page
  useEffect(() => {
    if (location.pathname === '/family/schedule') {
      // Skip first mount to avoid double loading
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }
      loadChildren();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const loadChildren = async () => {
    setIsLoadingChildren(true);
    setError(null);
    try {
      const response = await studentService.getMyChildren();
      const items = Array.isArray(response) ? response : [];
      setChildren(items);
      if (items.length > 0) {
        setSelectedStudentId(items[0].id);
      }
    } catch (err) {
      const errorMessage = err?.message || err?.error || 'Không thể tải danh sách con';
      setError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      setIsLoadingChildren(false);
    }
  };

  const loadAvailableSlots = async (studentId) => {
    setIsLoadingSlots(true);
    setSlotsError(null);

    try {
      const response = await branchSlotService.getAvailableSlotsForStudent(studentId, {
        pageIndex: 1,
        pageSize: 20
      });
      const items = Array.isArray(response)
        ? response
        : Array.isArray(response?.items)
          ? response.items
          : [];

      const mapped = items.map((slot) => ({
        id: slot.id,
        branchName: slot.branch?.branchName || slot.branchName || '',
        weekDay: slot.weekDate,
        status: slot.status || 'Available',
        timeframeName: slot.timeframe?.name || slot.timeframeName || '',
        startTime: slot.timeframe?.startTime || slot.startTime,
        endTime: slot.timeframe?.endTime || slot.endTime,
        slotTypeName: slot.slotType?.name || slot.slotTypeName || '',
        slotTypeDescription: slot.slotType?.description || slot.slotTypeDescription || '',
        description: slot.description || ''
      }));

      setSlots(mapped);
    } catch (err) {
      const errorMessage = err?.message || err?.error || 'Không thể tải slot phù hợp';
      setSlotsError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const loadRooms = async (slotId) => {
    if (!slotId) return;
    
    if (selectedSlotId === slotId) {
      // Toggle off if same slot clicked again
      setSelectedSlotId('');
      setRooms([]);
      setRoomsError(null);
      setSelectedRoomId('');
      setSelectedRoom(null);
      setBookingForm((prev) => ({ ...prev, subscriptionId: '' }));
      return;
    }
    
    setSelectedSlotId(slotId);
    setSelectedRoomId('');
    setSelectedRoom(null);
      setBookingForm((prev) => ({ ...prev, subscriptionId: '' }));
    setIsLoadingRooms(true);
    setRoomsError(null);

    try {
      const response = await branchSlotService.getRoomsByBranchSlot(slotId, {
        pageIndex: 1,
        pageSize: 20
      });
      const items = Array.isArray(response)
        ? response
        : Array.isArray(response?.items)
          ? response.items
          : [];

      const mapped = items.map((room) => ({
        id: room.id,
        name: room.roomName || 'Phòng không tên',
        facilityName: room.facilityName || room.facility?.name || '',
        branchName: room.branch?.branchName || room.branchName || '',
        capacity: room.capacity || 0
      }));

      setRooms(mapped);
    } catch (err) {
      const errorMessage = err?.message || err?.error || 'Không thể tải phòng cho slot';
      setRoomsError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const loadSubscriptions = async (studentId) => {
    setIsLoadingSubscriptions(true);
    setSubsError(null);

    try {
      const response = await packageService.getSubscriptionsByStudent(studentId);
      let items = [];
      if (Array.isArray(response)) {
        items = response;
      } else if (Array.isArray(response?.items)) {
        items = response.items;
      } else if (response?.id) {
        items = [response];
      }

      const mapped = items
        .map((sub) => ({
          id: sub.id,
          name: sub.packageName || 'Gói không tên',
          status: sub.status?.toLowerCase() || 'pending'
        }))
        .filter((sub) => sub.status !== 'cancelled');

      setSubscriptions(mapped);
      if (mapped.length === 0) {
        setBookingForm((prev) => ({ ...prev, subscriptionId: '' }));
      }
    } catch (err) {
      const errorMessage = err?.message || err?.error || 'Không thể tải gói đã mua';
      setSubsError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      setIsLoadingSubscriptions(false);
    }
  };

  const handleSelectRoom = (room) => {
    setSelectedRoomId(room.id);
    setSelectedRoom(room);
  };

  const handleBookSlot = async (e) => {
    e.preventDefault();

    if (!selectedStudentId || !selectedSlotId || !selectedRoomId) {
      addNotification({
        message: 'Vui lòng chọn slot và phòng trước khi đặt lịch',
        severity: 'warning'
      });
      return;
    }

    if (!bookingForm.subscriptionId) {
      addNotification({
        message: 'Vui lòng chọn gói đã mua để đặt lịch',
        severity: 'warning'
      });
      return;
    }

    setIsBooking(true);
    try {
      const slotDateTime = getNextSlotDate(selectedSlot);
      const isoDate = slotDateTime.toISOString();
      await studentSlotService.bookSlot({
        studentId: selectedStudentId,
        branchSlotId: selectedSlotId,
        packageSubscriptionId: bookingForm.subscriptionId,
        roomId: selectedRoomId,
        date: isoDate,
        parentNote: bookingForm.parentNote || ''
      });

      addNotification({
        message: 'Đặt lịch học thành công!',
        severity: 'success'
      });

      setBookingForm({
        subscriptionId: '',
        parentNote: ''
      });
      setSelectedRoomId('');
      setSelectedRoom(null);
      setRooms([]);
    } catch (err) {
      const errorMessage = err?.message || err?.error || 'Không thể đặt lịch học';
      showGlobalError(errorMessage);
      addNotification({
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setIsBooking(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '—';
    try {
      return timeString.length === 5 ? timeString : timeString.substring(0, 5);
    } catch {
      return timeString;
    }
  };

const getNextSlotDate = (slot, fallbackStartTime) => {
  const now = new Date();
  if (!slot) {
    return now;
  }

  const targetWeekDay = typeof slot.weekDay === 'number' ? slot.weekDay : now.getDay();
  const todayWeekDay = now.getDay();
  let diff = targetWeekDay - todayWeekDay;
  if (diff < 0) diff += 7;

  const result = new Date(now);
  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() + diff);

  const time = slot.startTime || fallbackStartTime || '08:00';
  const [hours = '8', minutes = '0'] = time.split(':');
  result.setHours(Number(hours), Number(minutes), 0, 0);

  // Nếu slot đã trôi qua trong ngày hôm nay, chuyển sang tuần sau
  if (diff === 0 && result <= now) {
    result.setDate(result.getDate() + 7);
  }

  return result;
};

  const renderSlotCard = (slot) => (
    <div key={slot.id} className={styles.scheduleCard}>
      <div className={styles.cardHeader}>
        <div>
          <p className={styles.cardLabel}>{slot.timeframeName || 'Slot phù hợp'}</p>
          <h3 className={styles.cardTitle}>
            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
          </h3>
        </div>
        <span
          className={`${styles.statusBadge} ${
            slot.status?.toLowerCase() === 'available' ? styles.active : styles.pending
          }`}
        >
          {slot.status || 'Available'}
        </span>
      </div>

      <div className={styles.infoGrid}>
        <div>
          <p className={styles.infoLabel}>Chi nhánh</p>
          <p className={styles.infoValue}>{slot.branchName || '—'}</p>
        </div>
        <div>
          <p className={styles.infoLabel}>Thứ</p>
          <p className={styles.infoValue}>{WEEKDAY_LABELS[slot.weekDay] ?? '—'}</p>
        </div>
        <div>
          <p className={styles.infoLabel}>Loại slot</p>
          <p className={styles.infoValue}>{slot.slotTypeName || '—'}</p>
        </div>
      </div>

      {slot.slotTypeDescription && (
        <div className={styles.benefits}>
          <p className={styles.infoLabel}>Mô tả</p>
          <p className={styles.description}>{slot.slotTypeDescription}</p>
        </div>
      )}

      <button
        className={`${styles.primaryButton} ${selectedSlotId === slot.id ? styles.activeButton : ''}`}
        onClick={() => loadRooms(slot.id)}
      >
        {selectedSlotId === slot.id ? 'Đóng danh sách phòng' : 'Xem phòng phù hợp'}
      </button>
    </div>
  );

  const renderRoomCard = (room) => (
    <div
      key={room.id}
      className={`${styles.roomCard} ${selectedRoomId === room.id ? styles.roomCardSelected : ''}`}
    >
      <div className={styles.roomHeader}>
        <h3>{room.name}</h3>
        <span className={styles.roomCapacity}>{room.capacity} chỗ</span>
      </div>
      <p className={styles.infoLabel}>Chi nhánh</p>
      <p className={styles.infoValue}>{room.branchName || '—'}</p>
      <button
        className={`${styles.roomSelectButton} ${
          selectedRoomId === room.id ? styles.roomSelectButtonActive : ''
        }`}
        onClick={() => handleSelectRoom(room)}
      >
        {selectedRoomId === room.id ? 'Đã chọn phòng này' : 'Chọn phòng này'}
      </button>
    </div>
  );

  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId) || null;

  return (
    <div className={styles.schedulePage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Lịch học</h1>
            <p className={styles.subtitle}>
              Theo dõi các gói học và lịch học hiện tại của con
            </p>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Chọn con</h2>
              <p className={styles.sectionSubtitle}>
                Chọn học sinh để xem các gói đã đăng ký
              </p>
            </div>
            <button className={styles.secondaryButton} onClick={loadChildren}>
              Làm mới
            </button>
          </div>

          {isLoadingChildren ? (
            <div className={styles.inlineLoading}>
              <Loading />
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <p>{error}</p>
              <button className={styles.retryButton} onClick={loadChildren}>
                Thử lại
              </button>
            </div>
          ) : children.length > 0 ? (
            <div className={styles.selectorRow}>
              <label htmlFor="childSelect" className={styles.selectorLabel}>
                Học sinh
              </label>
              <select
                id="childSelect"
                className={styles.selector}
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.name || child.userName || 'Không tên'}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>👶</div>
              <h3>Chưa có thông tin học sinh</h3>
              <p>Vui lòng liên hệ Staff/Manager để được thêm con vào hệ thống.</p>
            </div>
          )}
        </div>

        {selectedStudentId && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Slot phù hợp</h2>
                <p className={styles.sectionSubtitle}>
                  Danh sách khung giờ học mà chi nhánh có thể xếp cho học sinh
                </p>
              </div>
              <button
                className={styles.secondaryButton}
                onClick={() => loadAvailableSlots(selectedStudentId)}
              >
                Tải lại
              </button>
            </div>

            {isLoadingSlots ? (
              <div className={styles.inlineLoading}>
                <Loading />
              </div>
            ) : slotsError ? (
              <div className={styles.errorState}>
                <p>{slotsError}</p>
                <button
                  className={styles.retryButton}
                  onClick={() => loadAvailableSlots(selectedStudentId)}
                >
                  Thử lại
                </button>
              </div>
            ) : slots.length > 0 ? (
              <div className={styles.scheduleGrid}>
                {slots.map(renderSlotCard)}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>⏱️</div>
                <h3>Chưa có slot phù hợp</h3>
                <p>Chi nhánh chưa có slot trống cho học sinh này.</p>
              </div>
            )}
          </div>
        )}

        {selectedStudentId && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Phòng của slot đã chọn</h2>
                <p className={styles.sectionSubtitle}>
                  Chọn slot ở trên để xem các phòng tương ứng
                </p>
              </div>
            </div>

            {isLoadingRooms ? (
              <div className={styles.inlineLoading}>
                <Loading />
              </div>
            ) : roomsError ? (
              <div className={styles.errorState}>
                <p>{roomsError}</p>
                <button
                  className={styles.retryButton}
                  onClick={() => loadRooms(selectedSlotId)}
                  disabled={!selectedSlotId}
                >
                  Thử lại
                </button>
              </div>
            ) : selectedSlotId ? (
              rooms.length > 0 ? (
                <div className={styles.roomsGrid}>
                  {rooms.map(renderRoomCard)}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🏫</div>
                  <h3>Chưa có phòng phù hợp</h3>
                  <p>Slot đã chọn hiện chưa có phòng phù hợp.</p>
                </div>
              )
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>ℹ️</div>
                <h3>Chưa chọn slot</h3>
                <p>Hãy chọn một slot ở trên để xem các phòng tương ứng.</p>
              </div>
            )}
          </div>
        )}

        {selectedSlotId && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Đặt lịch học</h2>
                <p className={styles.sectionSubtitle}>
                  Chọn gói, ngày và ghi chú để gửi yêu cầu đến chi nhánh
                </p>
              </div>
            </div>

            {isLoadingSubscriptions ? (
              <div className={styles.inlineLoading}>
                <Loading />
              </div>
            ) : subsError ? (
              <div className={styles.errorState}>
                <p>{subsError}</p>
                <button
                  className={styles.retryButton}
                  onClick={() => loadSubscriptions(selectedStudentId)}
                >
                  Thử lại
                </button>
              </div>
            ) : selectedRoomId ? (
              subscriptions.length > 0 ? (
                <form className={styles.bookingForm} onSubmit={handleBookSlot}>
                  <div className={styles.bookingSummary}>
                    <div>
                      <p className={styles.infoLabel}>Slot đã chọn</p>
                      <p className={styles.infoValue}>
                        {selectedSlot?.timeframeName || '—'} (
                        {formatTime(selectedSlot?.startTime)} - {formatTime(selectedSlot?.endTime)})
                      </p>
                    </div>
                    <div>
                      <p className={styles.infoLabel}>Phòng</p>
                      <p className={styles.infoValue}>
                        {selectedRoom?.name} · {selectedRoom?.capacity} chỗ
                      </p>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Gói đã mua *</label>
                    <select
                      className={styles.formSelect}
                      value={bookingForm.subscriptionId}
                      onChange={(e) =>
                        setBookingForm((prev) => ({ ...prev, subscriptionId: e.target.value }))
                      }
                    >
                      <option value="">-- Chọn gói --</option>
                      {subscriptions.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name} ({sub.status === 'active' ? 'Đang hoạt động' : sub.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Ghi chú cho nhân viên</label>
                    <textarea
                      className={styles.formTextarea}
                      rows={3}
                      placeholder="Ví dụ: Con cần giáo viên hỗ trợ bơi..."
                      value={bookingForm.parentNote}
                      onChange={(e) =>
                        setBookingForm((prev) => ({ ...prev, parentNote: e.target.value }))
                      }
                    />
                  </div>

                  <div className={styles.bookingActions}>
                    <button
                      type="submit"
                      className={styles.bookButton}
                      disabled={isBooking}
                    >
                      {isBooking ? 'Đang đặt lịch...' : 'Đặt lịch học'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📦</div>
                  <h3>Chưa có gói đã mua</h3>
                  <p>Bạn cần mua gói học trước khi đặt lịch.</p>
                </div>
              )
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🏫</div>
                <h3>Chưa chọn phòng</h3>
                <p>Hãy chọn một phòng phù hợp trước khi đặt lịch.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySchedule;

