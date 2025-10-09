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
  Add as AddIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import DataTable from '../../../components/Common/DataTable';
import Form from '../../../components/Common/Form';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import { branchSchema } from '../../../utils/validationSchemas';
import branchService from '../../../services/branch.service';
import { useApp } from '../../../contexts/AppContext';
import { useLoading } from '../../../hooks/useLoading';
import Loading from '../../../components/Common/Loading';
import { toast } from 'react-toastify';

const BranchManagement = () => {
  const [branches, setBranches] = useState([]);
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
  const [selectedBranch, setSelectedBranch] = useState(null);
  
  // Confirm dialog states
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    onConfirm: null
  });
  
  // Global state
  const { showGlobalError, addNotification } = useApp();
  const { isLoading: isPageLoading, showLoading, hideLoading } = useLoading(1500); // Only for page load

  // Define table columns
  const columns = [
    {
      key: 'branchName',
      header: 'Tên Chi Nhánh',
      render: (value, item) => (
        <Box display="flex" alignItems="center" gap={1}>
          <BusinessIcon fontSize="small" color="primary" />
          <Typography variant="subtitle2" fontWeight="medium">
            {value}
          </Typography>
        </Box>
      )
    },
    {
      key: 'address',
      header: 'Địa Chỉ',
      render: (value) => (
        <Typography variant="body2" color="text.secondary">
          {value}
        </Typography>
      )
    },
    {
      key: 'phone',
      header: 'Số Điện Thoại',
      render: (value) => (
        <Typography variant="body2">
          {value}
        </Typography>
      )
    }
  ];

  // Load branches with pagination
  const loadBranches = async () => {
    showLoading();
    setError(null);
    try {
      const response = await branchService.getBranchesPaged({
        page: page + 1, // Backend uses 1-based indexing
        pageSize: rowsPerPage
      });
      
      // Handle both paginated and non-paginated responses
      if (response.items) {
        // Paginated response
        setBranches(response.items);
        setTotalCount(response.totalCount || response.items.length);
      } else {
        // Non-paginated response (fallback)
        setBranches(response);
        setTotalCount(response.length);
      }
    } catch (err) {
      const errorMessage = err.message || 'Có lỗi xảy ra khi tải danh sách chi nhánh';
      setError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      hideLoading();
    }
  };

  // Load branches when page or rowsPerPage changes
  useEffect(() => {

    loadBranches();
  }, [page, rowsPerPage]);

  // Use search result if available, otherwise use paginated branches
  const displayBranches = searchResult ? [searchResult] : branches;
  const paginatedBranches = displayBranches;

  // Event handlers
  const handleSearchById = async () => {
    if (!searchId.trim()) {
      setSearchResult(null);
      return;
    }

    setSearchLoading(true);
    try {
      const result = await branchService.getBranchById(searchId.trim());
      setSearchResult(result);
      setPage(0);
      
      toast.success(`Tìm thấy chi nhánh: ${result.branchName}`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Không tìm thấy chi nhánh với ID này';
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

  const handleCreateBranch = () => {
    setDialogMode('create');
    setSelectedBranch(null);
    setOpenDialog(true);
  };

  const handleEditBranch = (branch) => {
    setDialogMode('edit');
    setSelectedBranch(branch);
    setOpenDialog(true);
  };

  const handleDeleteBranch = (branch) => {
    setConfirmDialog({
      open: true,
      title: 'Xác nhận xóa chi nhánh',
      description: `Bạn có chắc chắn muốn xóa chi nhánh "${branch.branchName}"? Hành động này không thể hoàn tác.`,
      onConfirm: () => performDeleteBranch(branch.id)
    });
  };

  const performDeleteBranch = async (branchId) => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
    setActionLoading(true);
    
    try {
      await branchService.deleteBranch(branchId);
      
      // Reload data without showing loading page
      const response = await branchService.getBranchesPaged({
        page: page + 1,
        pageSize: rowsPerPage
      });
      
      if (response.items) {
        setBranches(response.items);
        setTotalCount(response.totalCount || response.items.length);
      } else {
        setBranches(response);
        setTotalCount(response.length);
      }
      
      toast.success(`Xóa chi nhánh thành công!`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi xóa chi nhánh';
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
        await branchService.createBranch(data);
        toast.success(`Tạo chi nhánh "${data.branchName}" thành công!`, {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        await branchService.updateBranch(selectedBranch.id, data);
        toast.success(`Cập nhật chi nhánh "${data.branchName}" thành công!`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
      
      // Reload data without showing loading page
      const response = await branchService.getBranchesPaged({
        page: page + 1,
        pageSize: rowsPerPage
      });
      
      if (response.items) {
        setBranches(response.items);
        setTotalCount(response.totalCount || response.items.length);
      } else {
        setBranches(response);
        setTotalCount(response.length);
      }
      
      setOpenDialog(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 
        (dialogMode === 'create' ? 'Có lỗi xảy ra khi tạo chi nhánh' : 'Có lỗi xảy ra khi cập nhật chi nhánh');
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
      {isPageLoading && <Loading />}
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Quản lý Chi Nhánh
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateBranch}
        >
         Thêm Chi Nhánh
        </Button>
      </Box>

      {/* Search by ID */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Nhập ID chi nhánh để tìm kiếm..."
            value={searchId}
            onChange={handleSearchIdChange}
            sx={{ minWidth: 300 }}
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
          >
            {searchLoading ? 'Đang tìm...' : 'Tìm theo ID'}
          </Button>
          {searchResult && (
            <Button
              variant="outlined"
              onClick={handleClearSearch}
            >
              Xóa tìm kiếm
            </Button>
          )}
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
        data={paginatedBranches}
        columns={columns}
        loading={isPageLoading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={searchResult ? 1 : totalCount}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onEdit={handleEditBranch}
        onDelete={handleDeleteBranch}
        emptyMessage={searchResult ? "Không có chi nhánh nào." : "Không có chi nhánh nào. Hãy thêm chi nhánh đầu tiên để bắt đầu."}
      />

      {/* Create/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => !actionLoading && setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'create' ? 'Thêm Chi Nhánh mới' : 'Chỉnh sửa Chi Nhánh'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Form
              schema={branchSchema}
              defaultValues={{
                branchName: selectedBranch?.branchName || '',
                address: selectedBranch?.address || '',
                phone: selectedBranch?.phone || ''
              }}
              onSubmit={handleFormSubmit}
              submitText={dialogMode === 'create' ? 'Tạo Chi Nhánh' : 'Cập nhật Chi Nhánh'}
              loading={actionLoading}
              disabled={actionLoading}
              fields={[
                { 
                  name: 'branchName', 
                  label: 'Tên Chi Nhánh', 
                  type: 'text', 
                  required: true, 
                  placeholder: 'Ví dụ: Chi nhánh Quận 1, Chi nhánh Thủ Đức',
                  disabled: actionLoading
                },
                { 
                  name: 'address', 
                  label: 'Địa Chỉ', 
                  type: 'text', 
                  required: true, 
                  placeholder: 'Địa chỉ đầy đủ của chi nhánh',
                  disabled: actionLoading
                },
                { 
                  name: 'phone', 
                  label: 'Số Điện Thoại', 
                  type: 'text', 
                  required: true, 
                  placeholder: 'Ví dụ: 0123456789',
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

export default BranchManagement;

