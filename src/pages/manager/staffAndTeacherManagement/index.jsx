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
  DialogActions,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  AssignmentInd as RoleIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import DataTable from '../../../components/Common/DataTable';
import Form from '../../../components/Common/Form';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import DialogWithTabs from '../../../components/Common/DialogWithTabs';
import StaffAccountForm from '../../../components/Common/StaffAccountForm';
import TeacherAccountForm from '../../../components/Common/TeacherAccountForm';
import { createUserSchema, createTeacherAccountSchema, updateUserSchema } from '../../../utils/validationSchemas';
import userService from '../../../services/user.service';
import { useApp } from '../../../contexts/AppContext';
import useContentLoading from '../../../hooks/useContentLoading';
import ContentLoading from '../../../components/Common/ContentLoading';
import { toast } from 'react-toastify';
import styles from './staffAndTeacherManagement.module.css';

const StaffAndTeacherManagement = () => {
  console.log('=== StaffAndTeacherManagement Component Loaded ===');
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
  const [selectedRole, setSelectedRole] = useState(null); // null = all, 0 = Staff, 1 = Teacher
  
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
  const { isLoading: isPageLoading, loadingText, showLoading, hideLoading } = useContentLoading(1500); // Only for page load

  // Get current user role from context
  const { user } = useApp();
  const currentUserRole = user?.roles?.[0] || 'User';

  // Filter API role mapping: 0=Admin, 1=Teacher, 2=Staff, 3=Manager, 4=User
  const filterRoleMapping = {
    0: 'Admin',
    1: 'Teacher',
    2: 'Staff',
    3: 'Manager',
    4: 'User'
  };

  // Get manageable roles based on current user role
  const getManageableRoles = () => {
    switch (currentUserRole) {
      case 'Admin':
        return [
          { value: 3, label: 'Manager' },
          { value: 2, label: 'Staff' }
        ];
      case 'Manager':
        return [
          { value: 2, label: 'Staff' },
          { value: 1, label: 'Teacher' }
        ];
      case 'Staff':
        return [
          { value: 4, label: 'User' }
        ];
      default:
        // If user role is not recognized, assume Manager for this page
        return [
          { value: 2, label: 'Staff' },
          { value: 1, label: 'Teacher' }
        ];
    }
  };

  const roleOptions = getManageableRoles();

  // Create API role mapping: 0=Staff, 1=Teacher (for manager-create endpoint)
  const createRoleMapping = {
    0: 'Staff',
    1: 'Teacher'
  };

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
      key: 'fullName',
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
      key: 'phoneNumber',
      header: 'Số Điện Thoại',
      render: (value) => (
        <Box display="flex" alignItems="center" gap={1}>
          <PhoneIcon fontSize="small" color="action" />
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
        // Handle both array format (from API) and single value format
        let roles = [];
        if (Array.isArray(value)) {
          roles = value;
        } else if (value !== undefined && value !== null) {
          roles = [value];
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
            {roles.map((role, index) => (
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
  const loadUsers = async () => {
    showLoading();
    setError(null);
    try {
      const params = {
        pageIndex: page + 1, // Backend uses 1-based indexing
        pageSize: rowsPerPage
      };
      
      // Add keyword if provided
      if (keyword.trim()) {
        params.Keyword = keyword.trim();
      }
      
      // Don't send role filter to API - filter on frontend instead
      const response = await userService.getUsersPaged(params);
      
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
      
      // Apply frontend filtering
      let filteredUsers = filterManageableUsers(allUsers);
      console.log('After manageable filter:', filteredUsers);
      
      // Apply role filter if selected
      if (selectedRole !== null) {
        const targetRole = filterRoleMapping[selectedRole];
        console.log('Filtering by role:', selectedRole, '->', targetRole);
        filteredUsers = filteredUsers.filter(user => 
          user.roles && user.roles.includes(targetRole)
        );
        console.log('After role filter:', filteredUsers);
      }
      
      setUsers(filteredUsers);
    } catch (err) {
      console.error('API Error:', err);
      
      // Fallback: try getAllUsers if paged API fails
      try {
        const allUsers = await userService.getAllUsers();
        
        // Apply filtering
        const filteredUsers = filterManageableUsers(allUsers);
        setUsers(filteredUsers);
        setTotalCount(filteredUsers.length);
        return;
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
      }
      
      const errorMessage = err.message || 'Có lỗi xảy ra khi tải danh sách người dùng';
      setError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      hideLoading();
    }
  };

  // Load users when component mounts
  useEffect(() => {
    loadUsers();
  }, []);

  // Load users when page, rowsPerPage, or selectedRole changes
  useEffect(() => {
    loadUsers();
  }, [page, rowsPerPage, selectedRole]);

  // Filter users based on current user's manageable roles
  const filterManageableUsers = (userList) => {
    const manageableRoleNumbers = roleOptions.map(option => option.value);
    const manageableRoleStrings = manageableRoleNumbers.map(num => filterRoleMapping[num]);
    
    console.log('Filtering manageable users:', {
      userList,
      manageableRoleNumbers,
      manageableRoleStrings,
      currentUserRole,
      roleOptions
    });
    
    const filtered = userList.filter(user => {
      if (!user.roles || !Array.isArray(user.roles)) return false;
      return user.roles.some(role => manageableRoleStrings.includes(role));
    });
    
    console.log('Filtered manageable users:', filtered);
    return filtered;
  };

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
    // If keyword is cleared, reset search immediately
    if (e.target.value.trim() === '') {
      setPage(0);
      setSearchResult(null);
      loadUsers();
    }
  };

  const handleRoleFilter = (role) => {
    setSelectedRole(role);
    setPage(0); // Reset to first page when filtering
    setSearchResult(null); // Clear search result
  };


  const handleSearchById = async () => {
    if (!searchId.trim()) {
      setSearchResult(null);
      return;
    }

    setSearchLoading(true);
    try {
      const result = await userService.getUserById(searchId.trim());
      setSearchResult(result);
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

  const handleCreateUser = () => {
    setOpenCreateDialog(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
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
      
      // Reload data without showing loading page
      const response = await userService.getUsersPaged({
        page: page + 1,
        pageSize: rowsPerPage
      });
      
      if (response.items) {
        setUsers(response.items);
        setTotalCount(response.totalCount || response.items.length);
      } else {
        setUsers(response);
        setTotalCount(response.length);
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
      await userService.updateUser(selectedUser.id, data);
      toast.success(`Cập nhật người dùng "${data.fullName}" thành công!`, {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Reload data without showing loading page
      const response = await userService.getUsersPaged({
        page: page + 1,
        pageSize: rowsPerPage
      });
      
      if (response.items) {
        setUsers(response.items);
        setTotalCount(response.totalCount || response.items.length);
      } else {
        setUsers(response);
        setTotalCount(response.length);
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
    setIsSubmitting(true);
    try {
      await userService.createUserByManager(data, data.role);
      
      toast.success(`Tạo tài khoản "${data.fullName}" thành công!`, {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Reload data
      loadUsers();
      setOpenCreateDialog(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tạo tài khoản';
      setError(errorMessage);
      showGlobalError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTeacherSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await userService.createTeacherAccount(data);
      
      toast.success(`Tạo tài khoản giáo viên "${data.user.fullName}" thành công!`, {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Reload data
      loadUsers();
      setOpenCreateDialog(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tạo tài khoản giáo viên';
      setError(errorMessage);
      showGlobalError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {isPageLoading && <ContentLoading isLoading={isPageLoading} text={loadingText} />}
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          {currentUserRole === 'Admin' && 'Quản lý Manager & Staff'}
          {currentUserRole === 'Manager' && 'Quản lý Staff & Giáo Viên'}
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
          
          {/* Role Filter Select */}
          <FormControl className={styles.roleSelect}>
            <Select
              value={selectedRole === null ? '' : selectedRole}
              onChange={(e) => handleRoleFilter(e.target.value === '' ? null : e.target.value)}
              displayEmpty
            >
              <MenuItem value="">
                <em>Tất cả vai trò</em>
              </MenuItem>
              {roleOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
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
        <DialogTitle className={styles.dialogTitle}>
          <span className={styles.dialogTitleText}>
            Chỉnh sửa Thông Tin Người Dùng
          </span>
        </DialogTitle>
        <DialogContent className={styles.dialogContent}>
          <Alert severity="info" style={{ marginBottom: '16px' }}>
            <span>
              <strong>Lưu ý:</strong> Chỉ có thể cập nhật <strong>Họ và Tên</strong> và <strong>Số Điện Thoại</strong>. 
              Email và Vai trò không thể thay đổi sau khi tạo tài khoản.
            </span>
          </Alert>
          <div style={{ paddingTop: '8px' }}>
            <Form
              schema={updateUserSchema}
              defaultValues={{
                fullName: selectedUser?.fullName || '',
                phoneNumber: selectedUser?.phoneNumber || ''
              }}
              onSubmit={handleFormSubmit}
              submitText="Cập nhật Thông Tin"
              loading={actionLoading}
              disabled={actionLoading}
              fields={[
                { 
                  name: 'fullName', 
                  label: 'Họ và Tên', 
                  type: 'text', 
                  required: true, 
                  placeholder: 'Ví dụ: Nguyễn Văn A',
                  disabled: actionLoading
                },
                { 
                  name: 'phoneNumber', 
                  label: 'Số Điện Thoại', 
                  type: 'text', 
                  required: true, 
                  placeholder: 'Ví dụ: 0901234567',
                  disabled: actionLoading
                }
              ]}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDialog(false)} 
            disabled={actionLoading}
          >
            Hủy
          </Button>
        </DialogActions>
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
        onSuccess={loadUsers}
        title="Tạo Tài Khoản Mới"
        tabs={[
          {
            label: 'Tài Khoản Nhân Viên',
            icon: <PersonIcon />
          },
          {
            label: 'Tài Khoản Giáo Viên',
            icon: <SchoolIcon />
          }
        ]}
        tabContents={[
          <StaffAccountForm 
            key="staff-form"
            onStaffSubmit={handleStaffSubmit}
            roleOptions={[
              { value: 0, label: 'Staff' },
              { value: 1, label: 'Teacher' }
            ]}
          />,
          <TeacherAccountForm 
            key="teacher-form"
            onTeacherSubmit={handleTeacherSubmit}
          />
        ]}
        loading={isSubmitting}
      />
      </div>
    </div>
  );
};

export default StaffAndTeacherManagement;
