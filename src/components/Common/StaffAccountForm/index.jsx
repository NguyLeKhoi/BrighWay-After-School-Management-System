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
  IconButton
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  AssignmentInd as RoleIcon
} from '@mui/icons-material';
import Form from '../Form';
import { createUserSchema } from '../../../utils/validationSchemas/userSchemas';

const StaffAccountForm = ({ 
  isSubmitting, 
  onStaffSubmit 
}) => {
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    userData: null
  });

  const roleOptions = [
    { value: 0, label: 'Staff' },
    { value: 1, label: 'Teacher' }
  ];

  const handleFormSubmit = (data) => {
    setConfirmDialog({
      open: true,
      userData: data
    });
  };

  const handleConfirmCreate = () => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
    onStaffSubmit(confirmDialog.userData);
  };

  const handleCancelCreate = () => {
    setConfirmDialog({
      open: false,
      userData: null
    });
  };

  return (
    <Box>
      <Form
        schema={createUserSchema}
        onSubmit={handleFormSubmit}
        submitText="Tạo Tài Khoản"
        loading={isSubmitting}
        defaultValues={{ role: 0 }}
        fields={[
          { 
            name: 'fullName', 
            label: 'Họ và Tên', 
            type: 'text', 
            required: true, 
            placeholder: 'Ví dụ: Nguyễn Văn A',
            disabled: isSubmitting,
            gridSize: 6
          },
          { 
            name: 'email', 
            label: 'Email', 
            type: 'email', 
            required: true, 
            placeholder: 'Ví dụ: email@example.com',
            disabled: isSubmitting,
            gridSize: 6
          },
          { 
            name: 'phoneNumber', 
            label: 'Số Điện Thoại', 
            type: 'text', 
            required: true, 
            placeholder: 'Ví dụ: 0901234567',
            disabled: isSubmitting,
            gridSize: 6
          },
          { 
            name: 'password', 
            label: 'Mật Khẩu', 
            type: 'password', 
            required: true, 
            placeholder: 'Nhập mật khẩu cho người dùng',
            disabled: isSubmitting,
            gridSize: 6
          },
              // Role field hidden - always Staff (0 in create API mapping)
              { 
                name: 'role', 
                type: 'hidden'
              }
        ]}
      />

      {/* Confirmation Dialog */}
      <Dialog 
        open={confirmDialog.open} 
        onClose={handleCancelCreate} 
        maxWidth="md" 
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
          <PersonIcon sx={{ color: 'white' }} />
          <Typography variant="h6" component="span" sx={{ color: 'white' }}>
            Xác nhận Tạo Tài Khoản Staff
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Vui lòng kiểm tra lại thông tin trước khi tạo tài khoản:</strong>
            </Typography>
          </Alert>
          
          {confirmDialog.userData && (
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Thông tin tài khoản Staff
              </Typography>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Họ và Tên:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {confirmDialog.userData.fullName}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {confirmDialog.userData.email}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Số Điện Thoại:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {confirmDialog.userData.phoneNumber}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Vai Trò:
                  </Typography>
                  <Chip 
                    label="Staff"
                    color="info" 
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
                  {'•'.repeat(confirmDialog.userData.password?.length || 0)}
                </Typography>
              </div>
            </Paper>
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
            startIcon={isSubmitting ? null : <PersonIcon />}
          >
            {isSubmitting ? 'Đang tạo...' : 'Xác nhận tạo tài khoản'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffAccountForm;
