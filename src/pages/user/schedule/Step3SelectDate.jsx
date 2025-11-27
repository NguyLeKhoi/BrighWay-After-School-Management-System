import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CheckCircle } from '@mui/icons-material';
import styles from './Schedule.module.css';

// Vietnamese locale configuration for FullCalendar
const viLocale = {
  code: 'vi',
  week: {
    dow: 1, // Monday is the first day of the week
    doy: 4  // The week that contains Jan 4th is the first week of the year
  },
  buttonText: {
    prev: '←',
    next: '→',
    today: 'Hôm nay',
    month: 'Tháng',
    week: 'Tuần',
    day: 'Ngày',
    list: 'Danh sách'
  },
  allDayText: 'Cả ngày',
  moreLinkText: 'thêm',
  noEventsText: 'Không có sự kiện',
  weekText: 'Tuần',
  weekNumbers: {
    weekNumber: 'Số tuần',
    allWeeks: 'Tất cả các tuần'
  },
  monthNames: [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ],
  monthNamesShort: [
    'T1', 'T2', 'T3', 'T4', 'T5', 'T6',
    'T7', 'T8', 'T9', 'T10', 'T11', 'T12'
  ],
  dayNames: [
    'Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'
  ],
  dayNamesShort: [
    'CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'
  ]
};

const WEEKDAY_LABELS = {
  0: 'Chủ nhật',
  1: 'Thứ hai',
  2: 'Thứ ba',
  3: 'Thứ tư',
  4: 'Thứ năm',
  5: 'Thứ sáu',
  6: 'Thứ bảy'
};

