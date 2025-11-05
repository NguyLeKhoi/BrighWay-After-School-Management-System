import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Chip,
  Button,
  Avatar,
  Stack,
  Badge,
  Container,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Person as PersonIcon,
  FamilyRestroom as FamilyIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useApp } from '../../../contexts/AppContext';
import { useLoading } from '../../../hooks/useLoading';
import Loading from '../../../components/Common/Loading';
import EditableField from '../../../components/Common/EditableField';
import ParentForm from '../../../components/AccountForms/ParentForm';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';

const FamilyProfile = () => {
  const [familyData, setFamilyData] = useState(null);
  const [error, setError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [addParentDialogOpen, setAddParentDialogOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    onConfirm: null,
    title: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { showGlobalError, addNotification } = useApp();
  const { isLoading, showLoading, hideLoading } = useLoading();

  // Load family data on component mount
  useEffect(() => {
    loadFamilyData();
  }, []);

  const loadFamilyData = async (showSuccessNotification = false) => {
    showLoading();
    setError(null);
    
    try {
      console.log('🔄 Loading family data...');
      const response = await familyService.getCurrentFamilyForm();
      console.log('✅ Family data loaded:', response);
      setFamilyData(response);
      
      // Only show success notification if explicitly requested (for refresh button)
      if (showSuccessNotification) {
        addNotification({
          message: 'Tải thông tin gia đình thành công!',
          severity: 'success'
        });
      }
      
      // Mark initial load as complete
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    } catch (err) {
      console.error('❌ Error loading family data:', err);
      const errorMessage = err.message || 'Có lỗi xảy ra khi tải thông tin gia đình';
      setError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      hideLoading();
    }
  };

  const handleUpdateField = async (fieldPath, newValue) => {
    if (!familyData) return;
    
    try {
      // Create update data structure
      const updateData = {
        user: { ...familyData.user },
        family: { ...familyData.family },
        parents: [...(familyData.parents || [])]
      };
      
      // Update the specific field
      const pathParts = fieldPath.split('.');
      let current = updateData;
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }
      current[pathParts[pathParts.length - 1]] = newValue;
      
      console.log('🔄 Updating field:', fieldPath, 'to:', newValue);
      console.log('📤 Update data:', updateData);
      
      // Call API to update
      const response = await familyService.updateCurrentFamily(updateData);
      console.log('✅ Update successful:', response);
      
      // Update local state
      setFamilyData(response || updateData);
      
      addNotification({
        message: 'Cập nhật thông tin thành công!',
        severity: 'success'
      });
    } catch (err) {
      console.error('❌ Update error:', err);
      const errorMessage = err.message || 'Có lỗi xảy ra khi cập nhật thông tin';
      showGlobalError(errorMessage);
    }
  };

  const handleUpdateParentField = async (parentIndex, fieldName, newValue) => {
    if (!familyData || !familyData.parents) return;
    
    try {
      // Create update data structure
      const updateData = {
        user: { ...familyData.user },
        family: { ...familyData.family },
        parents: [...familyData.parents]
      };
      
      // Update the specific parent field
      updateData.parents[parentIndex] = {
        ...updateData.parents[parentIndex],
        [fieldName]: newValue
      };
      
      console.log('🔄 Updating parent field:', `parents[${parentIndex}].${fieldName}`, 'to:', newValue);
      console.log('📤 Update data:', updateData);
      
      // Call API to update
      const response = await familyService.updateCurrentFamily(updateData);
      console.log('✅ Update successful:', response);
      
      // Update local state
      setFamilyData(response || updateData);
      
      addNotification({
        message: 'Cập nhật thông tin phụ huynh thành công!',
        severity: 'success'
      });
    } catch (err) {
      console.error('❌ Update error:', err);
      const errorMessage = err.message || 'Có lỗi xảy ra khi cập nhật thông tin phụ huynh';
      showGlobalError(errorMessage);
    }
  };

  const handleAddParent = async (parentData) => {
    setIsSubmitting(true);
    try {
      console.log('🔄 Adding new parent:', parentData);
      
      // Call API to add parent
      const response = await familyService.addParentToFamily(parentData);
      console.log('✅ Add parent successful:', response);
      
      // Reload family data to get updated list
      await loadFamilyData();
      
      // Close dialog
      setAddParentDialogOpen(false);
      
      addNotification({
        message: 'Thêm phụ huynh thành công!',
        severity: 'success'
      });
    } catch (err) {
      console.error('❌ Add parent error:', err);
      const errorMessage = err.message || 'Có lỗi xảy ra khi thêm phụ huynh';
      showGlobalError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteParent = (parentId, parentName) => {
    setConfirmDialog({
      open: true,
      onConfirm: () => performDeleteParent(parentId),
      title: 'Xác nhận xóa phụ huynh',
      description: `Bạn có chắc chắn muốn xóa phụ huynh "${parentName}"? Hành động này không thể hoàn tác.`
    });
  };

  const performDeleteParent = async (parentId) => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
    setIsSubmitting(true);
    
    try {
      console.log('🔄 Deleting parent:', parentId);
      
      // Call API to delete parent
      await familyService.deleteParentFromFamily(parentId);
      console.log('✅ Delete parent successful');
      
      // Reload family data to get updated list
      await loadFamilyData();
      
      addNotification({
        message: 'Xóa phụ huynh thành công!',
        severity: 'success'
      });
    } catch (err) {
      console.error('❌ Delete parent error:', err);
      const errorMessage = err.message || 'Có lỗi xảy ra khi xóa phụ huynh';
      showGlobalError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => loadFamilyData(true)}>
          Thử lại
        </Button>
      </Box>
    );
  }

  if (!familyData) {
  return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="text.secondary">
          Không có dữ liệu gia đình
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ pt: 1, pb: 2 }}>
      {/* Header Section */}
       <Box 
         sx={{ 
           p: 2, 
           mb: 3, 
           color: '#495057'
         }}
       >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 0.5, color: '#212529' }}>
              Hồ Sơ Gia Đình
            </Typography>
            <Typography variant="h6" sx={{ color: '#6c757d', fontWeight: 'normal' }}>
              Quản lý thông tin gia đình và liên hệ
            </Typography>
          </Box>
          <Tooltip title="Làm mới dữ liệu">
            <IconButton 
              onClick={() => loadFamilyData(true)}
              sx={{ 
                color: '#6c757d',
                backgroundColor: '#ffffff',
                border: '1px solid #dee2e6',
                '&:hover': { 
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #adb5bd'
                }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* User Information */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: '100%', borderRadius: 3 }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: '#6c757d', width: 56, height: 56 }}>
                  <PersonIcon fontSize="large" />
                </Avatar>
              }
               title={
                 <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#495057' }}>
                   Thông Tin Tài Khoản
                 </Typography>
               }
               subheader="Thông tin đăng nhập và cá nhân"
              sx={{ pb: 1 }}
            />
            <CardContent sx={{ pt: 0 }}>
              <Stack spacing={3}>
                 <Box>
              <EditableField
                     label="HỌ VÀ TÊN"
                     value={familyData.user?.fullName || ''}
                     onSave={(newValue) => handleUpdateField('user.fullName', newValue)}
                   />
                 </Box>
                
                 <Box>
              <EditableField
                     label="EMAIL"
                     value={familyData.user?.email || ''}
                type="email"
                     onSave={(newValue) => handleUpdateField('user.email', newValue)}
              />
                 </Box>

                 <Box>
                   <EditableField
                     label="MẬT KHẨU"
                     value="••••••••"
                     type="password"
                     onSave={(newValue) => handleUpdateField('user.password', newValue)}
                   />
                 </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Family Information */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: '100%', borderRadius: 3 }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: '#6c757d', width: 56, height: 56 }}>
                  <FamilyIcon fontSize="large" />
                </Avatar>
              }
              title={
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#495057' }}>
                  Thông Tin Gia Đình
                </Typography>
              }
              subheader="Địa chỉ và liên hệ khẩn cấp"
              sx={{ pb: 1 }}
            />
            <CardContent sx={{ pt: 0 }}>
              <Stack spacing={3}>
                 <Box>
                   <EditableField
                     label="ĐỊA CHỈ"
                     value={familyData.family?.address || ''}
                     type="textarea"
                     onSave={(newValue) => handleUpdateField('family.address', newValue)}
                   />
                 </Box>
                
                 <Box>
              <EditableField
                     label="SỐ ĐIỆN THOẠI GIA ĐÌNH"
                     value={familyData.family?.phone || ''}
                type="tel"
                     onSave={(newValue) => handleUpdateField('family.phone', newValue)}
                   />
                 </Box>
                
                 <Box>
                   <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#6c757d', mb: 1 }}>
                     LIÊN HỆ KHẨN CẤP
                   </Typography>
                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <EditableField
                       label="Tên người liên hệ"
                       value={familyData.family?.emergencyContactName || ''}
                       onSave={(newValue) => handleUpdateField('family.emergencyContactName', newValue)}
              />
              <EditableField
                       label="Số điện thoại khẩn cấp"
                       value={familyData.family?.emergencyContactPhone || ''}
                       type="tel"
                       onSave={(newValue) => handleUpdateField('family.emergencyContactPhone', newValue)}
                     />
                   </Box>
                 </Box>
                
                 <Box>
              <EditableField
                     label="GHI CHÚ"
                     value={familyData.family?.note || ''}
                type="textarea"
                     onSave={(newValue) => handleUpdateField('family.note', newValue)}
                   />
                 </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Parents Information */}
        <Grid item xs={12}>
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardHeader
              title={
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#495057' }}>
                  Danh Sách Phụ Huynh
                </Typography>
              }
              subheader={`${familyData.parents?.length || 0} phụ huynh đã đăng ký`}
              action={
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setAddParentDialogOpen(true)}
                  sx={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: '1px solid #007bff',
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 'medium',
                    px: 3,
                    py: 1,
                    '&:hover': {
                      backgroundColor: '#0056b3',
                      border: '1px solid #0056b3',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 8px rgba(0,123,255,0.3)'
                    }
                  }}
                >
                  Thêm Phụ Huynh
                </Button>
              }
              sx={{ pb: 1 }}
            />
            <CardContent sx={{ pt: 0 }}>
              {familyData.parents && familyData.parents.length > 0 ? (
                <Grid container spacing={3}>
                  {familyData.parents.map((parent, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Paper 
                        elevation={3}
                        sx={{ 
                          p: 3, 
                          borderRadius: 2,
                          backgroundColor: '#ffffff',
                          border: '1px solid #dee2e6',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            border: '1px solid #adb5bd'
                          }
                        }}
                      >
                        <Stack spacing={2}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Avatar sx={{ bgcolor: '#6c757d', width: 48, height: 48 }}>
                              <PersonIcon />
                            </Avatar>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip 
                                label={
                                  parent.relationshipToStudent === 'father' ? 'Bố' : 
                                  parent.relationshipToStudent === 'mother' ? 'Mẹ' : 
                                  parent.relationshipToStudent === 'guardian' ? 'Người giám hộ' : 'Khác'
                                }
                                size="small"
                                variant="filled"
                                sx={{ 
                                  fontWeight: 'bold',
                                  fontSize: '12px',
                                  color: 'white',
                                  backgroundColor: parent.relationshipToStudent === 'father' ? '#1976d2' : 
                                                 parent.relationshipToStudent === 'mother' ? '#e91e63' : 
                                                 parent.relationshipToStudent === 'guardian' ? '#4caf50' : '#6c757d',
                                  border: '2px solid white',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                  '&:hover': {
                                    transform: 'scale(1.05)',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                                  }
                                }}
                              />
                              <Tooltip title="Xóa phụ huynh">
                                <IconButton
                                  onClick={() => handleDeleteParent(parent.id, parent.parentName)}
                                  size="small"
                                  sx={{
                                    color: '#dc3545',
                                    '&:hover': {
                                      backgroundColor: '#f8d7da'
                                    }
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </Box>
                          
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#495057', mb: 1 }}>
                              {parent.parentName}
                            </Typography>
                          </Box>
                          
                           <Stack spacing={2}>
              <EditableField
                label="Email"
                               value={parent.email || ''}
                type="email"
                               onSave={(newValue) => handleUpdateParentField(index, 'email', newValue)}
              />

              <EditableField
                label="Số điện thoại"
                               value={parent.phone || ''}
                type="tel"
                               onSave={(newValue) => handleUpdateParentField(index, 'phone', newValue)}
                             />
                             
              <EditableField
                label="Địa chỉ"
                               value={parent.address || ''}
                type="textarea"
                               onSave={(newValue) => handleUpdateParentField(index, 'address', newValue)}
              />

              <EditableField
                               label="Ghi chú"
                               value={parent.note || ''}
                               type="textarea"
                               onSave={(newValue) => handleUpdateParentField(index, 'note', newValue)}
                             />
                           </Stack>
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Paper 
                  elevation={1}
                  sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    backgroundColor: '#f8f9fa',
                    borderRadius: 3,
                    border: '2px dashed #dee2e6'
                  }}
                >
                  <FamilyIcon sx={{ fontSize: 64, color: '#adb5bd', mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 1, color: '#6c757d' }}>
                    Chưa có thông tin phụ huynh
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6c757d' }}>
                    Hãy liên hệ với nhà trường để cập nhật thông tin phụ huynh
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Parent Dialog */}
      <Dialog 
        open={addParentDialogOpen} 
        onClose={() => setAddParentDialogOpen(false)}
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
            Thêm Phụ Huynh Mới
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <ParentForm 
            onParentSubmit={handleAddParent}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText="Xóa"
        cancelText="Hủy"
        confirmColor="error"
      />
    </Container>
  );
};

export default FamilyProfile;