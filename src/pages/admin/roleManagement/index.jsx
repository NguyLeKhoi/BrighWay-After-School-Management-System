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
import { roleSchema } from '../../../utils/validationSchemas';
import roleService from '../../../services/role.service';
import { useApp } from '../../../contexts/AppContext';
import { useLoading } from '../../../hooks/useLoading';
import Loading from '../../Loading';

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

  const handleDeleteRole = async (roleId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa role này?')) {
      try {
        await roleService.deleteRole(roleId);
        loadRoles();
        addNotification({
          message: 'Xóa role thành công',
          severity: 'success'
        });
      } catch (err) {
        const errorMessage = err.message || 'Có lỗi xảy ra khi xóa role';
        setError(errorMessage);
        showGlobalError(errorMessage);
      }
    }
  };

  const handleFormSubmit = async (data) => {
    showLoading();
    try {
      if (dialogMode === 'create') {
        await roleService.createRole(data);
        addNotification({
          message: 'Tạo role thành công',
          severity: 'success'
        });
      } else {
        await roleService.updateRole(selectedRole.id, data);
        addNotification({
          message: 'Cập nhật role thành công',
          severity: 'success'
        });
      }
      setOpenDialog(false);
      loadRoles();
    } catch (err) {
      const errorMessage = err.message || 'Có lỗi xảy ra khi lưu role';
      setError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
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
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadRoles}
            disabled={loading}
          >
            Tải lại
          </Button>
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
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
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
              submitText={dialogMode === 'create' ? 'Tạo' : 'Cập nhật'}
              loading={loading}
              fields={[
                { name: 'name', label: 'Tên Role', type: 'text', required: true, placeholder: 'Ví dụ: Admin, Teacher, Student' },
                { name: 'description', label: 'Mô tả', type: 'textarea', placeholder: 'Mô tả chi tiết về role này' }
              ]}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default RoleManagement;
