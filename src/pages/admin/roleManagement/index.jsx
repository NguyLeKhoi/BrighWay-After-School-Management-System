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
import roleService from '../../../services/role.service';

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
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // Load roles
  const loadRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await roleService.getAllRoles();
      setRoles(response);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tải danh sách roles');
    } finally {
      setLoading(false);
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
    setFormData({ name: '', description: '' });
    setOpenDialog(true);
  };

  const handleEditRole = (role) => {
    setDialogMode('edit');
    setSelectedRole(role);
    setFormData({
      name: role.name || '',
      description: role.description || ''
    });
    setOpenDialog(true);
  };

  const handleDeleteRole = async (roleId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa role này?')) {
      try {
        await roleService.deleteRole(roleId);
        loadRoles();
      } catch (err) {
        setError(err.message || 'Có lỗi xảy ra khi xóa role');
      }
    }
  };

  const handleFormSubmit = async () => {
    try {
      if (dialogMode === 'create') {
        await roleService.createRole(formData);
      } else {
        await roleService.updateRole(selectedRole.id, formData);
      }
      setOpenDialog(false);
      loadRoles();
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi lưu role');
    }
  };

  const handleFormChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  return (
    <Box>
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
            <TextField
              fullWidth
              label="Tên Role"
              value={formData.name}
              onChange={handleFormChange('name')}
              margin="normal"
              required
              placeholder="Ví dụ: Admin, Teacher, Student"
            />
            <TextField
              fullWidth
              label="Mô tả"
              value={formData.description}
              onChange={handleFormChange('description')}
              margin="normal"
              multiline
              rows={3}
              placeholder="Mô tả chi tiết về role này"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Hủy
          </Button>
          <Button onClick={handleFormSubmit} variant="contained">
            {dialogMode === 'create' ? 'Tạo' : 'Cập nhật'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoleManagement;
