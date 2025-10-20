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
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Card,
  CardContent,
  CardHeader
} from '@mui/material';
import {
  Add as AddIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  AssignmentInd as RoleIcon,
  Home as HomeIcon,
  FamilyRestroom as FamilyIcon
} from '@mui/icons-material';
import DataTable from '../../../components/Common/DataTable';
import Form from '../../../components/Common/Form';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import FamilyAccountForm from '../../../components/Common/FamilyAccountForm';
import { updateUserSchema } from '../../../utils/validationSchemas';
import userService from '../../../services/user.service';
import { useApp } from '../../../contexts/AppContext';
import { useLoading } from '../../../hooks/useLoading';
import Loading from '../../../components/Common/Loading';
import { toast } from 'react-toastify';
import styles from './userManagement.module.css';

const UserManagement = () => {
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
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Confirm dialog states
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    onConfirm: null
  });


  // Global state
  const { showGlobalError, addNotification } = useApp();
  const { isLoading, showLoading, hideLoading } = useLoading();

  // Map role string to number for form submission
  const roleStringToNumber = (roleString) => {
    switch (roleString) {
      case 'Admin': return 0;
      case 'Manager': return 1;
      case 'Staff': return 2;
      case 'Teacher': return 3;
      case 'User': return 4;
      default: return 4; // Default to User
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

  // Load users with pagination and keyword search, filter for User role only
  const loadUsers = async () => {
    showLoading();
    setError(null);
    try {
      const params = {
        pageIndex: page + 1, // Backend uses 1-based indexing
        pageSize: rowsPerPage,
        Role: 4 // Filter for User role only (4 = User)
      };
      
      // Add keyword if provided
      if (keyword.trim()) {
        params.Keyword = keyword.trim();
      }
      
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
      
      // Additional frontend filtering to ensure only User role
      const filteredUsers = allUsers.filter(user => {
        if (!user.roles || !Array.isArray(user.roles)) return false;
        return user.roles.includes('User');
      });
      
      setUsers(filteredUsers);
    } catch (err) {
      const errorMessage = err.message || 'Có lỗi xảy ra khi tải danh sách người dùng';
      setError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      hideLoading();
    }
  };

  // Load users when component mounts
  useEffect(() => {
    setSearchResult(null); // Clear any existing search result
    loadUsers();
  }, []);

  // Load users when page, rowsPerPage changes
  useEffect(() => {
    loadUsers();
  }, [page, rowsPerPage]);

  // Use search result if available, otherwise use loaded users
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

  const handleSearchById = async () => {
    if (!searchId.trim()) {
      setSearchResult(null);
      return;
    }

    setSearchLoading(true);
    try {
      // Get expanded user details with family and parent information
      const result = await userService.getUserById(searchId.trim(), true);
      
      // Check if it's a User role
      if (result.roles && result.roles.includes('User')) {
        setSearchResult(result);
        setPage(0);
        
        toast.success(`Tìm thấy người dùng: ${result.fullName}`, {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        throw new Error('Người dùng này không phải là User');
      }
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

  const handleCreateFamilyAccount = () => {
    setDialogMode('createFamily');
    setSelectedUser(null);
    setOpenDialog(true);
  };

  const handleEditUser = async (user) => {
    setDialogMode('editFamily');
    setActionLoading(true);
    
    try {
      // Get expanded user details with family and parent information
      const expandedUser = await userService.getUserById(user.id, true);
      console.log('🔍 Expanded User Data:', expandedUser);
      console.log('🔍 User fields:', {
        user: expandedUser?.user,
        fullName: expandedUser?.user?.fullName || expandedUser?.fullName,
        email: expandedUser?.user?.email || expandedUser?.email,
        phoneNumber: expandedUser?.user?.phoneNumber || expandedUser?.phoneNumber,
        family: expandedUser?.family,
        parents: expandedUser?.parents
      });
      setSelectedUser(expandedUser);
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
      title: 'Xác nhận xóa tài khoản gia đình',
      description: `Bạn có chắc chắn muốn xóa tài khoản gia đình "${user.fullName}"? Hành động này không thể hoàn tác.`,
      onConfirm: () => performDeleteUser(user.id)
    });
  };

  const performDeleteUser = async (userId) => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
    setActionLoading(true);
    
    try {
      // Call the delete family account service
      await userService.deleteFamilyAccount(userId);
      
      toast.success('Xóa tài khoản gia đình thành công!', {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Reload the user list
      await loadUsers();
      
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
    if (dialogMode === 'createFamily') {
      // Direct create for family account
      await performCreateFamilyAccount(data);
    } else if (dialogMode === 'editFamily') {
      // Update family account
      await performUpdateFamilyAccount(data);
    } else {
      // Direct update for editing user
      await performUpdateUser(data);
    }
  };


  const performCreateFamilyAccount = async (data) => {
    setActionLoading(true);
    
    try {
      await userService.createFamilyAccount(data);
      toast.success(`Tạo tài khoản gia đình thành công!`, {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Reload data
      await loadUsers();
      
      setOpenDialog(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tạo tài khoản gia đình';
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

  const performUpdateFamilyAccount = async (data) => {
    setActionLoading(true);
    
    try {
      // Add parentUserId to the data for update
      const updateData = {
        ...data,
        parentUserId: selectedUser?.id || selectedUser?.userId
      };
      
      await userService.updateFamilyAccount(selectedUser?.id || selectedUser?.userId, updateData);
      toast.success(`Cập nhật tài khoản gia đình thành công!`, {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Reload data
      await loadUsers();
      
      setOpenDialog(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi cập nhật tài khoản gia đình';
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
      // Note: This would need to be implemented in the backend
      // For now, we'll show a message that this feature is not available
      toast.error('Chức năng cập nhật tài khoản User chưa được hỗ trợ', {
        position: "top-right",
        autoClose: 4000,
      });
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
    <>
      {isLoading && <Loading />}
      <div className={styles.container}>
      
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          Quản lý Tài khoản User
        </h1>
        <Button
          variant="contained"
          startIcon={<FamilyIcon />}
          onClick={handleCreateFamilyAccount}
          className={styles.addButton}
        >
          Tạo Tài Khoản Gia Đình
        </Button>
      </div>

      {/* Search Section */}
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
          loading={isLoading}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={searchResult ? 1 : totalCount}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          emptyMessage={searchResult ? "Không có người dùng nào." : "Không có tài khoản User nào. Hãy tạo tài khoản đầu tiên để bắt đầu."}
        />
      </div>

      {/* Create/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => !actionLoading && setOpenDialog(false)} 
        maxWidth="xl" 
        fullWidth
        fullScreen={false}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '8px',
            overflow: 'hidden',
            width: '95vw',
            height: '90vh',
            maxWidth: 'none'
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
            <FamilyIcon />
            <span>
              {dialogMode === 'createFamily' ? 'Tạo Tài Khoản Gia Đình' : 
               'Cập Nhật Tài Khoản Gia Đình'}
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
        <DialogContent 
          sx={{ 
            padding: '24px',
            overflow: 'auto',
            maxHeight: 'calc(90vh - 120px)'
          }}
        >
          <div style={{ paddingTop: '8px' }}>
            {dialogMode === 'createFamily' ? (
              <FamilyAccountForm 
                onSubmit={handleFormSubmit}
                loading={actionLoading}
                onCancel={() => setOpenDialog(false)}
              />
            ) : (
              <FamilyAccountForm 
                onSubmit={handleFormSubmit}
                loading={actionLoading}
                defaultValues={{
                  user: {
                    fullName: selectedUser?.user?.fullName || selectedUser?.fullName || '',
                    email: selectedUser?.user?.email || selectedUser?.email || '',
                    phoneNumber: selectedUser?.user?.phoneNumber || selectedUser?.phoneNumber || '',
                    password: ''
                  },
                  family: {
                    address: selectedUser?.family?.address || '',
                    phone: selectedUser?.family?.phone || '',
                    emergencyContactName: selectedUser?.family?.emergencyContactName || '',
                    emergencyContactPhone: selectedUser?.family?.emergencyContactPhone || '',
                    note: selectedUser?.family?.note || ''
                  },
                  parents: selectedUser?.parents || [{
                    parentName: '',
                    email: '',
                    address: '',
                    phone: '',
                    relationshipToStudent: 'father',
                    note: ''
                  }]
                }}
                isEditMode={true}
                onCancel={() => setOpenDialog(false)}
              />
            )}
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

      </div>
    </>
  );
};

export default UserManagement;
