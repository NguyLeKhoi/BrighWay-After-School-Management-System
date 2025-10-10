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
  AssignmentInd as RoleIcon
} from '@mui/icons-material';
import DataTable from '../../../components/Common/DataTable';
import Form from '../../../components/Common/Form';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import { createUserSchema, updateUserSchema } from '../../../utils/validationSchemas';
import userService from '../../../services/user.service';
import { useApp } from '../../../contexts/AppContext';
import useContentLoading from '../../../hooks/useContentLoading';
import ContentLoading from '../../../components/Common/ContentLoading';
import { toast } from 'react-toastify';
import styles from './UserManagement.module.css';

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

  // User creation confirmation dialog states
  const [confirmCreateDialog, setConfirmCreateDialog] = useState({
    open: false,
    userData: null
  });
  
  // Global state
  const { showGlobalError, addNotification } = useApp();
  const { isLoading: isPageLoading, loadingText, showLoading, hideLoading } = useContentLoading(1500); // Only for page load

  // Role options based on API documentation (0, 1, 2, 3, 4)
  const roleOptions = [
    { value: 0, label: 'Admin' },
    { value: 1, label: 'Manager' },
    { value: 2, label: 'Staff' },
    { value: 3, label: 'Parent' },
    { value: 4, label: 'Student' }
  ];

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
      key: 'role',
      header: 'Vai Trò',
      render: (value, item) => {
        const roleName = roleOptions.find(role => role.value === value)?.label || 'Unknown';
        return (
          <Chip 
            label={roleName} 
            color="info" 
            size="small"
            variant="outlined"
            icon={<RoleIcon fontSize="small" />}
          />
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

  // Load users with pagination
  const loadUsers = async () => {
    showLoading();
    setError(null);
    try {
      const response = await userService.getUsersPaged({
        page: page + 1, // Backend uses 1-based indexing
        pageSize: rowsPerPage
      });
      
      // Handle both paginated and non-paginated responses
      if (response.items) {
        // Paginated response
        setUsers(response.items);
        setTotalCount(response.totalCount || response.items.length);
      } else {
        // Non-paginated response (fallback)
        setUsers(response);
        setTotalCount(response.length);
      }
    } catch (err) {
      const errorMessage = err.message || 'Có lỗi xảy ra khi tải danh sách người dùng';
      setError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      hideLoading();
    }
  };

  // Load users when page or rowsPerPage changes
  useEffect(() => {
    loadUsers();
  }, [page, rowsPerPage]);

  // Use search result if available, otherwise use paginated users
  const displayUsers = searchResult ? [searchResult] : users;
  const paginatedUsers = displayUsers;

  // Event handlers
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

  const handleClearSearch = () => {
    setSearchId('');
    setSearchResult(null);
    setPage(0);
  };

  const handleSearchIdChange = (event) => {
    setSearchId(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreateUser = () => {
    setDialogMode('create');
    setSelectedUser(null);
    setOpenDialog(true);
  };

  const handleEditUser = (user) => {
    setDialogMode('edit');
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
    if (dialogMode === 'create') {
      // Show confirmation dialog for creating user
      setConfirmCreateDialog({
        open: true,
        userData: data
      });
    } else {
      // Direct update for editing user
      await performUpdateUser(data);
    }
  };

  const handleConfirmCreate = async () => {
    setConfirmCreateDialog(prev => ({ ...prev, open: false }));
    await performCreateUser(confirmCreateDialog.userData);
  };

  const handleCancelCreate = () => {
    setConfirmCreateDialog({
      open: false,
      userData: null
    });
  };

  const performCreateUser = async (data) => {
    setActionLoading(true);
    
    try {
      await userService.createUser(data, data.role);
      toast.success(`Tạo tài khoản "${data.fullName}" thành công!`, {
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

  return (
    <div className={styles.container}>
      {isPageLoading && <ContentLoading isLoading={isPageLoading} text={loadingText} />}
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          Quản lý Người Dùng
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

      {/* Search by ID */}
      <Paper className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <TextField
            placeholder="Nhập ID người dùng để tìm kiếm..."
            value={searchId}
            onChange={handleSearchIdChange}
            className={styles.searchField}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearchById();
              }
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearchById}
            disabled={!searchId.trim() || searchLoading}
            className={styles.searchButton}
          >
            {searchLoading ? 'Đang tìm...' : 'Tìm theo ID'}
          </Button>
          {searchResult && (
            <Button
              variant="outlined"
              onClick={handleClearSearch}
              className={styles.clearButton}
            >
              Xóa tìm kiếm
            </Button>
          )}
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
      >
        <DialogTitle className={styles.dialogTitle}>
          <span className={styles.dialogTitleText}>
            {dialogMode === 'create' ? 'Tạo Tài Khoản Mới' : 'Chỉnh sửa Thông Tin Người Dùng'}
          </span>
        </DialogTitle>
        <DialogContent className={styles.dialogContent}>
          {dialogMode === 'edit' && (
            <Alert severity="info" style={{ marginBottom: '16px' }}>
              <span>
                <strong>Lưu ý:</strong> Chỉ có thể cập nhật <strong>Họ và Tên</strong> và <strong>Số Điện Thoại</strong>. 
                Email và Vai trò không thể thay đổi sau khi tạo tài khoản.
              </span>
            </Alert>
          )}
          <div style={{ paddingTop: '8px' }}>
            <Form
              schema={dialogMode === 'create' ? createUserSchema : updateUserSchema}
              defaultValues={{
                fullName: selectedUser?.fullName || '',
                ...(dialogMode === 'create' ? {
                  email: selectedUser?.email || '',
                  phoneNumber: selectedUser?.phoneNumber || '',
                  password: '',
                  role: selectedUser?.role || 0
                } : {
                  phoneNumber: selectedUser?.phoneNumber || ''
                })
              }}
              onSubmit={handleFormSubmit}
              submitText={dialogMode === 'create' ? 'Tạo Tài Khoản' : 'Cập nhật Thông Tin'}
              loading={actionLoading}
              disabled={actionLoading}
              fields={dialogMode === 'create' ? [
                { 
                  name: 'fullName', 
                  label: 'Họ và Tên', 
                  type: 'text', 
                  required: true, 
                  placeholder: 'Ví dụ: Nguyễn Văn A',
                  disabled: actionLoading
                },
                { 
                  name: 'email', 
                  label: 'Email', 
                  type: 'email', 
                  required: true, 
                  placeholder: 'Ví dụ: email@example.com',
                  disabled: actionLoading
                },
                { 
                  name: 'phoneNumber', 
                  label: 'Số Điện Thoại', 
                  type: 'text', 
                  required: true, 
                  placeholder: 'Ví dụ: 0901234567',
                  disabled: actionLoading
                },
                { 
                  name: 'password', 
                  label: 'Mật Khẩu', 
                  type: 'password', 
                  required: true, 
                  placeholder: 'Nhập mật khẩu cho người dùng',
                  disabled: actionLoading
                },
                { 
                  name: 'role', 
                  label: 'Vai Trò', 
                  type: 'select', 
                  required: true, 
                  options: roleOptions,
                  disabled: actionLoading
                }
              ] : [
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

      {/* User Creation Confirmation Dialog */}
      <Dialog 
        open={confirmCreateDialog.open} 
        onClose={handleCancelCreate} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <PersonIcon color="primary" />
            <Typography variant="h6" component="span">
              Xác nhận tạo tài khoản
            </Typography>
          </Box>
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
                    color="primary" 
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
        <DialogActions>
          <Button 
            onClick={handleCancelCreate}
            disabled={actionLoading}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleConfirmCreate}
            variant="contained"
            color="primary"
            disabled={actionLoading}
            startIcon={actionLoading ? null : <PersonIcon />}
          >
            {actionLoading ? 'Đang tạo...' : 'Xác nhận tạo tài khoản'}
          </Button>
        </DialogActions>
      </Dialog>
      </div>
    </div>
  );
};

export default UserManagement;
