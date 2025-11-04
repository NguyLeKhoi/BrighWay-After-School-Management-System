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
  AssignmentInd as RoleIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import DataTable from '../../../components/Common/DataTable';
import Form from '../../../components/Common/Form';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import DialogWithTabs from '../../../components/Common/DialogWithTabs';
import StaffAccountForm from '../../../components/Common/StaffAccountForm';
import TeacherAccountForm from '../../../components/Common/TeacherAccountForm';
import { createUserSchema, updateUserSchema, updateManagerUserSchema } from '../../../utils/validationSchemas/userSchemas';
import { createTeacherAccountSchema, updateTeacherAccountSchema } from '../../../utils/validationSchemas/teacherSchemas';
import userService from '../../../services/user.service';
import { useApp } from '../../../contexts/AppContext';
import useContentLoading from '../../../hooks/useContentLoading';
import ContentLoading from '../../../components/Common/ContentLoading';
import { toast } from 'react-toastify';
import styles from './staffAndTeacherManagement.module.css';

const StaffAndTeacherManagement = () => {
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
  const { isLoading: isPageLoading, loadingText, showLoading, hideLoading } = useContentLoading(300); // Only for page load

  // Get current user role from context
  const { user } = useApp();
  const currentUserRole = user?.roles?.[0] || 'User';

  // Filter API role mapping: 0=Admin, 1=Manager, 2=Staff, 3=Teacher, 4=User
  const filterRoleMapping = {
    0: 'Admin',
    1: 'Manager',
    2: 'Staff',
    3: 'Teacher',
    4: 'User'
  };

  // Get manageable roles based on current user role
  const getManageableRoles = () => {
    switch (currentUserRole) {
      case 'Admin':
        return [
          { value: 1, label: 'Manager' },
          { value: 2, label: 'Staff' }
        ];
      case 'Manager':
        return [
          { value: 2, label: 'Staff' },
          { value: 3, label: 'Teacher' }
        ];
      case 'Staff':
        return [
          { value: 4, label: 'User' }
        ];
      default:
        // If user role is not recognized, assume Manager for this page
        return [
          { value: 2, label: 'Staff' },
          { value: 3, label: 'Teacher' }
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

  // Helper function to check if user is teacher
  const isTeacher = (user) => {
    // Check both roles (array) and role (string) for compatibility
    return (user?.roles && user.roles.includes('Teacher')) || user?.role === 'Teacher';
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
  const loadUsers = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) {
      showLoading();
    }
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
      
      // Add role filter if selected (Manager views Staff and Teacher)
      if (selectedRole !== null) {
        const targetRole = filterRoleMapping[selectedRole];
        params.Role = targetRole;
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
      
      // Filter to only show Staff and Teacher (Manager is not allowed to see other Managers or Admins)
      const filteredUsers = allUsers.filter(user => {
        const roles = user.roles || (user.roleName ? [user.roleName] : []);
        return roles.includes('Staff') || roles.includes('Teacher');
      });
      
      setUsers(filteredUsers);
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
    loadUsers();
  }, []);

  // Load users when page, rowsPerPage, or selectedRole changes
  useEffect(() => {
    loadUsers();
  }, [page, rowsPerPage, selectedRole]);

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
      // First get basic user info
      const result = await userService.getUserById(searchId.trim());
      
      // Check if user is teacher or user role for expanded details
      const isTeacherOrUser = isTeacher(result) || (result.roles && result.roles.includes('User'));
      
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

  const handleCreateUser = () => {
    setOpenCreateDialog(true);
  };

  const handleEditUser = async (user) => {
    setActionLoading(true);
    
    try {
      // Check if user is a teacher or user role and fetch expanded details
      const isTeacherOrUser = isTeacher(user) || (user.roles && user.roles.includes('User'));
      
      if (isTeacherOrUser) {
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
      // Find the user to determine their role
      const userToDelete = users.find(user => user.id === userId);
      
      if (userToDelete) {
        // Check if it's a teacher (has 'Teacher' role)
        if (userToDelete.roles && userToDelete.roles.includes('Teacher')) {
          await userService.deleteTeacherAccount(userId);
        } else {
          // Staff user
          await userService.deleteUserByManager(userId);
        }
      } else {
        throw new Error('Không tìm thấy người dùng để xóa');
      }
      
      // If we're deleting the last item on current page and not on first page, go to previous page
      if (users.length === 1 && page > 0) {
        setPage(page - 1);
      }
      
      // Reload data with current filters applied
      await loadUsers(false);
      
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
      // Check if it's a teacher (has 'Teacher' role)
      if (isTeacher(selectedUser)) {
        // Update teacher account with profile data - use teacher-account endpoint
        const teacherData = {
          teacherUserId: selectedUser.id,
          fullName: data.fullName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          specialization: data.specialization,
          experienceYears: data.experienceYears,
          qualifications: data.qualifications,
          bio: data.bio,
          isActive: data.isActive
        };
        
        // Add password if provided
        if (data.password && data.password.trim()) {
          teacherData.password = data.password;
        }
        await userService.updateTeacherAccount(selectedUser.id, teacherData);
      } else {
        // Update staff user - use manager-update endpoint with all fields
        const staffData = {
          targetUserId: selectedUser.id,
          fullName: data.fullName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          changeRoleTo: data.changeRoleTo || 0,
          isActive: data.isActive
        };
        
        // Add password if provided
        if (data.password && data.password.trim()) {
          staffData.password = data.password;
        }
        await userService.updateUserByManager(selectedUser.id, staffData);
      }
      
      toast.success(`Cập nhật người dùng "${data.fullName}" thành công!`, {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Reload data with current filters applied
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


  const handleStaffSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Manager creates Staff using the /User/staff API
      await userService.createStaff(data);
      
      toast.success(`Tạo tài khoản Staff thành công!`, {
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
              schema={isTeacher(selectedUser) ? updateTeacherAccountSchema : updateManagerUserSchema}
              defaultValues={isTeacher(selectedUser) ? {
                fullName: selectedUser?.user?.fullName || selectedUser?.fullName || '',
                email: selectedUser?.user?.email || selectedUser?.email || '',
                phoneNumber: selectedUser?.user?.phoneNumber || selectedUser?.phoneNumber || '',
                specialization: selectedUser?.teacherProfile?.specialization || '',
                experienceYears: selectedUser?.teacherProfile?.experienceYears || 0,
                qualifications: selectedUser?.teacherProfile?.qualifications || '',
                bio: selectedUser?.teacherProfile?.bio || '',
                password: '',
                isActive: selectedUser?.user?.isActive !== undefined ? selectedUser.user.isActive : (selectedUser?.isActive !== undefined ? selectedUser.isActive : true)
              } : {
                fullName: selectedUser?.fullName || '',
                email: selectedUser?.email || '',
                phoneNumber: selectedUser?.phoneNumber || '',
                changeRoleTo: roleStringToNumber(selectedUser?.roles?.[0]) || 2,
                password: '',
                isActive: selectedUser?.isActive !== undefined ? selectedUser.isActive : true
              }}
              onSubmit={handleFormSubmit}
              submitText="Cập nhật Thông Tin"
              loading={actionLoading}
              disabled={actionLoading}
              fields={isTeacher(selectedUser) ? [
                { 
                  name: 'fullName', 
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
                  name: 'phoneNumber', 
                  label: 'Số Điện Thoại', 
                  type: 'text', 
                  required: true, 
                  placeholder: 'Ví dụ: 0901234567',
                  disabled: actionLoading,
                  gridSize: 6
                },
                { 
                  name: 'specialization', 
                  label: 'Chuyên Môn', 
                  type: 'text', 
                  required: true, 
                  placeholder: 'Ví dụ: Toán học',
                  disabled: actionLoading,
                  gridSize: 6
                },
                { 
                  name: 'experienceYears', 
                  label: 'Số Năm Kinh Nghiệm', 
                  type: 'number', 
                  required: true, 
                  placeholder: 'Ví dụ: 5',
                  disabled: actionLoading,
                  gridSize: 6
                },
                { 
                  name: 'qualifications', 
                  label: 'Bằng Cấp', 
                  type: 'text', 
                  required: true, 
                  placeholder: 'Ví dụ: Thạc sĩ Toán học',
                  disabled: actionLoading,
                  gridSize: 12
                },
                { 
                  name: 'bio', 
                  label: 'Tiểu Sử', 
                  type: 'textarea', 
                  required: true, 
                  placeholder: 'Mô tả về bản thân, kinh nghiệm giảng dạy...',
                  disabled: actionLoading,
                  gridSize: 12
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
              ] : [
                { 
                  name: 'fullName', 
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
                  name: 'phoneNumber', 
                  label: 'Số Điện Thoại', 
                  type: 'text', 
                  required: true, 
                  placeholder: 'Ví dụ: 0901234567',
                  disabled: actionLoading,
                  gridSize: 6
                },
                { 
                  name: 'changeRoleTo', 
                  label: 'Vai Trò', 
                  type: 'select', 
                  required: true, 
                  options: [
                    { value: 2, label: 'Staff' },
                    { value: 3, label: 'Teacher' }
                  ],
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
