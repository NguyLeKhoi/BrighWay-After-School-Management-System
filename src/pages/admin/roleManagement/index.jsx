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
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import DataTable from '../../../components/Common/DataTable';
import Form from '../../../components/Common/Form';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import { roleSchema } from '../../../utils/validationSchemas';
import roleService from '../../../services/role.service';
import { useApp } from '../../../contexts/AppContext';
import useContentLoading from '../../../hooks/useContentLoading';
import ContentLoading from '../../../components/Common/ContentLoading';
import { toast } from 'react-toastify';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedRole, setSelectedRole] = useState(null);
  
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

  // Define table columns
  const columns = [
    {
      key: 'name',
      header: 'Tên Role',
      render: (value) => {
        const getRoleColor = (roleName) => {
          switch (roleName.toLowerCase()) {
            case 'admin': return 'error';
            case 'manager': return 'warning';
            case 'teacher': return 'success';
            case 'staff': return 'info';
            case 'parent': return 'primary';
            case 'student': return 'secondary';
            default: return 'default';
          }
        };
        return (
          <Chip 
            label={value} 
            color={getRoleColor(value)}
            size="small"
          />
        );
      }
    },
    {
      key: 'description',
      header: 'Mô tả',
      render: (value) => value || '-'
    },
    {
      key: 'normalizedName',
      header: 'Normalized Name',
      render: (value) => (
        <Typography variant="body2" color="text.secondary">
          {value}
        </Typography>
      )
    },
    {
      key: 'id',
      header: 'ID',
      render: (value) => (
        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
          {value.substring(0, 8)}...
        </Typography>
      )
    }
  ];

  // Load roles
  const loadRoles = async () => {
    showLoading();
    setError(null);
    try {
      const response = await roleService.getAllRoles();
      setRoles(response);
    } catch (err) {
      const errorMessage = err.message || 'Có lỗi xảy ra khi tải danh sách roles';
      setError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  // Filter roles
  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const paginatedRoles = filteredRoles.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Event handlers
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreateRole = () => {
    setDialogMode('create');
    setSelectedRole(null);
    setOpenDialog(true);
  };

  const handleEditRole = (role) => {
    setDialogMode('edit');
    setSelectedRole(role);
    setOpenDialog(true);
  };

  const handleDeleteRole = (role) => {
    setConfirmDialog({
      open: true,
      title: 'Xác nhận xóa role',
      description: `Bạn có chắc chắn muốn xóa role "${role.name}"? Hành động này không thể hoàn tác.`,
      onConfirm: () => performDeleteRole(role.id)
    });
  };

  const performDeleteRole = async (roleId) => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
    setActionLoading(true);
    
    try {
      await roleService.deleteRole(roleId);
      
      // Reload data without showing loading page
      const response = await roleService.getAllRoles();
      setRoles(response);
      
      toast.success(`Xóa role thành công!`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi xóa role';
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
    setActionLoading(true);
    
    try {
      if (dialogMode === 'create') {
        await roleService.createRole(data);
        toast.success(`Tạo role "${data.name}" thành công!`, {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        await roleService.updateRole(selectedRole.id, data);
        toast.success(`Cập nhật role "${data.name}" thành công!`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
      
      // Reload data without showing loading page
      const response = await roleService.getAllRoles();
      setRoles(response);
      
      setOpenDialog(false);
      
    } catch (err) {
      let errorMessage = 'Có lỗi xảy ra khi lưu role';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.title) {
        errorMessage = err.response.data.title;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
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
    <Box>
      {isPageLoading && <ContentLoading isLoading={isPageLoading} text={loadingText} />}
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Quản lý Roles
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateRole}
        >
          Thêm Role
        </Button>
      </Box>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Tìm kiếm role..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <DataTable
        data={paginatedRoles}
        columns={columns}
        loading={isPageLoading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={filteredRoles.length}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onEdit={handleEditRole}
        onDelete={handleDeleteRole}
        emptyMessage="Không có role nào. Hãy thêm role đầu tiên để bắt đầu."
      />

      {/* Create/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => !actionLoading && setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'create' ? 'Thêm Role mới' : 'Chỉnh sửa Role'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Form
              schema={roleSchema}
              defaultValues={{
                name: selectedRole?.name || '',
                description: selectedRole?.description || ''
              }}
              onSubmit={handleFormSubmit}
              submitText={dialogMode === 'create' ? 'Tạo Role' : 'Cập nhật Role'}
              loading={actionLoading}
              disabled={actionLoading}
              fields={[
                { 
                  name: 'name', 
                  label: 'Tên Role', 
                  type: 'text', 
                  required: true, 
                  placeholder: 'Ví dụ: Admin, Teacher, Student',
                  disabled: actionLoading
                },
                { 
                  name: 'description', 
                  label: 'Mô tả', 
                  type: 'textarea', 
                  placeholder: 'Mô tả chi tiết về role này',
                  disabled: actionLoading
                }
              ]}
            />
          </Box>
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
    </Box>
  );
};

export default RoleManagement;
