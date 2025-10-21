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
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  Grade as GradeIcon,
  Assignment as AssignmentIcon,
  Upload as UploadIcon,
  Save as SaveIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import styles from './PerformanceReviews.module.css';

const PerformanceReviews = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [reviewData, setReviewData] = useState({
    academicGrade: 0,
    behaviorRating: 0,
    participationRating: 0,
    homeworkCompletion: 0,
    notes: '',
    recommendations: '',
    hasHomework: false,
    homeworkDescription: ''
  });

  // Mock data for students
  const students = [
    {
      id: 1,
      name: 'Nguyễn Văn B',
      avatar: 'NB',
      class: 'Toán lớp 3A',
      recentGrades: [8.5, 9.0, 8.0, 9.5],
      averageGrade: 8.75,
      behaviorScore: 4.2,
      lastReview: '2024-01-15'
    },
    {
      id: 2,
      name: 'Trần Thị C',
      avatar: 'TC',
      class: 'Toán lớp 3A',
      recentGrades: [7.5, 8.0, 7.0, 8.5],
      averageGrade: 7.75,
      behaviorScore: 4.5,
      lastReview: '2024-01-10'
    },
    {
      id: 3,
      name: 'Lê Văn D',
      avatar: 'LD',
      class: 'Tiếng Anh lớp 3B',
      recentGrades: [9.0, 9.5, 8.5, 9.0],
      averageGrade: 9.0,
      behaviorScore: 4.8,
      lastReview: '2024-01-12'
    },
    {
      id: 4,
      name: 'Phạm Thị E',
      avatar: 'PE',
      class: 'Khoa học lớp 4A',
      recentGrades: [8.0, 8.5, 7.5, 8.0],
      averageGrade: 8.0,
      behaviorScore: 4.0,
      lastReview: '2024-01-08'
    }
  ];

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setReviewData({
      academicGrade: student.averageGrade,
      behaviorRating: student.behaviorScore,
      participationRating: 4.0,
      homeworkCompletion: 4.0,
      notes: '',
      recommendations: '',
      hasHomework: false,
      homeworkDescription: ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
    setReviewData({
      academicGrade: 0,
      behaviorRating: 0,
      participationRating: 0,
      homeworkCompletion: 0,
      notes: '',
      recommendations: '',
      hasHomework: false,
      homeworkDescription: ''
    });
  };

  const handleInputChange = (field, value) => {
    setReviewData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveReview = () => {
    // Here you would save to backend
    console.log('Saving performance review:', reviewData);
    alert('Đánh giá học sinh đã được lưu thành công!');
    handleCloseDialog();
  };

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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Đánh giá học sinh</h1>
        <p className={styles.subtitle}>
          Đánh giá học lực, hạnh kiểm và gửi phản hồi cho phụ huynh
        </p>
      </div>

      {/* Students Grid */}
      <div className={styles.studentsGrid}>
        {students.map((student) => (
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
                  <StarIcon className={styles.statIcon} />
                  <div className={styles.statContent}>
                    <span className={styles.statValue}>{student.behaviorScore}</span>
                    <span className={styles.statLabel}>Hạnh kiểm</span>
                  </div>
                </div>
                <div className={styles.statItem}>
                  <TrendingUpIcon className={styles.statIcon} />
                  <div className={styles.statContent}>
                    <span className={styles.statValue}>
                      {student.recentGrades[student.recentGrades.length - 1] > student.recentGrades[0] ? '+' : ''}
                      {(student.recentGrades[student.recentGrades.length - 1] - student.recentGrades[0]).toFixed(1)}
                    </span>
                    <span className={styles.statLabel}>Xu hướng</span>
                  </div>
                </div>
              </div>

              <div className={styles.studentActions}>
                <Button 
                  variant="contained" 
                  size="small"
                  onClick={() => handleStudentSelect(student)}
                  startIcon={<AssessmentIcon />}
                >
                  Đánh giá
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => window.location.href = `/teacher/materials/${student.id}`}
                  startIcon={<UploadIcon />}
                >
                  Giao bài tập
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Review Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <div className={styles.dialogHeader}>
            <Typography variant="h6">
              <AssessmentIcon className={styles.dialogIcon} />
              Đánh giá học sinh - {selectedStudent?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedStudent?.class} • Lần đánh giá cuối: {selectedStudent?.lastReview}
            </Typography>
          </div>
        </DialogTitle>
        
        <DialogContent>
          {selectedStudent && (
            <div className={styles.reviewContent}>
              {/* Academic Performance */}
              <div className={styles.reviewSection}>
                <Typography variant="h6" className={styles.sectionTitle}>
                  Học lực
                </Typography>
                <div className={styles.ratingGroup}>
                  <div className={styles.ratingItem}>
                    <Typography variant="body2" className={styles.ratingLabel}>
                      Điểm số học tập
                    </Typography>
                    <TextField
                      type="number"
                      value={reviewData.academicGrade}
                      onChange={(e) => handleInputChange('academicGrade', parseFloat(e.target.value))}
                      inputProps={{ min: 0, max: 10, step: 0.1 }}
                      size="small"
                      sx={{ width: 100 }}
                    />
                  </div>
                  <div className={styles.ratingItem}>
                    <Typography variant="body2" className={styles.ratingLabel}>
                      Mức độ tham gia
                    </Typography>
                    <Rating
                      value={reviewData.participationRating}
                      onChange={(e) => handleInputChange('participationRating', e.target.value)}
                      precision={0.5}
                    />
                  </div>
                  <div className={styles.ratingItem}>
                    <Typography variant="body2" className={styles.ratingLabel}>
                      Hoàn thành bài tập
                    </Typography>
                    <Rating
                      value={reviewData.homeworkCompletion}
                      onChange={(e) => handleInputChange('homeworkCompletion', e.target.value)}
                      precision={0.5}
                    />
                  </div>
                </div>
              </div>

              {/* Behavior */}
              <div className={styles.reviewSection}>
                <Typography variant="h6" className={styles.sectionTitle}>
                  Hạnh kiểm
                </Typography>
                <div className={styles.ratingItem}>
                  <Typography variant="body2" className={styles.ratingLabel}>
                    Đánh giá hành vi
                  </Typography>
                  <Rating
                    value={reviewData.behaviorRating}
                    onChange={(e) => handleInputChange('behaviorRating', e.target.value)}
                    precision={0.5}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className={styles.reviewSection}>
                <Typography variant="h6" className={styles.sectionTitle}>
                  Nhận xét
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={reviewData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Nhận xét về học tập và hành vi của học sinh..."
                  variant="outlined"
                />
              </div>

              {/* Recommendations */}
              <div className={styles.reviewSection}>
                <Typography variant="h6" className={styles.sectionTitle}>
                  Khuyến nghị
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  value={reviewData.recommendations}
                  onChange={(e) => handleInputChange('recommendations', e.target.value)}
                  placeholder="Đề xuất cải thiện cho học sinh..."
                  variant="outlined"
                />
              </div>

              {/* Homework Assignment */}
              <div className={styles.reviewSection}>
                <Typography variant="h6" className={styles.sectionTitle}>
                  Bài tập về nhà
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={reviewData.hasHomework}
                      onChange={(e) => handleInputChange('hasHomework', e.target.checked)}
                    />
                  }
                  label="Giao bài tập về nhà"
                />
                {reviewData.hasHomework && (
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    value={reviewData.homeworkDescription}
                    onChange={(e) => handleInputChange('homeworkDescription', e.target.value)}
                    placeholder="Mô tả bài tập về nhà..."
                    variant="outlined"
                    sx={{ mt: 2 }}
                  />
                )}
              </div>
            </div>
          )}
        </DialogContent>
        
        <Box sx={{ p: 3, backgroundColor: '#f5f5f5', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Hủy
          </Button>
          <Button 
            variant="contained"
            onClick={handleSaveReview}
            startIcon={<SaveIcon />}
          >
            Lưu đánh giá
          </Button>
        </Box>
      </Dialog>
    </div>
  );
};

export default PerformanceReviews;