const Step3SelectDate = forwardRef(({ data, updateData }, ref) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [minDate, setMinDate] = useState(new Date());
  const [calendarKey, setCalendarKey] = useState(0); // Force re-render key
  const calendarRef = React.useRef(null);
  const isUserSelectingRef = React.useRef(false); // Track if user is actively selecting

  // Helper function to compare dates (only date part, ignore time)
  // Must be defined before useEffect that uses it
  const isSameDate = (date1, date2) => {
    if (!date1 || !date2) return false;
    
    // Normalize both dates to midnight for accurate comparison
    const d1 = new Date(date1);
    d1.setHours(0, 0, 0, 0);
    const d2 = new Date(date2);
    d2.setHours(0, 0, 0, 0);
    
    return d1.getTime() === d2.getTime();
  };

  useImperativeHandle(ref, () => ({
    submit: async () => {
      if (!selectedDate) {
        return false;
      }
      updateData({ 
        selectedDate: selectedDate
      });
      return true;
    }
  }));

  useEffect(() => {
    // Only update from data if user is not actively selecting
    if (isUserSelectingRef.current) {
      return;
    }

    if (data?.selectedDate) {
      const date = data.selectedDate instanceof Date 
        ? new Date(data.selectedDate) 
        : new Date(data.selectedDate);
      
      // Preserve time from date, but ensure it has time from slot if available
      if (data?.slot) {
        const time = data.slot.startTime || '08:00';
        const [hours = '8', minutes = '0'] = time.split(':');
        date.setHours(Number(hours), Number(minutes), 0, 0);
      }
      
      // Only update if it's different from current selectedDate
      if (!selectedDate || !isSameDate(date, selectedDate)) {
        // Normalize current selectedDate for comparison (only date part)
        const currentNormalized = selectedDate ? new Date(selectedDate) : null;
        if (currentNormalized) {
          currentNormalized.setHours(0, 0, 0, 0);
        }
        
        const dateForComparison = new Date(date);
        dateForComparison.setHours(0, 0, 0, 0);
        
        if (!currentNormalized || currentNormalized.getTime() !== dateForComparison.getTime()) {
          setSelectedDate(date);
          
          // Navigate calendar to the selected date's month
          if (calendarRef.current) {
            try {
              const calendarApi = calendarRef.current.getApi();
              if (calendarApi) {
                calendarApi.gotoDate(date);
              }
            } catch (error) {
            }
          }
        }
      }
    } else if (data?.slot && !selectedDate) {
      // Auto-calculate next slot date only if no date is selected
      const nextDate = getNextSlotDate(data.slot);
      // getNextSlotDate already sets the time from slot, so don't reset it
      setSelectedDate(nextDate);
      updateData({ selectedDate: nextDate });
      
      // Navigate calendar to the calculated date's month
      if (calendarRef.current) {
        try {
          const calendarApi = calendarRef.current.getApi();
          if (calendarApi) {
            calendarApi.gotoDate(nextDate);
          }
        } catch (error) {
        }
      }
    }
  }, [data?.selectedDate, data?.slot]);

  useEffect(() => {
    // Set minimum date to today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setMinDate(today);
  }, []);

  // Navigate calendar to selected date's month when selectedDate changes
  useEffect(() => {
    if (selectedDate && calendarRef.current) {
      try {
        const calendarApi = calendarRef.current.getApi();
        if (calendarApi) {
          // Only navigate if the calendar is not already showing the selected date's month
          const currentDate = calendarApi.getDate();
          const selectedMonth = selectedDate.getMonth();
          const selectedYear = selectedDate.getFullYear();
          const currentMonth = currentDate.getMonth();
          const currentYear = currentDate.getFullYear();
          
          if (selectedMonth !== currentMonth || selectedYear !== currentYear) {
            calendarApi.gotoDate(selectedDate);
          }
        }
      } catch (error) {
      }
    }
  }, [selectedDate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear ref on unmount to prevent errors
      if (calendarRef.current) {
        try {
          const calendarApi = calendarRef.current.getApi();
          if (calendarApi) {
            // Calendar will handle its own cleanup
          }
        } catch (error) {
          // Ignore errors during cleanup
        }
      }
    };
  }, []);

  const getNextSlotDate = (slot) => {
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

    const time = slot.startTime || '08:00';
    const [hours = '8', minutes = '0'] = time.split(':');
    result.setHours(Number(hours), Number(minutes), 0, 0);

    // Nếu slot đã trôi qua trong ngày hôm nay, chuyển sang tuần sau
    if (diff === 0 && result <= now) {
      result.setDate(result.getDate() + 7);
    }

    return result;
  };

  const handleDateChange = (e) => {
    const dateString = e.target.value;
    if (!dateString) {
      setSelectedDate(null);
      updateData({ selectedDate: null });
      return;
    }

    const newDate = new Date(dateString);
    
    if (data?.slot) {
      // Ensure the date matches the slot's weekday
      const slotWeekDay = typeof data.slot.weekDay === 'number' ? data.slot.weekDay : newDate.getDay();
      const selectedWeekDay = newDate.getDay();
      
      // If selected date doesn't match slot's weekday, adjust it
      if (selectedWeekDay !== slotWeekDay) {
        let diff = slotWeekDay - selectedWeekDay;
        if (diff < 0) diff += 7;
        newDate.setDate(newDate.getDate() + diff);
      }

      // Set the time from slot
      const time = data.slot.startTime || '08:00';
      const [hours = '8', minutes = '0'] = time.split(':');
      newDate.setHours(Number(hours), Number(minutes), 0, 0);
    }
    
    setSelectedDate(newDate);
    updateData({ selectedDate: newDate });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '—';
    try {
      return timeString.length === 5 ? timeString : timeString.substring(0, 5);
    } catch {
      return timeString;
    }
  };

  const formatDate = (date) => {
    if (!date) return '—';
    try {
      return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '—';
    }
  };

  // Normalize selectedDate to ensure consistent comparison
  // Must be declared before dayCellClassNames and dayCellContent that use it
  const normalizedSelectedDate = React.useMemo(() => {
    if (!selectedDate) return null;
    const normalized = new Date(selectedDate);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }, [selectedDate]);

  // Disable dates that don't match slot's weekday and highlight selected date
  // Use useCallback to ensure consistent behavior
  const dayCellClassNames = React.useCallback((info) => {
    const classes = [];
    
    if (!data?.slot) return classes.join(' ');
    
    const slotWeekDay = typeof data.slot.weekDay === 'number' ? data.slot.weekDay : null;
    if (slotWeekDay === null) return classes.join(' ');

    const cellWeekDay = info.date.getDay();
    const isPast = info.date < minDate;
    const isDisabled = cellWeekDay !== slotWeekDay || isPast;

    if (isDisabled) {
      classes.push(styles.disabledDate);
    }

    // Add selected class if date is selected (using normalized date comparison)
    if (normalizedSelectedDate) {
      // Normalize cell date for accurate comparison
      const cellDate = new Date(info.date);
      cellDate.setHours(0, 0, 0, 0);
      
      // Compare using getTime() for accurate comparison
      if (cellDate.getTime() === normalizedSelectedDate.getTime()) {
        classes.push('fc-day-selected');
      }
    }

    return classes.join(' ');
  }, [data?.slot, normalizedSelectedDate, minDate]);

  // Handle date click from calendar with validation
  // Only allows selecting one date at a time
  const handleDateClick = (info) => {
    const clickedDate = info.date;
    const clickedWeekDay = clickedDate.getDay();
    const slotWeekDay = data?.slot?.weekDay;

    // Check if date is in the past
    if (clickedDate < minDate) {
      return;
    }

    // Only allow selection if weekday matches slot's weekday
    if (slotWeekDay !== undefined && clickedWeekDay !== slotWeekDay) {
      return; // Don't allow selection
    }

    // If clicking the same date that's already selected, keep it selected
    // (don't toggle off - user must select a date)
    if (selectedDate && isSameDate(clickedDate, selectedDate)) {
      return; // Already selected, keep it
    }

    // Create a new date object to avoid reference issues
    const newSelectedDate = new Date(clickedDate);
    
    // Set time from slot (preserve the time, don't reset to 0:0:0:0)
    if (data?.slot) {
      const time = data.slot.startTime || '08:00';
      const [hours = '8', minutes = '0'] = time.split(':');
      newSelectedDate.setHours(Number(hours), Number(minutes), 0, 0);
    } else {
      // If no slot, set to start of day
      newSelectedDate.setHours(0, 0, 0, 0);
    }

    // Mark that user is actively selecting to prevent useEffect from overriding
    isUserSelectingRef.current = true;
    
    // Only one date can be selected at a time
    // Setting new date automatically replaces the previous one
    setSelectedDate(newSelectedDate);
    updateData({ selectedDate: newSelectedDate });
    
    // Force calendar re-render to ensure only one date is highlighted
    setCalendarKey(prev => prev + 1);
    
    // Reset flag after a short delay to allow useEffect to work again
    setTimeout(() => {
      isUserSelectingRef.current = false;
    }, 100);
    
    // Note: Navigation to the selected date's month is handled by useEffect
  };

  // Highlight selected date with green background and check icon
  // Use useCallback to ensure only one date is selected
  const dayCellContent = React.useCallback((info) => {
    if (!normalizedSelectedDate) {
      return info.dayNumberText;
    }

    // Normalize cell date for comparison
    const cellDate = new Date(info.date);
    cellDate.setHours(0, 0, 0, 0);
    
    // Compare using getTime() for accurate comparison
    const isSelected = cellDate.getTime() === normalizedSelectedDate.getTime();
    
    if (isSelected) {
      return (
        <div className={styles.selectedDateCell}>
          <span className={styles.dateNumber}>{info.dayNumberText}</span>
          <CheckCircle className={styles.checkIcon} />
        </div>
      );
    }
    
    return info.dayNumberText;
  }, [normalizedSelectedDate]);

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        {data?.slot && (
          <p className={styles.helperText} style={{ marginTop: '8px', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
            Lưu ý: Chỉ có thể chọn ngày {WEEKDAY_LABELS[data.slot.weekDay] ?? 'phù hợp'} cho slot này
          </p>
        )}
      </div>

      <div className={styles.bookingForm}>
        <div className={styles.formGroup}>
          <div className={styles.calendarContainer}>
            <FullCalendar
              key={`calendar-${calendarKey}-${selectedDate ? selectedDate.getTime() : 'no-selection'}`}
              ref={calendarRef}
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              initialDate={selectedDate || minDate}
              locale={viLocale}
              headerToolbar={{
                left: 'prev,next',
                center: 'title',
                right: ''
              }}
              firstDay={1} // Start week on Monday
              buttonText={viLocale.buttonText}
              dateClick={handleDateClick}
              dayCellClassNames={dayCellClassNames}
              dayCellContent={dayCellContent}
              validRange={{
                start: minDate.toISOString().split('T')[0]
              }}
              height="auto"
              eventDisplay="none"
              selectable={false}
              editable={false}
              dayMaxEvents={false}
            />
          </div>
        </div>

        {selectedDate && data?.slot && (
          <div className={styles.bookingSummary} style={{ marginTop: '24px' }}>
            <h3 className={styles.summaryTitle}>Thông tin đặt lịch</h3>
            <div className={styles.infoGrid}>
              <div>
                <p className={styles.infoLabel}>Ngày học</p>
                <p className={styles.infoValue}>{formatDate(selectedDate)}</p>
              </div>
              <div>
                <p className={styles.infoLabel}>Khung giờ</p>
                <p className={styles.infoValue}>
                  {formatTime(data.slot.startTime)} - {formatTime(data.slot.endTime)}
                </p>
              </div>
              <div>
                <p className={styles.infoLabel}>Chi nhánh</p>
                <p className={styles.infoValue}>{data.slot.branchName || '—'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

Step3SelectDate.displayName = 'Step3SelectDate';

export default Step3SelectDate;

