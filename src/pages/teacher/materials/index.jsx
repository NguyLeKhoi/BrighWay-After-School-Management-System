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
  ListItemIcon,
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
  Tab,
  FormControlLabel,
  Switch,
  LinearProgress
} from '@mui/material';
import {
  Upload as UploadIcon,
  Description as DescriptionIcon,
  VideoLibrary as VideoIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Assignment as AssignmentIcon,
  Folder as FolderIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import styles from './Materials.module.css';

const TeacherMaterials = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Mock data for materials
  const materials = [
    {
      id: 1,
      name: 'Bài tập Toán lớp 3 - Tuần 1',
      type: 'assignment',
      class: 'Toán lớp 3A',
      subject: 'Toán học',
      fileType: 'pdf',
      fileSize: '2.5 MB',
      uploadDate: '2024-01-15',
      downloadCount: 25,
      description: 'Bài tập về phép cộng và trừ trong phạm vi 100',
      status: 'published',
      dueDate: '2024-01-22'
    },
    {
      id: 2,
      name: 'Video bài giảng Tiếng Anh - Unit 1',
      type: 'video',
      class: 'Tiếng Anh lớp 3B',
      subject: 'Tiếng Anh',
      fileType: 'mp4',
      fileSize: '45.2 MB',
      uploadDate: '2024-01-14',
      downloadCount: 18,
      description: 'Video bài giảng về từ vựng gia đình',
      status: 'published',
      duration: '15:30'
    },
    {
      id: 3,
      name: 'Tài liệu Khoa học - Chương 1',
      type: 'document',
      class: 'Khoa học lớp 4A',
      subject: 'Khoa học',
      fileType: 'pdf',
      fileSize: '8.1 MB',
      uploadDate: '2024-01-13',
      downloadCount: 32,
      description: 'Tài liệu về các hiện tượng tự nhiên',
      status: 'published'
    },
    {
      id: 4,
      name: 'Hình ảnh minh họa Toán học',
      type: 'image',
      class: 'Toán lớp 3A',
      subject: 'Toán học',
      fileType: 'jpg',
      fileSize: '1.2 MB',
      uploadDate: '2024-01-12',
      downloadCount: 15,
      description: 'Hình ảnh minh họa các phép tính',
      status: 'draft'
    }
  ];

  const classes = [
    { value: 'all', label: 'Tất cả lớp' },
    { value: 'Toán lớp 3A', label: 'Toán lớp 3A' },
    { value: 'Tiếng Anh lớp 3B', label: 'Tiếng Anh lớp 3B' },
    { value: 'Khoa học lớp 4A', label: 'Khoa học lớp 4A' }
  ];

  const materialTypes = [
    { value: 'all', label: 'Tất cả loại' },
    { value: 'assignment', label: 'Bài tập' },
    { value: 'video', label: 'Video' },
    { value: 'document', label: 'Tài liệu' },
    { value: 'image', label: 'Hình ảnh' }
  ];

  const handleMaterialSelect = (material) => {
    setSelectedMaterial(material);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMaterial(null);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Simulate upload progress
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || material.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf': return <PdfIcon />;
      case 'mp4': case 'avi': case 'mov': return <VideoIcon />;
      case 'jpg': case 'jpeg': case 'png': case 'gif': return <ImageIcon />;
      case 'doc': case 'docx': return <DescriptionIcon />;
      default: return <DescriptionIcon />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'assignment': return 'primary';
      case 'video': return 'secondary';
      case 'document': return 'success';
      case 'image': return 'info';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'published': return 'Đã xuất bản';
      case 'draft': return 'Bản nháp';
      case 'archived': return 'Đã lưu trữ';
      default: return 'Chưa xác định';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <UploadIcon className={styles.titleIcon} />
          Tài liệu học tập
        </h1>
        <p className={styles.subtitle}>
          Quản lý và chia sẻ tài liệu học tập với học sinh
        </p>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.searchControls}>
          <TextField
            placeholder="Tìm kiếm tài liệu..."
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
          <input
            type="file"
            id="file-upload"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.mp4,.avi,.mov,.jpg,.jpeg,.png,.gif"
          />
          <label htmlFor="file-upload">
            <Button 
              variant="contained" 
              component="span"
              startIcon={<UploadIcon />}
            >
              Upload tài liệu
            </Button>
          </label>
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />}
          >
            Tạo bài tập
          </Button>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <Card className={styles.progressCard}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Đang upload tài liệu...
            </Typography>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {uploadProgress}%
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Materials Grid */}
      <div className={styles.materialsGrid}>
        {filteredMaterials.map((material) => (
          <Card key={material.id} className={styles.materialCard}>
            <CardContent>
              <div className={styles.materialHeader}>
                <div className={styles.materialInfo}>
                  <div className={styles.fileIcon}>
                    {getFileIcon(material.fileType)}
                  </div>
                  <div className={styles.materialDetails}>
                    <Typography variant="h6" component="h3" className={styles.materialName}>
                      {material.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" className={styles.materialClass}>
                      {material.class} • {material.subject}
                    </Typography>
                  </div>
                </div>
                <div className={styles.materialStatus}>
                  <Chip 
                    label={getStatusText(material.status)}
                    color={getStatusColor(material.status)}
                    size="small"
                  />
                </div>
              </div>

              <div className={styles.materialContent}>
                <Typography variant="body2" className={styles.materialDescription}>
                  {material.description}
                </Typography>
                
                <div className={styles.materialStats}>
                  <div className={styles.statItem}>
                    <Typography variant="body2" color="text.secondary">
                      Kích thước: {material.fileSize}
                    </Typography>
                  </div>
                  <div className={styles.statItem}>
                    <Typography variant="body2" color="text.secondary">
                      Tải xuống: {material.downloadCount} lần
                    </Typography>
                  </div>
                  <div className={styles.statItem}>
                    <Typography variant="body2" color="text.secondary">
                      Upload: {material.uploadDate}
                    </Typography>
                  </div>
                  {material.dueDate && (
                    <div className={styles.statItem}>
                      <Typography variant="body2" color="text.secondary">
                        Hạn nộp: {material.dueDate}
                      </Typography>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.materialActions}>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => handleMaterialSelect(material)}
                  startIcon={<VisibilityIcon />}
                >
                  Xem
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={<DownloadIcon />}
                >
                  Tải xuống
                </Button>
                <Button 
                  variant="contained" 
                  size="small"
                  startIcon={<ShareIcon />}
                >
                  Chia sẻ
                </Button>
                <IconButton size="small">
                  <EditIcon />
                </IconButton>
                <IconButton size="small" color="error">
                  <DeleteIcon />
                </IconButton>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Material Details Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <div className={styles.dialogHeader}>
            <Typography variant="h6">
              <DescriptionIcon className={styles.dialogIcon} />
              {selectedMaterial?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedMaterial?.class} • {selectedMaterial?.subject}
            </Typography>
          </div>
        </DialogTitle>
        
        <DialogContent>
          {selectedMaterial && (
            <div className={styles.materialDetails}>
              <div className={styles.detailsSection}>
                <Typography variant="h6" className={styles.sectionTitle}>
                  Thông tin tài liệu
                </Typography>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <Typography variant="body2" className={styles.detailLabel}>
                      Loại tài liệu
                    </Typography>
                    <Chip 
                      label={materialTypes.find(t => t.value === selectedMaterial.type)?.label}
                      color={getTypeColor(selectedMaterial.type)}
                      size="small"
                    />
                  </div>
                  <div className={styles.detailItem}>
                    <Typography variant="body2" className={styles.detailLabel}>
                      Kích thước file
                    </Typography>
                    <Typography variant="body1">
                      {selectedMaterial.fileSize}
                    </Typography>
                  </div>
                  <div className={styles.detailItem}>
                    <Typography variant="body2" className={styles.detailLabel}>
                      Ngày upload
                    </Typography>
                    <Typography variant="body1">
                      {selectedMaterial.uploadDate}
                    </Typography>
                  </div>
                  <div className={styles.detailItem}>
                    <Typography variant="body2" className={styles.detailLabel}>
                      Số lần tải xuống
                    </Typography>
                    <Typography variant="body1">
                      {selectedMaterial.downloadCount}
                    </Typography>
                  </div>
                </div>
              </div>

              <div className={styles.detailsSection}>
                <Typography variant="h6" className={styles.sectionTitle}>
                  Mô tả
                </Typography>
                <Typography variant="body1" className={styles.description}>
                  {selectedMaterial.description}
                </Typography>
              </div>

              {selectedMaterial.dueDate && (
                <div className={styles.detailsSection}>
                  <Typography variant="h6" className={styles.sectionTitle}>
                    Thông tin bài tập
                  </Typography>
                  <div className={styles.detailItem}>
                    <Typography variant="body2" className={styles.detailLabel}>
                      Hạn nộp bài
                    </Typography>
                    <Typography variant="body1">
                      {selectedMaterial.dueDate}
                    </Typography>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Đóng
          </Button>
          <Button 
            variant="outlined"
            startIcon={<DownloadIcon />}
          >
            Tải xuống
          </Button>
          <Button 
            variant="contained"
            startIcon={<ShareIcon />}
          >
            Chia sẻ với lớp
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TeacherMaterials;
