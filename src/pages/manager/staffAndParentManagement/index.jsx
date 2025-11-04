import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Groups as GroupsIcon,
  FamilyRestroom as FamilyIcon
} from '@mui/icons-material';
import DataTable from '../../../components/Common/DataTable';
import Form from '../../../components/Common/Form';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import DialogWithTabs from '../../../components/Common/DialogWithTabs';
import StaffAccountForm from '../../../components/Common/StaffAccountForm';
import { createUserSchema, updateUserSchema, updateManagerUserSchema } from '../../../utils/validationSchemas/userSchemas';
import userService from '../../../services/user.service';
import { useApp } from '../../../contexts/AppContext';
import useContentLoading from '../../../hooks/useContentLoading';
import ContentLoading from '../../../components/Common/ContentLoading';
import { toast } from 'react-toastify';
import styles from './staffAndParentManagement.module.css';

const StaffAndParentManagement = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState(0); // 0 = Staff, 1 = User
  
  // Staff tab state
  const [staffUsers, setStaffUsers] = useState([]);
  const [staffTotalCount, setStaffTotalCount] = useState(0);
  const [staffPage, setStaffPage] = useState(0);
  const [staffRowsPerPage, setStaffRowsPerPage] = useState(10);
  const [staffKeyword, setStaffKeyword] = useState('');
  
  // User tab state
  const [userUsers, setUserUsers] = useState([]);
  const [userTotalCount, setUserTotalCount] = useState(0);
  const [userPage, setUserPage] = useState(0);
  const [userRowsPerPage, setUserRowsPerPage] = useState(10);
  const [userKeyword, setUserKeyword] = useState('');
  
  // Common state
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
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
  const { showGlobalError, addNotification } = useApp();
  const { isLoading: isPageLoading, loadingText, showLoading, hideLoading } = useContentLoading(300); // Only for page load

  // Get current user role from context
  const { user } = useApp();
  const currentUserRole = user?.roles?.[0] || 'User';

  // Map role string to number for form submission
  const roleStringToNumber = (roleString) => {
    switch (roleString) {
      case 'Admin': return 0;
      case 'Teacher': return 1;
      case 'Staff': return 2;
      case 'Manager': return 3;
      case 'User': return 4;
      default: return 2; // Default to Staff
    }
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


  // Load Staff users
  const loadStaffUsers = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) {
      showLoading();
    }
    setError(null);
    try {
      const params = {
        pageIndex: staffPage + 1,
        pageSize: staffRowsPerPage,
        Role: 'Staff'
      };
      
      if (staffKeyword.trim()) {
        params.Keyword = staffKeyword.trim();
      }
      
      const response = await userService.getUsersPagedByRole(params);
      
      if (response.items) {
        setStaffUsers(response.items);
        setStaffTotalCount(response.totalCount || response.items.length);
      } else {
        setStaffUsers(response);
        setStaffTotalCount(response.length);
      }
    } catch (err) {
      const errorMessage = err.message || 'Có lỗi xảy ra khi tải danh sách nhân viên';
      setError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      if (showLoadingIndicator) {
        hideLoading();
      }
    }
  };

  // Load User (Parent) users
  const loadUserUsers = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) {
      showLoading();
    }
    setError(null);
    try {
      const params = {
        pageIndex: userPage + 1,
        pageSize: userRowsPerPage,
        Role: 'User'
      };
      
      if (userKeyword.trim()) {
        params.Keyword = userKeyword.trim();
      }
      
      console.log('Loading User users with params:', params);
      const response = await userService.getUsersPagedByRole(params);
      console.log('User users response:', response);
      
      if (response.items) {
        setUserUsers(response.items);
        setUserTotalCount(response.totalCount || response.items.length);
        console.log(`Loaded ${response.items.length} User users, total: ${response.totalCount || response.items.length}`);
      } else if (Array.isArray(response)) {
        setUserUsers(response);
        setUserTotalCount(response.length);
        console.log(`Loaded ${response.length} User users (array format)`);
      } else {
        console.warn('Unexpected response format:', response);
        setUserUsers([]);
        setUserTotalCount(0);
      }
    } catch (err) {
      console.error('Error loading User users:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tải danh sách người dùng';
      setError(errorMessage);
      showGlobalError(errorMessage);
      setUserUsers([]);
      setUserTotalCount(0);
    } finally {
      if (showLoadingIndicator) {
        hideLoading();
      }
    }
  };

  // Load data when component mounts
  useEffect(() => {
    loadStaffUsers();
    loadUserUsers();
  }, []);

  // Load Staff users when page, rowsPerPage changes
  useEffect(() => {
    if (activeTab === 0) {
      loadStaffUsers();
    }
  }, [staffPage, staffRowsPerPage]);

  // Load User users when page, rowsPerPage changes
  useEffect(() => {
    if (activeTab === 1) {
      loadUserUsers();
    }
  }, [userPage, userRowsPerPage]);

  // Load Staff users when keyword changes (debounced)
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (activeTab === 0) {
        setSearchResult(null);
        loadStaffUsers(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [staffKeyword]);

  // Load User users when keyword changes (debounced)
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (activeTab === 1) {
        setSearchResult(null);
        loadUserUsers(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [userKeyword]);

  // Event handlers
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSearchResult(null);
    // Load data when switching tabs
    if (newValue === 0) {
      loadStaffUsers(false);
    } else if (newValue === 1) {
      loadUserUsers(false);
    }
  };

  const handleStaffKeywordSearch = () => {
    setStaffPage(0);
    setSearchResult(null);
    loadStaffUsers();
  };

  const handleStaffKeywordChange = (e) => {
    setStaffKeyword(e.target.value);
    setStaffPage(0);
  };

  const handleUserKeywordSearch = () => {
    setUserPage(0);
    setSearchResult(null);
    loadUserUsers();
  };

  const handleUserKeywordChange = (e) => {
    setUserKeyword(e.target.value);
    setUserPage(0);
  };




  const handleStaffPageChange = (event, newPage) => {
    setStaffPage(newPage);
  };

  const handleStaffRowsPerPageChange = (event) => {
    setStaffRowsPerPage(parseInt(event.target.value, 10));
    setStaffPage(0);
  };

  const handleUserPageChange = (event, newPage) => {
    setUserPage(newPage);
  };

  const handleUserRowsPerPageChange = (event) => {
    setUserRowsPerPage(parseInt(event.target.value, 10));
    setUserPage(0);
  };

  const handleCreateUser = () => {
    setOpenCreateDialog(true);
  };

  const handleEditUser = async (user) => {
    setActionLoading(true);
    
    try {
      // Check if user is a User role and fetch expanded details
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
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = (user) => {
    const userRole = user.roles?.includes('Staff') ? 'Staff' : 'User';
    const userName = user.name || user.fullName || user.email || 'người dùng này';
    setConfirmDialog({
      open: true,
      title: 'Xác nhận xóa người dùng',
      description: `Bạn có chắc chắn muốn xóa người dùng "${userName}"? Hành động này không thể hoàn tác.`,
      highlightText: userName,
      onConfirm: () => performDeleteUser(user.id, userRole)
    });
  };

  const performDeleteUser = async (userId, userRole) => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
    setActionLoading(true);
    
    try {
      // Delete Staff or User using manager-delete endpoint
      await userService.deleteUserByManager(userId);
      
      // If we're deleting the last item on current page and not on first page, go to previous page
      if (userRole === 'Staff') {
        if (staffUsers.length === 1 && staffPage > 0) {
          setStaffPage(staffPage - 1);
        }
        await loadStaffUsers(false);
      } else {
        if (userUsers.length === 1 && userPage > 0) {
          setUserPage(userPage - 1);
        }
        await loadUserUsers(false);
      }
      
      toast.success(`Xóa người dùng thành công!`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi xóa người dùng';
      setError(errorMessage);
      showGlobalError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormSubmit = async (data) => {
    // Direct update for editing user
    await performUpdateUser(data);
  };

  const performUpdateUser = async (data) => {
    setActionLoading(true);
    
    try {
      // Update Staff or User - use manager-update endpoint
      // API expects: name (not fullName), email, isActive, password (optional)
      const updateData = {
        targetUserId: selectedUser.id,
        fullName: data.name || data.fullName, // Backend may expect fullName, but we use name in form
        email: data.email,
        phoneNumber: '', // Not in API response, but may be required by backend
        changeRoleTo: 0, // Don't change role
        isActive: data.isActive
      };
      
      // Add password if provided
      if (data.password && data.password.trim()) {
        updateData.password = data.password;
      }
      
      await userService.updateUserByManager(selectedUser.id, updateData);
      
      toast.success(`Cập nhật người dùng "${data.name || data.fullName}" thành công!`, {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Reload data with current filters applied
      if (selectedUser.roles?.includes('Staff') || selectedUser.roleName === 'Staff') {
        await loadStaffUsers(false);
      } else {
        await loadUserUsers(false);
      }
      
      setOpenDialog(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi cập nhật người dùng';
      setError(errorMessage);
      showGlobalError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setActionLoading(false);
    }
  };


  const handleStaffSubmit = async (data) => {
    try {
      // Manager creates Staff using the /User/staff API
      await userService.createStaff(data);
      
      toast.success(`Tạo tài khoản Staff thành công!`, {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Reload data
      if (activeTab === 0) {
        loadStaffUsers(false);
      } else {
        loadUserUsers(false);
      }
      setOpenCreateDialog(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tạo tài khoản';
      setError(errorMessage);
      showGlobalError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
      throw err; // Re-throw to prevent form from thinking it succeeded
    }
  };

  const handleParentSubmit = async (data) => {
    try {
      // Use createParent API with { email, password, name }
      const parentData = {
        email: data.email,
        password: data.password,
        name: data.name || data.fullName
      };
      
      await userService.createParent(parentData);
      
      toast.success(`Tạo tài khoản User (Parent) "${parentData.name}" thành công!`, {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Reload data
      if (activeTab === 0) {
        loadStaffUsers(false);
      } else {
        loadUserUsers(false);
      }
      setOpenCreateDialog(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tạo tài khoản User (Parent)';
      setError(errorMessage);
      showGlobalError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
      throw err; // Re-throw to prevent form from thinking it succeeded
    }
  };

  // Wrapper component for Parent Form to receive props from DialogWithTabs
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
          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 4000,
          });
          throw err; // Re-throw to prevent form from thinking it succeeded
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
      {isPageLoading && <ContentLoading isLoading={isPageLoading} text={loadingText} />}
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          {currentUserRole === 'Admin' && 'Quản lý Manager & Staff'}
          {currentUserRole === 'Manager' && 'Quản lý Staff & User'}
          {currentUserRole === 'Staff' && 'Quản lý User'}
          {!['Admin', 'Manager', 'Staff'].includes(currentUserRole) && 'Quản lý Người Dùng'}
        </h1>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateUser}
          className={styles.addButton}
        >
         Tạo Tài Khoản Mới
        </Button>
      </div>


      {/* Error Alert */}
      {error && (
        <Alert severity="error" className={styles.errorAlert} onClose={() => setError(null)}>
          {error}
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
            {/* Search Section for Staff */}
            <Paper className={styles.searchSection} sx={{ mb: 2 }}>
              <div className={styles.searchContainer}>
                <TextField
                  placeholder="Tìm kiếm nhân viên theo tên, email..."
                  value={staffKeyword}
                  onChange={handleStaffKeywordChange}
                  className={styles.searchField}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleStaffKeywordSearch();
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleStaffKeywordSearch}
                  className={styles.searchButton}
                >
                  Tìm kiếm
                </Button>
              </div>
            </Paper>

            {/* Staff Table */}
            <div className={styles.tableContainer}>
              <DataTable
                data={searchResult && searchResult.roles?.includes('Staff') ? [searchResult] : staffUsers}
                columns={columns}
                loading={isPageLoading && activeTab === 0}
                page={staffPage}
                rowsPerPage={staffRowsPerPage}
                totalCount={searchResult && searchResult.roles?.includes('Staff') ? 1 : staffTotalCount}
                onPageChange={handleStaffPageChange}
                onRowsPerPageChange={handleStaffRowsPerPageChange}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                emptyMessage={searchResult && searchResult.roles?.includes('Staff') ? "Không có người dùng nào." : "Không có nhân viên nào. Hãy tạo tài khoản nhân viên đầu tiên để bắt đầu."}
              />
            </div>
          </Box>
        )}

        {/* User Tab */}
        {activeTab === 1 && (
          <Box>
            {/* Search Section for User */}
            <Paper className={styles.searchSection} sx={{ mb: 2 }}>
              <div className={styles.searchContainer}>
                <TextField
                  placeholder="Tìm kiếm người dùng theo tên, email..."
                  value={userKeyword}
                  onChange={handleUserKeywordChange}
                  className={styles.searchField}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleUserKeywordSearch();
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleUserKeywordSearch}
                  className={styles.searchButton}
                >
                  Tìm kiếm
                </Button>
              </div>
            </Paper>

            {/* User Table */}
            <div className={styles.tableContainer}>
              <DataTable
                data={searchResult && searchResult.roles?.includes('User') ? [searchResult] : userUsers}
                columns={columns}
                loading={isPageLoading && activeTab === 1}
                page={userPage}
                rowsPerPage={userRowsPerPage}
                totalCount={searchResult && searchResult.roles?.includes('User') ? 1 : userTotalCount}
                onPageChange={handleUserPageChange}
                onRowsPerPageChange={handleUserRowsPerPageChange}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                emptyMessage={searchResult && searchResult.roles?.includes('User') ? "Không có người dùng nào." : "Không có người dùng nào. Hãy tạo tài khoản người dùng đầu tiên để bắt đầu."}
              />
            </div>
          </Box>
        )}
      </Box>

      {/* Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => !actionLoading && setOpenDialog(false)} 
        maxWidth="sm" 
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
            justifyContent: 'space-between',
            padding: '16px 24px',
            position: 'relative'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>
              Chỉnh sửa Thông Tin Người Dùng
            </span>
          </Box>
          <Button
            onClick={() => setOpenDialog(false)}
            disabled={actionLoading}
            sx={{
              color: 'white',
              minWidth: 'auto',
              padding: '8px',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            ✕
          </Button>
        </DialogTitle>
        <DialogContent className={styles.dialogContent}>
          <div style={{ paddingTop: '8px' }}>
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
          </div>
        </DialogContent>
      </Dialog>

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
      <DialogWithTabs
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onSuccess={() => {
          if (activeTab === 0) {
            loadStaffUsers(false);
          } else {
            loadUserUsers(false);
          }
        }}
        title="Tạo Tài Khoản Mới"
        tabs={[
          {
            label: 'Tài Khoản Nhân Viên',
            icon: <PersonIcon />
          },
          {
            label: 'Tài Khoản User (Parent)',
            icon: <PersonIcon />
          }
        ]}
        tabContents={[
          <StaffAccountForm 
            key="staff-form"
            onStaffSubmit={handleStaffSubmit}
            roleOptions={[
              { value: 0, label: 'Staff' }
            ]}
          />,
          <ParentFormWrapper key="parent-form" />
        ]}
        loading={isSubmitting}
      />
    </div>
  );
};

export default StaffAndParentManagement;
