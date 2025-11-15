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
  Chip
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  AssignmentInd as RoleIcon
} from '@mui/icons-material';
import DataTable from '../../../components/Common/DataTable';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
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
  const [currentUserBranchId, setCurrentUserBranchId] = useState(null);
  
  // Dialog states
  const [openParentDialog, setOpenParentDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [parentFormData, setParentFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  
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
      case 'User': return 4;
      default: return 4; // Default to User
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
  const loadUsers = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) {
      showLoading();
    }
    setError(null);
    try {
      const params = {
        pageIndex: page + 1, // Backend uses 1-based indexing
        pageSize: rowsPerPage,
        Role: 'User' // Staff only views User accounts
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

  // Load current user branchId and users when component mounts
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const currentUser = await userService.getCurrentUser();
        if (currentUser?.branchId) {
          setCurrentUserBranchId(currentUser.branchId);
        }
      } catch (err) {
        // Silently fail - branchId will be null
      }
    };
    
    loadCurrentUser();
    setSearchResult(null); // Clear any existing search result
    loadUsers();
  }, []);

  // Load users when page, rowsPerPage changes
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
    setPage(0); // Reset to first page when keyword changes
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

  const handleCreateParent = () => {
    setParentFormData({
      name: '',
      email: '',
      password: ''
    });
    setOpenParentDialog(true);
  };

  const handleCreateParentSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUserBranchId) {
      toast.error('Không thể lấy thông tin chi nhánh. Vui lòng thử lại sau.', {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    if (!parentFormData.name || !parentFormData.email || !parentFormData.password) {
      toast.error('Vui lòng điền đầy đủ thông tin', {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    setActionLoading(true);
    try {
      await userService.createParent({
        name: parentFormData.name,
        email: parentFormData.email,
        password: parentFormData.password,
        branchId: currentUserBranchId
      });
      
      toast.success('Tạo tài khoản phụ huynh thành công!', {
        position: "top-right",
        autoClose: 3000,
      });
      
      setOpenParentDialog(false);
      setParentFormData({ name: '', email: '', password: '' });
      await loadUsers();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tạo tài khoản phụ huynh';
      showGlobalError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = async (user) => {
    // Edit functionality removed - only create parent account is available
    toast.info('Chức năng chỉnh sửa tài khoản chưa được hỗ trợ', {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const handleDeleteUser = (user) => {
    const userName = user.name || user.fullName || user.email || 'người dùng này';
    setConfirmDialog({
      open: true,
      title: 'Xác nhận xóa tài khoản gia đình',
      description: `Bạn có chắc chắn muốn xóa tài khoản gia đình "${userName}"? Hành động này không thể hoàn tác.`,
      highlightText: userName,
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
      
      // If we're deleting the last item on current page and not on first page, go to previous page
      if (users.length === 1 && page > 0) {
        setPage(page - 1);
      }
      
      // Reload the user list
      await loadUsers(false);
      
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
          startIcon={<PersonIcon />}
          onClick={handleCreateParent}
          className={styles.addButton}
          sx={{ bgcolor: '#28a745', '&:hover': { bgcolor: '#218838' } }}
        >
          Tạo Tài Khoản Phụ Huynh
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

      {/* Create Parent Dialog */}
      <Dialog 
        open={openParentDialog} 
        onClose={() => !actionLoading && setOpenParentDialog(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle 
          sx={{
            backgroundColor: '#28a745',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon />
            <span>Tạo Tài Khoản Phụ Huynh</span>
          </Box>
          <Button
            onClick={() => setOpenParentDialog(false)}
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
        <DialogContent sx={{ padding: '24px' }}>
          <form onSubmit={handleCreateParentSubmit}>
            <TextField
              fullWidth
              label="Họ và Tên"
              value={parentFormData.name}
              onChange={(e) => setParentFormData({ ...parentFormData, name: e.target.value })}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={parentFormData.email}
              onChange={(e) => setParentFormData({ ...parentFormData, email: e.target.value })}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Mật khẩu"
              type="password"
              value={parentFormData.password}
              onChange={(e) => setParentFormData({ ...parentFormData, password: e.target.value })}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            {currentUserBranchId && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Tài khoản sẽ được tạo cho chi nhánh của bạn
              </Alert>
            )}
            {!currentUserBranchId && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Không thể lấy thông tin chi nhánh. Vui lòng liên hệ quản trị viên.
              </Alert>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
              <Button
                onClick={() => setOpenParentDialog(false)}
                disabled={actionLoading}
                variant="outlined"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={actionLoading || !currentUserBranchId}
                sx={{ bgcolor: '#28a745', '&:hover': { bgcolor: '#218838' } }}
              >
                {actionLoading ? 'Đang tạo...' : 'Tạo Tài Khoản'}
              </Button>
            </Box>
          </form>
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
