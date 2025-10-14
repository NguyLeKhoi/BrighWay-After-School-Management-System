import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Tabs,
  Tab
} from '@mui/material';
import {
  People as PeopleIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Grade as GradeIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import styles from './StudentRoster.module.css';

const StudentRoster = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Mock data for students
  const students = [
    {
      id: 1,
      name: 'Nguyễn Văn B',
      avatar: 'NB',
      class: 'Toán lớp 3A',
      grade: 'Lớp 3',
      parentName: 'Nguyễn Văn A',
      parentPhone: '0123456789',
      parentEmail: 'nguyenvana@email.com',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      nfcId: 'NFC001',
      averageGrade: 8.5,
      attendance: 95,
      behaviorScore: 4.2,
      lastAttendance: '2024-01-15',
      status: 'active',
      notes: 'Học sinh chăm chỉ, có tiến bộ tốt'
    },
    {
      id: 2,
      name: 'Trần Thị C',
      avatar: 'TC',
      class: 'Toán lớp 3A',
      grade: 'Lớp 3',
      parentName: 'Trần Thị D',
      parentPhone: '0987654321',
      parentEmail: 'tranthid@email.com',
      address: '456 Đường XYZ, Quận 2, TP.HCM',
      nfcId: 'NFC002',
      averageGrade: 7.8,
      attendance: 88,
      behaviorScore: 4.5,
      lastAttendance: '2024-01-14',
      status: 'active',
      notes: 'Cần hỗ trợ thêm về môn Toán'
    },
    {
      id: 3,
      name: 'Lê Văn D',
      avatar: 'LD',
      class: 'Tiếng Anh lớp 3B',
      grade: 'Lớp 3',
      parentName: 'Lê Thị E',
      parentPhone: '0369258147',
      parentEmail: 'lethie@email.com',
      address: '789 Đường DEF, Quận 3, TP.HCM',
      nfcId: 'NFC003',
      averageGrade: 9.2,
      attendance: 98,
      behaviorScore: 4.8,
      lastAttendance: '2024-01-15',
      status: 'active',
      notes: 'Học sinh xuất sắc, có khả năng lãnh đạo'
    },
    {
      id: 4,
      name: 'Phạm Thị E',
      avatar: 'PE',
      class: 'Khoa học lớp 4A',
      grade: 'Lớp 4',
      parentName: 'Phạm Văn F',
      parentPhone: '0741852963',
      parentEmail: 'phamvanf@email.com',
      address: '321 Đường GHI, Quận 4, TP.HCM',
      nfcId: 'NFC004',
      averageGrade: 8.0,
      attendance: 92,
      behaviorScore: 4.0,
      lastAttendance: '2024-01-13',
      status: 'active',
      notes: 'Cần cải thiện về tính kỷ luật'
    }
  ];

  const classes = [
    { value: 'all', label: 'Tất cả lớp' },
    { value: 'Toán lớp 3A', label: 'Toán lớp 3A' },
    { value: 'Tiếng Anh lớp 3B', label: 'Tiếng Anh lớp 3B' },
    { value: 'Khoa học lớp 4A', label: 'Khoa học lớp 4A' }
  ];

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const getGradeColor = (grade) => {
    if (grade >= 9) return 'success';
    if (grade >= 8) return 'primary';
    if (grade >= 7) return 'warning';
    return 'error';
  };

  const getGradeText = (grade) => {
    if (grade >= 9) return 'Xuất sắc';
    if (grade >= 8) return 'Giỏi';
    if (grade >= 7) return 'Khá';
    if (grade >= 5) return 'Trung bình';
    return 'Yếu';
  };

  const getAttendanceColor = (attendance) => {
    if (attendance >= 95) return 'success';
    if (attendance >= 85) return 'primary';
    if (attendance >= 75) return 'warning';
    return 'error';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <PeopleIcon className={styles.titleIcon} />
          Danh sách học sinh
        </h1>
        <p className={styles.subtitle}>
          Quản lý thông tin học sinh và liên hệ phụ huynh
        </p>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.searchControls}>
          <TextField
            placeholder="Tìm kiếm học sinh hoặc phụ huynh..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Lọc theo lớp</InputLabel>
            <Select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              label="Lọc theo lớp"
            >
              {classes.map((cls) => (
                <MenuItem key={cls.value} value={cls.value}>
                  {cls.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div className={styles.actionButtons}>
          <Button 
            variant="outlined" 
            startIcon={<FilterIcon />}
          >
            Bộ lọc
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <CardContent>
            <div className={styles.statHeader}>
              <Typography variant="h6" className={styles.statValue}>
                {filteredStudents.length}
              </Typography>
              <PeopleIcon className={styles.statIcon} />
            </div>
            <Typography variant="body2" color="text.secondary">
              Tổng số học sinh
            </Typography>
          </CardContent>
        </Card>
        <Card className={styles.statCard}>
          <CardContent>
            <div className={styles.statHeader}>
              <Typography variant="h6" className={styles.statValue}>
                {filteredStudents.filter(s => s.averageGrade >= 8).length}
              </Typography>
              <GradeIcon className={styles.statIcon} />
            </div>
            <Typography variant="body2" color="text.secondary">
              Học sinh giỏi
            </Typography>
          </CardContent>
        </Card>
        <Card className={styles.statCard}>
          <CardContent>
            <div className={styles.statHeader}>
              <Typography variant="h6" className={styles.statValue}>
                {filteredStudents.filter(s => s.attendance >= 95).length}
              </Typography>
              <AssignmentIcon className={styles.statIcon} />
            </div>
            <Typography variant="body2" color="text.secondary">
              Đi học đều
            </Typography>
          </CardContent>
        </Card>
        <Card className={styles.statCard}>
          <CardContent>
            <div className={styles.statHeader}>
              <Typography variant="h6" className={styles.statValue}>
                {filteredStudents.filter(s => s.behaviorScore >= 4.5).length}
              </Typography>
              <StarIcon className={styles.statIcon} />
            </div>
            <Typography variant="body2" color="text.secondary">
              Hạnh kiểm tốt
            </Typography>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      <div className={styles.studentsGrid}>
        {filteredStudents.map((student) => (
          <Card key={student.id} className={styles.studentCard}>
            <CardContent>
              <div className={styles.studentHeader}>
                <div className={styles.studentInfo}>
                  <Avatar className={styles.studentAvatar}>
                    {student.avatar}
                  </Avatar>
                  <div className={styles.studentDetails}>
                    <Typography variant="h6" component="h3" className={styles.studentName}>
                      {student.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" className={styles.studentClass}>
                      {student.class}
                    </Typography>
                  </div>
                </div>
                <Chip 
                  label={getGradeText(student.averageGrade)}
                  color={getGradeColor(student.averageGrade)}
                  size="small"
                />
              </div>

              <div className={styles.studentStats}>
                <div className={styles.statItem}>
                  <GradeIcon className={styles.statIcon} />
                  <div className={styles.statContent}>
                    <span className={styles.statValue}>{student.averageGrade}</span>
                    <span className={styles.statLabel}>Điểm TB</span>
                  </div>
                </div>
                <div className={styles.statItem}>
                  <AssignmentIcon className={styles.statIcon} />
                  <div className={styles.statContent}>
                    <span className={styles.statValue}>{student.attendance}%</span>
                    <span className={styles.statLabel}>Đi học</span>
                  </div>
                </div>
                <div className={styles.statItem}>
                  <StarIcon className={styles.statIcon} />
                  <div className={styles.statContent}>
                    <span className={styles.statValue}>{student.behaviorScore}</span>
                    <span className={styles.statLabel}>Hạnh kiểm</span>
                  </div>
                </div>
              </div>

              <div className={styles.studentActions}>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => handleStudentSelect(student)}
                  startIcon={<PeopleIcon />}
                >
                  Chi tiết
                </Button>
                <Button 
                  variant="contained" 
                  size="small"
                  onClick={() => window.location.href = `/teacher/performance/${student.id}`}
                  startIcon={<AssessmentIcon />}
                >
                  Đánh giá
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Student Details Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <div className={styles.dialogHeader}>
            <Typography variant="h6">
              <PeopleIcon className={styles.dialogIcon} />
              Thông tin học sinh - {selectedStudent?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedStudent?.class} • NFC ID: {selectedStudent?.nfcId}
            </Typography>
          </div>
        </DialogTitle>
        
        <DialogContent>
          {selectedStudent && (
            <div className={styles.studentDetails}>
              <div className={styles.detailsSection}>
                <Typography variant="h6" className={styles.sectionTitle}>
                  Thông tin cá nhân
                </Typography>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <SchoolIcon className={styles.detailIcon} />
                    <div className={styles.detailContent}>
                      <Typography variant="body2" className={styles.detailLabel}>
                        Lớp học
                      </Typography>
                      <Typography variant="body1">
                        {selectedStudent.class}
                      </Typography>
                    </div>
                  </div>
                  <div className={styles.detailItem}>
                    <LocationIcon className={styles.detailIcon} />
                    <div className={styles.detailContent}>
                      <Typography variant="body2" className={styles.detailLabel}>
                        Địa chỉ
                      </Typography>
                      <Typography variant="body1">
                        {selectedStudent.address}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.detailsSection}>
                <Typography variant="h6" className={styles.sectionTitle}>
                  Thông tin phụ huynh
                </Typography>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <PeopleIcon className={styles.detailIcon} />
                    <div className={styles.detailContent}>
                      <Typography variant="body2" className={styles.detailLabel}>
                        Tên phụ huynh
                      </Typography>
                      <Typography variant="body1">
                        {selectedStudent.parentName}
                      </Typography>
                    </div>
                  </div>
                  <div className={styles.detailItem}>
                    <PhoneIcon className={styles.detailIcon} />
                    <div className={styles.detailContent}>
                      <Typography variant="body2" className={styles.detailLabel}>
                        Số điện thoại
                      </Typography>
                      <Typography variant="body1">
                        {selectedStudent.parentPhone}
                      </Typography>
                    </div>
                  </div>
                  <div className={styles.detailItem}>
                    <EmailIcon className={styles.detailIcon} />
                    <div className={styles.detailContent}>
                      <Typography variant="body2" className={styles.detailLabel}>
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {selectedStudent.parentEmail}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.detailsSection}>
                <Typography variant="h6" className={styles.sectionTitle}>
                  Nhận xét
                </Typography>
                <Typography variant="body1" className={styles.notes}>
                  {selectedStudent.notes}
                </Typography>
              </div>
            </div>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Đóng
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              handleCloseDialog();
              window.location.href = `/teacher/performance/${selectedStudent?.id}`;
            }}
          >
            Đánh giá học sinh
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default StudentRoster;
