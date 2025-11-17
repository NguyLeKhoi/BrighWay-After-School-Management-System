import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Alert,
  Paper,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  Person as PersonIcon,
  Groups as GroupsIcon,
  FamilyRestroom as FamilyIcon,
  PhotoCamera as PhotoCameraIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import DataTable from '../../../components/Common/DataTable';
import Form from '../../../components/Common/Form';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import StaffAccountForm from '../../../components/AccountForms/StaffAccountForm';
import ManagementPageHeader from '../../../components/Management/PageHeader';
import ManagementSearchSection from '../../../components/Management/SearchSection';
import ManagementFormDialog from '../../../components/Management/FormDialog';
import { createUserSchema, updateManagerUserSchema } from '../../../utils/validationSchemas/userSchemas';
import userService from '../../../services/user.service';
import { useApp } from '../../../contexts/AppContext';
import useBaseCRUD from '../../../hooks/useBaseCRUD';
import { createStaffAndParentColumns } from '../../../constants/manager/staff/tableColumns';
import { createManagerUserFormFields } from '../../../constants/manager/staff/formFields';
import { toast } from 'react-toastify';
import styles from './staffAndParentManagement.module.css';

const StaffAndParentManagement = () => {
  const navigate = useNavigate();
  
  // Tab state
  const [activeTab, setActiveTab] = useState(0); // 0 = Staff, 1 = User
  
  // Staff tab CRUD
  const staffTab = useBaseCRUD({
    loadFunction: async (params) => {
      return await userService.getUsersPagedByRole({
        pageIndex: params.page || params.pageIndex || 1,
        pageSize: params.pageSize || params.rowsPerPage || 10,
        Role: 'Staff',
        Keyword: params.Keyword || params.searchTerm || ''
      });
    },
    loadOnMount: false // Don't auto-load, we'll load manually when tab is active
  });
  
  // User tab CRUD
  const userTab = useBaseCRUD({
    loadFunction: async (params) => {
      return await userService.getUsersPagedByRole({
        pageIndex: params.page || params.pageIndex || 1,
        pageSize: params.pageSize || params.rowsPerPage || 10,
        Role: 'User',
        Keyword: params.Keyword || params.searchTerm || ''
      });
    },
    loadOnMount: false // Don't auto-load, we'll load manually when tab is active
  });
  
  // Get current tab data
  const currentTab = activeTab === 0 ? staffTab : userTab;
  
  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 0) {
      staffTab.loadData();
    } else if (activeTab === 1) {
      userTab.loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);
  
  // Common state
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [createMode, setCreateMode] = useState('staff');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Confirm dialog states
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    onConfirm: null
  });
  
  // Global state
  const { showGlobalError } = useApp();
  
  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const columns = useMemo(() => createStaffAndParentColumns(), []);
  const formFields = useMemo(
    () => createManagerUserFormFields(actionLoading),
    [actionLoading]
  );
  
  // Create handler
  const handleCreateUser = () => {
    const mode = activeTab === 0 ? 'staff' : 'parent';
    setCreateMode(mode);
    setIsSubmitting(false);
    
    if (mode === 'parent') {
      // Show mode selection dialog for parent
      setShowParentModeDialog(true);
    } else {
      setOpenCreateDialog(true);
    }
  };

  const handleNavigateToCreateParent = (parentMode) => {
    navigate(`/manager/staffAndParent/create-parent?mode=${parentMode}`);
  };
  
  // Edit handler
  const handleEditUser = async (user) => {
    setActionLoading(true);
    
    try {
      const isUser = user.roles && user.roles.includes('User');
      
      if (isUser) {
        const expandedUser = await userService.getUserById(user.id, true);
        setSelectedUser(expandedUser);
      } else {
        setSelectedUser(user);
      }
      setOpenDialog(true);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi lấy thông tin người dùng';
      setError(errorMessage);
      showGlobalError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };
  
  // Delete handler
  const handleDeleteUser = (user) => {
    const userName = user.name || user.fullName || user.email || 'người dùng này';
    setConfirmDialog({
      open: true,
      title: 'Xác nhận xóa người dùng',
      description: `Bạn có chắc chắn muốn xóa người dùng "${userName}"? Hành động này không thể hoàn tác.`,
      onConfirm: () => performDeleteUser(user.id)
    });
  };
  
  // Perform delete
  const performDeleteUser = async (userId) => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
    setActionLoading(true);
    
    try {
      await userService.deleteUserByManager(userId);
      
      toast.success('Xóa người dùng thành công!');
      
      // Reload current tab
      if (currentTab.loadData) {
        currentTab.loadData(false);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi xóa người dùng';
      setError(errorMessage);
      showGlobalError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };
  
  // Form submit handler
  const handleFormSubmit = async (data) => {
    setActionLoading(true);
    
    try {
      const updateData = {
        fullName: data.name || data.fullName,
        email: data.email,
        isActive: data.isActive
      };
      
      // Add phoneNumber if provided
      if (data.phoneNumber) {
        updateData.phoneNumber = data.phoneNumber;
      }
      
      // Add password if provided
      if (data.password && data.password.trim()) {
        updateData.password = data.password;
      }
      
      await userService.updateUserByManager(selectedUser.id, updateData);
      
      toast.success(`Cập nhật người dùng "${data.name || data.fullName}" thành công!`);
      
      // Reload current tab
      if (currentTab.loadData) {
        currentTab.loadData(false);
      }
      setOpenDialog(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi cập nhật người dùng';
      setError(errorMessage);
      showGlobalError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };
  
  // Staff submit handler
  const handleStaffSubmit = async (data) => {
    try {
      await userService.createStaff(data);
      toast.success('Tạo tài khoản Staff thành công!');
      if (staffTab.loadData) {
        staffTab.loadData(false);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tạo tài khoản';
      setError(errorMessage);
      showGlobalError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };
  
  // Parent creation mode state
  const [parentCreationMode, setParentCreationMode] = useState('ocr'); // 'ocr' or 'manual'
  const [showParentModeDialog, setShowParentModeDialog] = useState(false);

  // Parent submit handler - with CCCD
  const handleParentSubmitWithCCCD = async (data) => {
    try {
      await userService.createParentWithCCCD(data);
      toast.success(`Tạo tài khoản User (Parent) "${data.name}" thành công!`);
      if (userTab.loadData) {
        userTab.loadData(false);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tạo tài khoản User (Parent)';
      setError(errorMessage);
      showGlobalError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  // Parent submit handler - manual
  const handleParentSubmitManual = async (data) => {
    try {
      // If has CCCD data, use with CCCD endpoint, otherwise use regular endpoint
      if (data.identityCardNumber || data.identityCardPublicId) {
        await handleParentSubmitWithCCCD(data);
      } else {
        const parentData = {
          email: data.email,
          password: data.password,
          name: data.name || data.fullName
        };
        await userService.createParent(parentData);
        toast.success(`Tạo tài khoản User (Parent) "${parentData.name}" thành công!`);
        if (userTab.loadData) {
          userTab.loadData(false);
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tạo tài khoản User (Parent)';
      setError(errorMessage);
      showGlobalError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  // Handle parent creation mode selection
  const handleParentModeSelect = (mode) => {
    setParentCreationMode(mode);
    setShowParentModeDialog(false);
  };
  
  return (
    <div className={styles.container}>
      {/* Header */}
      <ManagementPageHeader
        title="Quản lý Staff & User"
        createButtonText={activeTab === 0 ? 'Tạo Nhân Viên' : 'Tạo User (Parent)'}
        onCreateClick={handleCreateUser}
      />

      {/* Error Alert */}
      {(error || currentTab.error) && (
        <Alert 
          severity="error" 
          className={styles.errorAlert} 
          onClose={() => {
            setError(null);
          }}
        >
          {error || currentTab.error}
        </Alert>
      )}

      {/* Tabs */}
      <Paper 
        sx={{ 
          mb: 3,
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}
      >
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '15px',
              fontWeight: 500,
              minHeight: 64,
              padding: '12px 24px',
              color: 'text.secondary',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                color: 'primary.main'
              },
              '&.Mui-selected': {
                color: 'primary.main',
                fontWeight: 600
              }
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              backgroundColor: '#1976d2'
            }
          }}
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <GroupsIcon sx={{ fontSize: 22 }} />
                <Box>
                  <Box component="span" sx={{ display: 'block', fontWeight: 'inherit' }}>
                    Nhân Viên
                  </Box>
                  <Box 
                    component="span" 
                    sx={{ 
                      display: 'block', 
                      fontSize: '11px', 
                      fontWeight: 400,
                      opacity: 0.7,
                      mt: 0.25
                    }}
                  >
                    Staff
                  </Box>
                </Box>
              </Box>
            }
            iconPosition="start"
            sx={{
              '&.Mui-selected': {
                '& .MuiSvgIcon-root': {
                  color: 'primary.main'
                }
              }
            }}
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <FamilyIcon sx={{ fontSize: 22 }} />
                <Box>
                  <Box component="span" sx={{ display: 'block', fontWeight: 'inherit' }}>
                    Người Dùng
                  </Box>
                  <Box 
                    component="span" 
                    sx={{ 
                      display: 'block', 
                      fontSize: '11px', 
                      fontWeight: 400,
                      opacity: 0.7,
                      mt: 0.25
                    }}
                  >
                    User/Parent
                  </Box>
                </Box>
              </Box>
            }
            iconPosition="start"
            sx={{
              '&.Mui-selected': {
                '& .MuiSvgIcon-root': {
                  color: 'primary.main'
                }
              }
            }}
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ mt: 2 }}>
        {/* Staff Tab */}
        {activeTab === 0 && (
          <Box>
            <ManagementSearchSection
              keyword={staffTab.keyword}
              onKeywordChange={staffTab.handleKeywordChange}
              onSearch={staffTab.handleKeywordSearch}
              onClear={staffTab.handleClearSearch}
              placeholder="Tìm kiếm nhân viên theo tên, email..."
            />

            <div className={styles.tableContainer}>
              <DataTable
                data={staffTab.data}
                columns={columns}
                loading={staffTab.isPageLoading}
                page={staffTab.page}
                rowsPerPage={staffTab.rowsPerPage}
                totalCount={staffTab.totalCount}
                onPageChange={staffTab.handlePageChange}
                onRowsPerPageChange={staffTab.handleRowsPerPageChange}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                emptyMessage="Không có nhân viên nào. Hãy tạo tài khoản nhân viên đầu tiên để bắt đầu."
              />
            </div>
          </Box>
        )}

        {/* User Tab */}
        {activeTab === 1 && (
          <Box>
            <ManagementSearchSection
              keyword={userTab.keyword}
              onKeywordChange={userTab.handleKeywordChange}
              onSearch={userTab.handleKeywordSearch}
              onClear={userTab.handleClearSearch}
              placeholder="Tìm kiếm người dùng theo tên, email..."
            />

            <div className={styles.tableContainer}>
              <DataTable
                data={userTab.data}
                columns={columns}
                loading={userTab.isPageLoading}
                page={userTab.page}
                rowsPerPage={userTab.rowsPerPage}
                totalCount={userTab.totalCount}
                onPageChange={userTab.handlePageChange}
                onRowsPerPageChange={userTab.handleRowsPerPageChange}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                emptyMessage="Không có người dùng nào. Hãy tạo tài khoản người dùng đầu tiên để bắt đầu."
              />
            </div>
          </Box>
        )}
      </Box>

      {/* Edit Dialog */}
      <ManagementFormDialog
        open={openDialog}
        onClose={() => !actionLoading && setOpenDialog(false)}
        mode="edit"
        title="Người Dùng"
        icon={PersonIcon}
        loading={actionLoading}
        maxWidth="sm"
      >
        <Form
          schema={updateManagerUserSchema}
          defaultValues={{
            name: selectedUser?.name || selectedUser?.fullName || '',
            email: selectedUser?.email || '',
            password: '',
            isActive: selectedUser?.isActive !== undefined ? selectedUser.isActive : true
          }}
          onSubmit={handleFormSubmit}
          submitText="Cập nhật Thông Tin"
          loading={actionLoading}
          disabled={actionLoading}
          fields={formFields}
        />
      </ManagementFormDialog>

      {/* Confirm Dialog */}
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

      {/* Parent Mode Selection Dialog */}
      <Dialog
        open={showParentModeDialog}
        onClose={() => setShowParentModeDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Chọn phương thức tạo tài khoản Phụ huynh
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Vui lòng chọn một trong hai phương thức sau:
          </Typography>
          <ToggleButtonGroup
            value={parentCreationMode}
            exclusive
            onChange={(e, value) => value && setParentCreationMode(value)}
            fullWidth
            orientation="vertical"
            sx={{ gap: 2 }}
          >
            <ToggleButton
              value="ocr"
              sx={{
                p: 3,
                textAlign: 'left',
                justifyContent: 'flex-start',
                '&.Mui-selected': {
                  backgroundColor: 'primary.50',
                  borderColor: 'primary.main',
                  borderWidth: 2
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <PhotoCameraIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Sử dụng OCR (Chụp CCCD)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tự động trích xuất thông tin từ ảnh CCCD
                  </Typography>
                </Box>
              </Box>
            </ToggleButton>
            <ToggleButton
              value="manual"
              sx={{
                p: 3,
                textAlign: 'left',
                justifyContent: 'flex-start',
                '&.Mui-selected': {
                  backgroundColor: 'primary.50',
                  borderColor: 'primary.main',
                  borderWidth: 2
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <EditIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Nhập thủ công
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Nhập thông tin từng bước bằng form
                  </Typography>
                </Box>
              </Box>
            </ToggleButton>
          </ToggleButtonGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowParentModeDialog(false)}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setShowParentModeDialog(false);
              handleNavigateToCreateParent(parentCreationMode);
            }}
          >
            Tiếp tục
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Account Dialog */}
      <ManagementFormDialog
        open={openCreateDialog}
        onClose={() => {
          if (!isSubmitting) {
            setOpenCreateDialog(false);
            setCreateMode('staff');
            setIsSubmitting(false);
          }
        }}
        mode="create"
        title={createMode === 'staff' ? 'Tài Khoản Nhân Viên' : 'Tài Khoản User (Parent)'}
        icon={createMode === 'staff' ? GroupsIcon : FamilyIcon}
        loading={isSubmitting}
        maxWidth={createMode === 'parent' && parentCreationMode === 'manual' ? 'lg' : 'md'}
      >
        {createMode === 'staff' ? (
          <StaffAccountForm
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
            onStaffSubmit={handleStaffSubmit}
            onSuccess={() => {
              setOpenCreateDialog(false);
              setCreateMode('staff');
            }}
          />
        ) : null}
      </ManagementFormDialog>
    </div>
  );
};

export default StaffAndParentManagement;
