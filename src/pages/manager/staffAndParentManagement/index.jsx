import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import {
  Person as PersonIcon,
  Groups as GroupsIcon,
  FamilyRestroom as FamilyIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import DataTable from '../../../components/Common/DataTable';
import Form from '../../../components/Common/Form';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import StaffAccountForm from '../../../components/AccountForms/StaffAccountForm';
import ManagerPageHeader from '../../../components/Manager/ManagerPageHeader';
import ManagerSearchSection from '../../../components/Manager/ManagerSearchSection';
import ManagerFormDialog from '../../../components/Manager/ManagerFormDialog';
import { createUserSchema, updateManagerUserSchema } from '../../../utils/validationSchemas/userSchemas';
import userService from '../../../services/user.service';
import { useApp } from '../../../contexts/AppContext';
import useBaseCRUD from '../../../hooks/useBaseCRUD';
import { toast } from 'react-toastify';
import styles from './staffAndParentManagement.module.css';

const StaffAndParentManagement = () => {
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
  
  // Define table columns
  const columns = [
    {
      key: 'name',
      header: 'Họ và Tên',
      render: (value, item) => (
        <Box display="flex" alignItems="center" gap={1}>
          <PersonIcon fontSize="small" color="primary" />
          <Typography variant="subtitle2" fontWeight="medium">
            {value}
          </Typography>
        </Box>
      )
    },
    {
      key: 'email',
      header: 'Email',
      render: (value) => (
        <Box display="flex" alignItems="center" gap={1}>
          <EmailIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {value}
          </Typography>
        </Box>
      )
    },
    {
      key: 'createdAt',
      header: 'Ngày Tạo',
      render: (value) => (
        <Typography variant="body2" color="text.secondary">
          {new Date(value).toLocaleDateString('vi-VN')}
        </Typography>
      )
    }
  ];
  
  // Create handler
  const handleCreateUser = () => {
    const mode = activeTab === 0 ? 'staff' : 'parent';
    setCreateMode(mode);
    setIsSubmitting(false);
    setOpenCreateDialog(true);
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
        targetUserId: selectedUser.id,
        fullName: data.name || data.fullName,
        email: data.email,
        phoneNumber: '',
        changeRoleTo: 0,
        isActive: data.isActive
      };
      
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
  
  // Parent submit handler
  const handleParentSubmit = async (data) => {
    try {
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
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tạo tài khoản User (Parent)';
      setError(errorMessage);
      showGlobalError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };
  
  // Parent Form Wrapper
  const ParentFormWrapper = ({ isSubmitting, setIsSubmitting, onSuccess }) => (
    <Form
      schema={createUserSchema}
      defaultValues={{
        name: '',
        email: '',
        password: ''
      }}
      onSubmit={async (data) => {
        if (setIsSubmitting) setIsSubmitting(true);
        try {
          await handleParentSubmit(data);
          if (onSuccess) onSuccess();
        } catch (err) {
          const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tạo tài khoản User (Parent)';
          setError(errorMessage);
          showGlobalError(errorMessage);
          toast.error(errorMessage);
          throw err;
        } finally {
          if (setIsSubmitting) setIsSubmitting(false);
        }
      }}
      submitText="Tạo User (Parent)"
      loading={isSubmitting}
      disabled={isSubmitting}
      fields={[
        { 
          name: 'name', 
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
          name: 'password', 
          label: 'Mật Khẩu', 
          type: 'password', 
          required: true, 
          placeholder: 'Nhập mật khẩu cho người dùng',
          disabled: isSubmitting,
          gridSize: 12
        }
      ]}
    />
  );
  
  return (
    <div className={styles.container}>
      {/* Header */}
      <ManagerPageHeader
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
            <ManagerSearchSection
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
            <ManagerSearchSection
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
      <ManagerFormDialog
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
          fields={[
            { 
              name: 'name', 
              label: 'Họ và Tên', 
              type: 'text', 
              required: true, 
              placeholder: 'Ví dụ: Nguyễn Văn A',
              disabled: actionLoading,
              gridSize: 6
            },
            { 
              name: 'email', 
              label: 'Email', 
              type: 'email', 
              required: true, 
              placeholder: 'Ví dụ: email@example.com',
              disabled: actionLoading,
              gridSize: 6
            },
            { 
              name: 'password', 
              label: 'Mật Khẩu Mới', 
              type: 'password', 
              required: false,
              placeholder: 'Để trống nếu không muốn thay đổi mật khẩu',
              disabled: actionLoading,
              gridSize: 6,
              helperText: 'Lưu ý: Mật khẩu sẽ được thay đổi ngay lập tức, không cần xác nhận từ người dùng'
            },
            { 
              name: 'isActive', 
              label: 'Trạng Thái', 
              type: 'switch', 
              switchLabel: 'Hoạt động',
              required: true, 
              disabled: actionLoading,
              gridSize: 12
            }
          ]}
        />
      </ManagerFormDialog>

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

      {/* Create Account Dialog */}
      <ManagerFormDialog
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
        maxWidth="md"
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
        ) : (
          <ParentFormWrapper
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
            onSuccess={() => {
              setOpenCreateDialog(false);
              setCreateMode('staff');
            }}
          />
        )}
      </ManagerFormDialog>
    </div>
  );
};

export default StaffAndParentManagement;
