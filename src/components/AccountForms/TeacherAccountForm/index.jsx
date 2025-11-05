import React, { useState } from 'react';
import {
  Box,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Paper,
  Alert,
  Chip,
  Divider
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  AssignmentInd as RoleIcon,
  Work as WorkIcon,
  Star as StarIcon,
  School as EducationIcon,
  Description as BioIcon
} from '@mui/icons-material';
import Form from '../../Common/Form';
import { createTeacherAccountSchema } from '../../../utils/validationSchemas/teacherSchemas';

const TeacherAccountForm = ({ 
  isSubmitting, 
  onTeacherSubmit 
}) => {
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    teacherData: null
  });

  const handleFormSubmit = (data) => {
    setConfirmDialog({
      open: true,
      teacherData: data
    });
  };

  const handleConfirmCreate = () => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
    onTeacherSubmit(confirmDialog.teacherData);
  };

  const handleCancelCreate = () => {
    setConfirmDialog({
      open: false,
      teacherData: null
    });
  };

  return (
    <Box>
      <Form
        schema={createTeacherAccountSchema}
        onSubmit={handleFormSubmit}
        submitText="Tạo Tài Khoản Giáo Viên"
        loading={isSubmitting}
        fields={[
          // User Information Section
          {
            name: 'user.fullName',
            label: 'Họ và Tên',
            type: 'text',
            required: true,
            placeholder: 'Ví dụ: Nguyễn Văn A',
            fullWidth: true,
            disabled: isSubmitting,
            gridSize: 6
          },
          {
            name: 'user.email',
            label: 'Email',
            type: 'email',
            required: true,
            placeholder: 'Ví dụ: email@example.com',
            fullWidth: true,
            disabled: isSubmitting,
            gridSize: 6
          },
          {
            name: 'user.phoneNumber',
            label: 'Số Điện Thoại',
            type: 'text',
            required: true,
            placeholder: 'Ví dụ: 0901234567',
            fullWidth: true,
            disabled: isSubmitting,
            gridSize: 6
          },
          {
            name: 'user.password',
            label: 'Mật Khẩu',
            type: 'password',
            required: true,
            placeholder: 'Nhập mật khẩu cho giáo viên',
            fullWidth: true,
            disabled: isSubmitting,
            gridSize: 6
          },
          
          // Profile Information Section
          {
            name: 'profile.teacherName',
            label: 'Tên Giáo Viên',
            type: 'text',
            required: true,
            placeholder: 'Tên gọi của giáo viên (có thể khác tên thật)',
            fullWidth: true,
            disabled: isSubmitting,
            gridSize: 6
          },
          {
            name: 'profile.specialization',
            label: 'Chuyên Môn',
            type: 'text',
            required: true,
            placeholder: 'Ví dụ: Toán học, Tiếng Anh, Khoa học',
            fullWidth: true,
            disabled: isSubmitting,
            gridSize: 6
          },
          {
            name: 'profile.experienceYears',
            label: 'Số Năm Kinh Nghiệm',
            type: 'number',
            required: true,
            placeholder: 'Ví dụ: 5',
            fullWidth: true,
            disabled: isSubmitting,
            gridSize: 6
          },
          {
            name: 'profile.qualifications',
            label: 'Bằng Cấp',
            type: 'text',
            required: true,
            placeholder: 'Ví dụ: Cử nhân Sư phạm Toán học',
            fullWidth: true,
            disabled: isSubmitting,
            gridSize: 6
          },
          {
            name: 'profile.bio',
            label: 'Tiểu Sử',
            type: 'textarea',
            required: true,
            placeholder: 'Mô tả ngắn gọn về kinh nghiệm và phương pháp giảng dạy...',
            fullWidth: true,
            rows: 4,
            disabled: isSubmitting,
            gridSize: 12
          }
        ]}
      />

      {/* Confirmation Dialog */}
      <Dialog 
        open={confirmDialog.open} 
        onClose={handleCancelCreate} 
        maxWidth="lg" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '8px',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: '#1976d2',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            padding: '16px 24px'
          }}
        >
          <SchoolIcon sx={{ color: 'white' }} />
          <Typography variant="h6" component="span" sx={{ color: 'white' }}>
            Xác nhận Tạo Tài Khoản Giáo Viên
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Vui lòng kiểm tra lại thông tin trước khi tạo tài khoản:</strong>
            </Typography>
          </Alert>
          
          {confirmDialog.teacherData && (
            <Box>
              {/* User Information */}
              <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Thông tin tài khoản
                </Typography>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Họ và Tên:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {confirmDialog.teacherData.user?.fullName}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Email:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {confirmDialog.teacherData.user?.email}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Số Điện Thoại:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {confirmDialog.teacherData.user?.phoneNumber}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Vai Trò:
                    </Typography>
                    <Chip 
                      label="Teacher"
                      color="success" 
                      size="small"
                      variant="outlined"
                      icon={<RoleIcon fontSize="small" />}
                    />
                  </Box>
                </div>
                
                <div style={{ marginTop: '16px' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Mật Khẩu:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {'•'.repeat(confirmDialog.teacherData.user?.password?.length || 0)}
                  </Typography>
                </div>
              </Paper>

              {/* Profile Information */}
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Thông tin giáo viên
                </Typography>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tên Giáo Viên:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {confirmDialog.teacherData.profile?.teacherName}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Chuyên Môn:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {confirmDialog.teacherData.profile?.specialization}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Kinh Nghiệm:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {confirmDialog.teacherData.profile?.experienceYears} năm
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Bằng Cấp:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {confirmDialog.teacherData.profile?.qualifications}
                    </Typography>
                  </Box>
                </div>
                
                <div style={{ marginTop: '16px' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tiểu Sử:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {confirmDialog.teacherData.profile?.bio}
                  </Typography>
                </div>
              </Paper>
            </Box>
          )}
          
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCancelCreate}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleConfirmCreate}
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            startIcon={isSubmitting ? null : <SchoolIcon />}
          >
            {isSubmitting ? 'Đang tạo...' : 'Xác nhận tạo tài khoản'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeacherAccountForm;
