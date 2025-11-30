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

const Step1SelectDate = forwardRef(({ data, updateData, stepIndex, totalSteps }, ref) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [minDate, setMinDate] = useState(new Date());
  const [calendarKey, setCalendarKey] = useState(0);
  const calendarRef = React.useRef(null);
  const isUserSelectingRef = React.useRef(false);

  const isSameDate = (date1, date2) => {
    if (!date1 || !date2) return false;
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
    if (isUserSelectingRef.current) {
      return;
    }

    if (data?.selectedDate) {
      const date = data.selectedDate instanceof Date 
        ? new Date(data.selectedDate) 
        : new Date(data.selectedDate);
      
      if (!selectedDate || !isSameDate(date, selectedDate)) {
        setSelectedDate(date);
        
        if (calendarRef.current) {
          try {
            const calendarApi = calendarRef.current.getApi();
            if (calendarApi) {
              calendarApi.gotoDate(date);
            }
          } catch (error) {
            // Ignore errors
          }
        }
      }
    }
  }, [data?.selectedDate]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setMinDate(today);
  }, []);

  useEffect(() => {
    if (selectedDate && calendarRef.current) {
      try {
        const calendarApi = calendarRef.current.getApi();
        if (calendarApi) {
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
        // Ignore errors
      }
    }
  }, [selectedDate]);

  const normalizedSelectedDate = React.useMemo(() => {
    if (!selectedDate) return null;
    const normalized = new Date(selectedDate);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }, [selectedDate]);

  const dayCellClassNames = React.useCallback((info) => {
    const classes = [];
    
    const cellDate = new Date(info.date);
    cellDate.setHours(0, 0, 0, 0);
    const isPast = cellDate < minDate;

    if (isPast) {
      classes.push(styles.disabledDate);
    }

    if (normalizedSelectedDate) {
      const cellDate = new Date(info.date);
      cellDate.setHours(0, 0, 0, 0);
      
      if (cellDate.getTime() === normalizedSelectedDate.getTime()) {
        classes.push('fc-day-selected');
      }
    }

    return classes.join(' ');
  }, [normalizedSelectedDate, minDate]);

  const handleDateClick = (info) => {
    const clickedDate = info.date;

    if (clickedDate < minDate) {
      return;
    }

    if (selectedDate && isSameDate(clickedDate, selectedDate)) {
      return;
    }

    const newSelectedDate = new Date(clickedDate);
    newSelectedDate.setHours(0, 0, 0, 0);

    isUserSelectingRef.current = true;
    
    setSelectedDate(newSelectedDate);
    updateData({ selectedDate: newSelectedDate });
    
    setCalendarKey(prev => prev + 1);
    
    setTimeout(() => {
      isUserSelectingRef.current = false;
    }, 100);
  };

  const dayCellContent = React.useCallback((info) => {
    if (!normalizedSelectedDate) {
      return info.dayNumberText;
    }

    const cellDate = new Date(info.date);
    cellDate.setHours(0, 0, 0, 0);
    
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

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Bước {stepIndex + 1}/{totalSteps}: Chọn ngày</h2>
        <p className={styles.stepSubtitle}>
          Chọn ngày bạn muốn đăng ký ca giữ trẻ
        </p>
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
              firstDay={1}
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

        {selectedDate && (
          <div className={styles.bookingSummary} style={{ marginTop: '24px' }}>
            <h3 className={styles.summaryTitle}>Ngày đã chọn</h3>
            <div className={styles.infoGrid}>
              <div>
                <p className={styles.infoLabel}>Ngày</p>
                <p className={styles.infoValue}>{formatDate(selectedDate)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

Step1SelectDate.displayName = 'Step1SelectDate';

export default Step1SelectDate;

