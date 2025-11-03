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
  Switch,
  FormControlLabel,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  AssignmentInd as RoleIcon
} from '@mui/icons-material';
import DataTable from '../../../components/Common/DataTable';
import Form from '../../../components/Common/Form';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import { createManagerSchema, updateUserSchema } from '../../../utils/validationSchemas/userSchemas';
import userService from '../../../services/user.service';
import { useApp } from '../../../contexts/AppContext';
import useContentLoading from '../../../hooks/useContentLoading';
import useFacilityBranchData from '../../../hooks/useFacilityBranchData';
import ContentLoading from '../../../components/Common/ContentLoading';
import { toast } from 'react-toastify';
import styles from './staffAndManagerManagement.module.css';

const ManagerManagement = () => {
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [keyword, setKeyword] = useState('');
  
  // Branch selection state
  const [selectedBranchId, setSelectedBranchId] = useState('');
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userRoleType, setUserRoleType] = useState(null); // 'staff' or 'manager'
  
  // Fetch branch data
  const { branches, getBranchOptions, isLoading: branchLoading } = useFacilityBranchData();
  
  // Confirm dialog states
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    onConfirm: null
  });

      // User creation confirmation dialog states
      const [confirmCreateDialog, setConfirmCreateDialog] = useState({
        open: false,
        title: '',
        description: '',
        userData: null,
        onConfirm: null
      });
  
  // Global state
  const { showGlobalError, addNotification } = useApp();
  const { isLoading: isPageLoading, loadingText, showLoading, hideLoading } = useContentLoading(300); // Only for page load

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
      key: 'roles',
      header: 'Vai Trò',
      render: (value, item) => {
        // Get roleName or roles from item
        let roleNames = [];
        
        if (item.roleName) {
          // Single roleName (string)
          roleNames = [item.roleName];
        } else if (Array.isArray(item.roles) && item.roles.length > 0) {
          // Multiple roles (array)
          roleNames = item.roles;
        } else if (value && Array.isArray(value)) {
          // Fallback: use value if it's an array
          roleNames = value;
        } else if (value) {
          // Fallback: single value
          roleNames = [value];
        } else {
          // If no role data, show "Unknown"
          roleNames = ['Unknown'];
        }
        
        // Map role string to display name
        const getRoleDisplayName = (roleString) => {
          switch (roleString) {
            case 'Admin': return 'Admin';
            case 'Teacher': return 'Teacher';
            case 'Staff': return 'Staff';
            case 'Manager': return 'Manager';
            case 'User': return 'User';
            default: return roleString || 'Unknown';
          }
        };
        
        const getRoleColor = (roleString) => {
          switch (roleString) {
            case 'Admin': return 'error';
            case 'Manager': return 'warning';
            case 'Teacher': return 'success';
            case 'Staff': return 'info';
            case 'User': return 'primary';
            default: return 'default';
          }
        };
        
        return (
          <Box display="flex" flexWrap="wrap" gap={0.5}>
            {roleNames.map((role, index) => (
              <Chip 
                key={index}
                label={getRoleDisplayName(role)} 
                color={getRoleColor(role)} 
                size="small"
                variant="outlined"
                icon={<RoleIcon fontSize="small" />}
              />
            ))}
          </Box>
        );
      }
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


  // Load users with pagination, keyword search, and role filter
  const loadUsers = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) {
      showLoading();
    }
    setError(null);
    try {
      const params = {
        pageIndex: page + 1, // Backend uses 1-based indexing
        pageSize: rowsPerPage,
        Role: 'Manager' // Admin only views Manager accounts
      };
      
      // Add keyword if provided
      if (keyword.trim()) {
        params.Keyword = keyword.trim();
      }
      
      // Use new endpoint that automatically filters by role
      const response = await userService.getUsersPagedByRole(params);
      
      // Handle both paginated and non-paginated responses
      let allUsers = [];
      if (response.items) {
        // Paginated response
        allUsers = response.items;
        setTotalCount(response.totalCount || response.items.length);
      } else {
        // Non-paginated response (fallback)
        allUsers = response;
        setTotalCount(response.length);
      }
      
      setUsers(allUsers);
    } catch (err) {
      const errorMessage = err.message || 'Có lỗi xảy ra khi tải danh sách người dùng';
      setError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      if (showLoadingIndicator) {
        hideLoading();
      }
    }
  };

  // Load users when component mounts
  useEffect(() => {
    setSearchResult(null); // Clear any existing search result
    loadUsers();
  }, []);

  // Load users when page or rowsPerPage changes
  useEffect(() => {
    loadUsers();
  }, [page, rowsPerPage]);

  // Load users when keyword changes (debounced search while typing)
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setSearchResult(null); // Clear search result when keyword changes
      loadUsers(false); // Don't show loading indicator for debounced search
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimer);
  }, [keyword]);

  // Use search result if available, otherwise use loaded users (already filtered)
  const displayUsers = searchResult ? [searchResult] : users;
  const paginatedUsers = displayUsers;
  

  // Event handlers
  const handleKeywordSearch = () => {
    setPage(0); // Reset to first page when searching
    setSearchResult(null); // Clear search result
    loadUsers(); // Trigger search with current keyword
  };

  const handleKeywordChange = (e) => {
    setKeyword(e.target.value);
    setPage(0); // Reset to first page when keyword changes
  };

  const handleSearchById = async () => {
    if (!searchId.trim()) {
      setSearchResult(null);
      return;
    }

    setSearchLoading(true);
    try {
      // First get basic user info
      const result = await userService.getUserById(searchId.trim());
      
      // Check if user is teacher or user role for expanded details
      const isTeacherOrUser = result.roles && (result.roles.includes('Teacher') || result.roles.includes('User'));
      
      if (isTeacherOrUser) {
        const expandedResult = await userService.getUserById(searchId.trim(), true);
        setSearchResult(expandedResult);
      } else {
        setSearchResult(result);
      }
      
      setPage(0);
      
      toast.success(`Tìm thấy người dùng: ${result.fullName}`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Không tìm thấy người dùng với ID này';
      setError(errorMessage);
      setSearchResult(null);
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setSearchLoading(false);
    }
  };


  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreateManager = () => {
    setDialogMode('create');
    setSelectedUser(null);
    setUserRoleType('manager');
    setOpenDialog(true);
  };

  const handleEditUser = async (user) => {
    setDialogMode('edit');
    
    // Check if user is a teacher or user role and fetch expanded details
    const isTeacherOrUser = user.roles && (user.roles.includes('Teacher') || user.roles.includes('User'));
    
    if (isTeacherOrUser) {
      setActionLoading(true);
      try {
        const expandedUser = await userService.getUserById(user.id, true);
        setSelectedUser(expandedUser);
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi lấy thông tin người dùng';
        setError(errorMessage);
        showGlobalError(errorMessage);
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 4000,
        });
        setActionLoading(false);
        return;
      } finally {
        setActionLoading(false);
      }
    } else {
      setSelectedUser(user);
    }
    
    setOpenDialog(true);
  };

  const handleDeleteUser = (user) => {
    setConfirmDialog({
      open: true,
      title: 'Xác nhận xóa người dùng',
      description: `Bạn có chắc chắn muốn xóa người dùng "${user.fullName}"? Hành động này không thể hoàn tác.`,
      onConfirm: () => performDeleteUser(user.id)
    });
  };

  const performDeleteUser = async (userId) => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
    setActionLoading(true);
    
    try {
      await userService.deleteUser(userId);
      
      // Reload data with proper filtering
      await loadUsers();
      
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
    if (dialogMode === 'create') {
      // Form already uses 'name' field, just pass data
      const submitData = {
        name: data.name,
        email: data.email,
        password: data.password,
        branchId: data.branchId || ''
      };
      
      setConfirmCreateDialog({
        open: true,
        title: 'Xác nhận Tạo Tài Khoản',
        description: `Vui lòng kiểm tra lại thông tin trước khi tạo tài khoản:`,
        userData: submitData,
        onConfirm: () => handleConfirmCreate(submitData)
      });
    } else {
      // Direct update for editing user
      await performUpdateUser(data);
    }
  };

  const handleConfirmCreate = async (userData) => {
    setConfirmCreateDialog(prev => ({ ...prev, open: false }));
    await performCreateUser(userData);
  };

  const handleCancelCreate = () => {
    setConfirmCreateDialog({
      open: false,
      title: '',
      description: '',
      userData: null,
      onConfirm: null
    });
  };

  const performCreateUser = async (data) => {
    setActionLoading(true);
    
    try {
      // Call appropriate API based on userRoleType
      let createdUser;
      if (userRoleType === 'staff') {
        createdUser = await userService.createStaff(data);
      } else if (userRoleType === 'manager') {
        createdUser = await userService.createManager(data);
      } else {
        // Fallback
        createdUser = await userService.createUser(data, data.role);
      }
      
      const roleLabel = userRoleType === 'manager' ? 'Manager' : 'Staff';
      toast.success(`Tạo tài khoản ${roleLabel} "${data.name}" thành công!`, {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Reload data with proper filtering
      await loadUsers();
      
      setOpenDialog(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tạo tài khoản';
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

  const performUpdateUser = async (data) => {
    setActionLoading(true);
    
    try {
      await userService.updateUser(selectedUser.id, data);
      toast.success(`Cập nhật người dùng "${data.fullName}" thành công!`, {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Reload data with proper filtering
      await loadUsers();
      
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

  return (
    <div className={styles.container}>
      {isPageLoading && <ContentLoading isLoading={isPageLoading} text={loadingText} />}
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          Quản lý Manager
        </h1>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateManager}
          className={styles.addButton}
          sx={{ backgroundColor: '#1976d2' }}
        >
          Tạo Manager
        </Button>
      </div>


      {/* Search and Filter Section */}
      <Paper className={styles.searchSection}>
        <div className={styles.searchContainer}>
          {/* Keyword Search */}
          <TextField
            placeholder="Tìm kiếm theo tên, email..."
            value={keyword}
            onChange={handleKeywordChange}
            className={styles.searchField}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleKeywordSearch();
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
            onClick={handleKeywordSearch}
            className={styles.searchButton}
          >
            Tìm kiếm
          </Button>
        </div>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" className={styles.errorAlert} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <div className={styles.tableContainer}>
        <DataTable
          data={paginatedUsers}
          columns={columns}
          loading={isPageLoading}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={searchResult ? 1 : totalCount}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
        emptyMessage={searchResult ? "Không có người dùng nào." : "Không có người dùng nào. Hãy tạo tài khoản đầu tiên để bắt đầu."}
      />

      {/* Create/Edit Dialog */}
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
            <PersonIcon />
            <span>
              {dialogMode === 'create' 
                ? `Tạo Tài Khoản ${userRoleType === 'staff' ? 'Staff' : 'Manager'}` 
                : 'Chỉnh sửa Thông Tin Người Dùng'}
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
              schema={dialogMode === 'create' ? createManagerSchema : updateUserSchema}
              defaultValues={{
                name: selectedUser?.name || '',
                ...(dialogMode === 'create' ? {
                  email: selectedUser?.email || '',
                  password: '',
                  branchId: ''
                } : {
                  email: selectedUser?.email || '',
                  password: '',
                  isActive: selectedUser?.isActive !== undefined ? selectedUser.isActive : true
                })
              }}
              onSubmit={handleFormSubmit}
              submitText={dialogMode === 'create' 
                ? `Tạo ${userRoleType === 'staff' ? 'Staff' : 'Manager'}` 
                : 'Cập nhật Thông Tin'}
              loading={actionLoading}
              disabled={actionLoading}
              fields={dialogMode === 'create' ? [
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
                  name: 'branchId', 
                  label: 'Chi Nhánh', 
                  type: 'select', 
                  required: false, 
                  options: getBranchOptions(),
                  disabled: actionLoading || branchLoading,
                  gridSize: 6
                },
                { 
                  name: 'email', 
                  label: 'Email', 
                  type: 'email', 
                  required: true, 
                  placeholder: 'Ví dụ: email@example.com',
                  disabled: actionLoading,
                  gridSize: 12
                },
                { 
                  name: 'password', 
                  label: 'Mật Khẩu', 
                  type: 'password', 
                  required: true, 
                  placeholder: 'Nhập mật khẩu cho người dùng',
                  disabled: actionLoading,
                  gridSize: 12
                }
              ] : [
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
                  helperText: 'Để trống nếu không muốn thay đổi mật khẩu'
                },
                { 
                  name: 'isActive', 
                  label: 'Trạng Thái', 
                  type: 'switch', 
                  switchLabel: 'Hoạt động',
                  required: true, 
                  disabled: actionLoading,
                  gridSize: 6
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

      {/* User Creation Confirmation Dialog */}
      <Dialog 
        open={confirmCreateDialog.open} 
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
            justifyContent: 'space-between',
            padding: '16px 24px',
            position: 'relative'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon sx={{ color: 'white' }} />
            <Typography variant="h6" component="span" sx={{ color: 'white' }}>
              {confirmCreateDialog.title}
            </Typography>
          </Box>
          <Button
            onClick={handleCancelCreate}
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
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Vui lòng kiểm tra lại thông tin trước khi tạo tài khoản:</strong>
            </Typography>
          </Alert>
          
          {confirmCreateDialog.userData && (
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Thông tin tài khoản
              </Typography>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Họ và Tên:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {confirmCreateDialog.userData.fullName}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {confirmCreateDialog.userData.email}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Số Điện Thoại:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {confirmCreateDialog.userData.phoneNumber}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Vai Trò:
                  </Typography>
                  <Chip 
                    label={roleOptions.find(role => role.value === confirmCreateDialog.userData.role)?.label || 'Unknown'}
                    color={confirmCreateDialog.userData.role === 1 ? 'warning' : 'info'} 
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
                  {'•'.repeat(confirmCreateDialog.userData.password?.length || 0)}
                </Typography>
              </div>
            </Paper>
          )}
          
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Lưu ý quan trọng:</strong>
              <br />
              • Email và Vai trò không thể thay đổi sau khi tạo tài khoản
              <br />
              • Người dùng sẽ có thể đăng nhập bằng email và mật khẩu này
              <br />
              • Hãy đảm bảo thông tin chính xác trước khi xác nhận
            </Typography>
          </Alert>
        </DialogContent>
        <Box sx={{ p: 3, backgroundColor: '#f5f5f5', display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            onClick={confirmCreateDialog.onConfirm}
            variant="contained"
            color="primary"
            disabled={actionLoading}
            startIcon={actionLoading ? null : <PersonIcon />}
            size="large"
            sx={{ minWidth: 200 }}
          >
            {actionLoading ? 'Đang tạo...' : 'Xác nhận tạo tài khoản'}
          </Button>
        </Box>
      </Dialog>
      </div>
    </div>
  );
};

export default ManagerManagement;
