import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import styles from './ChildSchedule.module.css';

const ChildSchedule = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [child, setChild] = useState(null);
  const [scheduleData, setScheduleData] = useState([]);

  // Mock data cho thông tin con
  const mockChildren = [
    {
      id: 1,
      name: 'Nguyễn Văn B',
      age: 8,
      grade: 'Lớp 3'
    },
    {
      id: 2,
      name: 'Nguyễn Thị C',
      age: 10,
      grade: 'Lớp 5'
    }
  ];

  // Mock data cho lịch học (FullCalendar format) - Khung giờ 17h-21h
  const mockScheduleData = [
    {
      id: '1',
      title: 'Toán học nâng cao',
      start: new Date(2024, 11, 30, 17, 0),
      end: new Date(2024, 11, 30, 18, 0),
      extendedProps: {
        description: 'Học toán nâng cao - Phép nhân chia',
        location: 'Phòng A101'
      },
      backgroundColor: '#1f2937',
      borderColor: '#1f2937'
    },
    {
      id: '2',
      title: 'Tiếng Việt nâng cao',
      start: new Date(2024, 11, 30, 18, 30),
      end: new Date(2024, 11, 30, 19, 30),
      extendedProps: {
        description: 'Đọc hiểu và viết văn',
        location: 'Phòng A102'
      },
      backgroundColor: '#059669',
      borderColor: '#059669'
    },
    {
      id: '3',
      title: 'Tiếng Anh giao tiếp',
      start: new Date(2024, 11, 31, 17, 0),
      end: new Date(2024, 11, 31, 18, 0),
      extendedProps: {
        description: 'Học giao tiếp tiếng Anh',
        location: 'Phòng A103'
      },
      backgroundColor: '#dc2626',
      borderColor: '#dc2626'
    },
    {
      id: '4',
      title: 'Khoa học thực hành',
      start: new Date(2024, 11, 31, 18, 30),
      end: new Date(2024, 11, 31, 19, 30),
      extendedProps: {
        description: 'Thí nghiệm khoa học',
        location: 'Phòng thí nghiệm'
      },
      backgroundColor: '#7c3aed',
      borderColor: '#7c3aed'
    },
    {
      id: '5',
      title: 'Thể dục buổi tối',
      start: new Date(2025, 0, 1, 17, 0),
      end: new Date(2025, 0, 1, 18, 0),
      extendedProps: {
        description: 'Vận động và yoga',
        location: 'Sân thể thao'
      },
      backgroundColor: '#ea580c',
      borderColor: '#ea580c'
    },
    {
      id: '6',
      title: 'Mỹ thuật sáng tạo',
      start: new Date(2025, 0, 1, 18, 30),
      end: new Date(2025, 0, 1, 19, 30),
      extendedProps: {
        description: 'Vẽ tranh và làm thủ công',
        location: 'Phòng mỹ thuật'
      },
      backgroundColor: '#0891b2',
      borderColor: '#0891b2'
    },
    {
      id: '7',
      title: 'Câu lạc bộ ngoại khóa',
      start: new Date(2025, 0, 2, 17, 0),
      end: new Date(2025, 0, 2, 19, 0),
      extendedProps: {
        description: 'Tham gia câu lạc bộ ngoại khóa',
        location: 'Phòng hoạt động'
      },
      backgroundColor: '#be123c',
      borderColor: '#be123c'
    },
    {
      id: '8',
      title: 'Ôn tập buổi tối',
      start: new Date(2025, 0, 3, 17, 0),
      end: new Date(2025, 0, 3, 19, 0),
      extendedProps: {
        description: 'Tổng hợp kiến thức tuần',
        location: 'Thư viện'
      },
      backgroundColor: '#4338ca',
      borderColor: '#4338ca'
    },
    {
      id: '9',
      title: 'Luyện tập piano',
      start: new Date(2025, 0, 4, 17, 30),
      end: new Date(2025, 0, 4, 18, 30),
      extendedProps: {
        description: 'Học đàn piano cơ bản',
        location: 'Phòng nhạc'
      },
      backgroundColor: '#16a34a',
      borderColor: '#16a34a'
    },
    {
      id: '10',
      title: 'Học võ thuật',
      start: new Date(2025, 0, 5, 17, 0),
      end: new Date(2025, 0, 5, 18, 0),
      extendedProps: {
        description: 'Học võ Taekwondo',
        location: 'Sân võ'
      },
      backgroundColor: '#ca8a04',
      borderColor: '#ca8a04'
    }
  ];

  useEffect(() => {
    // Tìm thông tin con từ mock data
    const foundChild = mockChildren.find(c => c.id === parseInt(childId));
    if (foundChild) {
      setChild(foundChild);
      // Lọc lịch học theo từng con (trong thực tế sẽ gọi API)
      setScheduleData(mockScheduleData);
    } else {
      navigate('/parent/children');
    }
  }, [childId, navigate]);

  const handleBack = () => {
    navigate('/parent/children');
  };

  // Event handlers cho FullCalendar
  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    const startTime = event.start.toLocaleString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    const endTime = event.end.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    alert(`Môn học: ${event.title}\nThời gian: ${startTime} - ${endTime}\nĐịa điểm: ${event.extendedProps.location}\nMô tả: ${event.extendedProps.description}`);
  };

  // Ngăn chặn drag & drop và các thao tác chỉnh sửa
  const handleDateSelect = (selectInfo) => {
    // Ngăn chặn tạo event mới
    return false;
  };

  const handleEventDrop = (dropInfo) => {
    // Ngăn chặn drag & drop
    dropInfo.revert();
  };

  const handleEventResize = (resizeInfo) => {
    // Ngăn chặn resize
    resizeInfo.revert();
  };

  if (!child) {
    return <div className={styles.loading}>Đang tải...</div>;
  }

  return (
    <div className={styles.schedulePage}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <button className={styles.backButton} onClick={handleBack}>
            ← Quay lại
          </button>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Lịch học của {child.name}</h1>
            <p className={styles.subtitle}>{child.age} tuổi • {child.grade}</p>
          </div>
          <div className={styles.viewInfo}>
            <span className={styles.infoText}>Chế độ xem</span>
          </div>
        </div>

        {/* FullCalendar Component */}
        <div className={styles.scheduleContainer}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={scheduleData}
            eventClick={handleEventClick}
            selectable={false}
            editable={false}
            droppable={false}
            select={handleDateSelect}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            height="auto"
            locale="vi"
            buttonText={{
              today: 'Hôm nay',
              month: 'Tháng',
              week: 'Tuần',
              day: 'Ngày'
            }}
            dayMaxEvents={3}
            moreLinkClick="popover"
            eventDisplay="block"
             nowIndicator={true}
             slotMinTime='17:00:00'
             slotMaxTime='21:00:00'
             businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5],
              startTime: '17:00',
              endTime: '21:00'
            }}
          />
        </div>

        {/* Legend */}
        <div className={styles.legend}>
          <h3 className={styles.legendTitle}>Chú thích môn học:</h3>
          <div className={styles.legendItems}>
            <div className={styles.legendItem}>
              <span className={styles.legendColor} style={{ backgroundColor: '#1f2937' }}></span>
              <span>Toán học</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendColor} style={{ backgroundColor: '#059669' }}></span>
              <span>Tiếng Việt</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendColor} style={{ backgroundColor: '#dc2626' }}></span>
              <span>Tiếng Anh</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendColor} style={{ backgroundColor: '#7c3aed' }}></span>
              <span>Khoa học</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendColor} style={{ backgroundColor: '#ea580c' }}></span>
              <span>Thể dục</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendColor} style={{ backgroundColor: '#0891b2' }}></span>
              <span>Mỹ thuật</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendColor} style={{ backgroundColor: '#be123c' }}></span>
              <span>Ngoại khóa</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendColor} style={{ backgroundColor: '#4338ca' }}></span>
              <span>Ôn tập</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendColor} style={{ backgroundColor: '#16a34a' }}></span>
              <span>Piano</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendColor} style={{ backgroundColor: '#ca8a04' }}></span>
              <span>Võ thuật</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildSchedule;
