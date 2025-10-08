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
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import RoleTable from '../../../components/Common/RoleTable';
import Form from '../../../components/Common/Form';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import { roleSchema } from '../../../utils/validationSchemas';
import roleService from '../../../services/role.service';
import { useApp } from '../../../contexts/AppContext';
import { useLoading } from '../../../hooks/useLoading';
import Loading from '../../Loading';
import { toast } from 'react-toastify';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
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
  const { isLoading: isPageLoading, showLoading, hideLoading } = useLoading();

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
    setLoading(true);
    
    try {
      await roleService.deleteRole(roleId);
      await loadRoles();
      toast.success(`Xóa role thành công!`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi xóa role';
      setError(errorMessage);
      showGlobalError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (data) => {
    setLoading(true);
    showLoading();
    
    try {
      if (dialogMode === 'create') {
        await roleService.createRole(data);
        toast.success(`Tạo role "${data.name}" thành công!`, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        await roleService.updateRole(selectedRole.id, data);
        toast.success(`Cập nhật role "${data.name}" thành công!`, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
      
      setOpenDialog(false);
      setSelectedRole(null);
      await loadRoles(); // Reload the list
      
    } catch (err) {
      
      // Handle different types of errors
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
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  return (
    <Box>
      {isPageLoading && <Loading />}
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
      <RoleTable
        roles={paginatedRoles}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={filteredRoles.length}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onEdit={handleEditRole}
        onDelete={handleDeleteRole}
      />

      {/* Create/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => !loading && setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'create' ? 'Thêm Role mới' : 'Chỉnh sửa Role'}
          {loading && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Đang xử lý...
            </Typography>
          )}
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
              loading={loading}
              disabled={loading}
              fields={[
                { 
                  name: 'name', 
                  label: 'Tên Role', 
                  type: 'text', 
                  required: true, 
                  placeholder: 'Ví dụ: Admin, Teacher, Student',
                  disabled: loading
                },
                { 
                  name: 'description', 
                  label: 'Mô tả', 
                  type: 'textarea', 
                  placeholder: 'Mô tả chi tiết về role này',
                  disabled: loading
                }
              ]}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDialog(false)} 
            disabled={loading}
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
