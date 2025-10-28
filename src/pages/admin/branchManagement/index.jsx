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
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import DataTable from '../../../components/Common/DataTable';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import branchService from '../../../services/branch.service';
import useLocationData from '../../../hooks/useLocationData';
import { useApp } from '../../../contexts/AppContext';
import useContentLoading from '../../../hooks/useContentLoading';
import ContentLoading from '../../../components/Common/ContentLoading';
import { toast } from 'react-toastify';
import styles from './BranchManagement.module.css';

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
  const { isLoading: isPageLoading, loadingText, showLoading, hideLoading } = useContentLoading(1500); // Only for page load
  
  // Location data
  const {
    provinces,
    districts,
    selectedProvinceId,
    isLoading: locationLoading,
    error: locationError,
    handleProvinceChange,
    getProvinceOptions,
    getDistrictOptions
  } = useLocationData();

  const [provinceId, setProvinceId] = useState('');
  const [districtId, setDistrictId] = useState('');

  // Handle province change
  useEffect(() => {
    if (provinceId) {
      handleProvinceChange(provinceId);
      // Only clear districtId if it's not from edit mode (selectedBranch)
      if (!selectedBranch) {
        setDistrictId(''); // Clear district when province changes
      }
    }
  }, [provinceId, handleProvinceChange, selectedBranch]);

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
      render: (value, item) => {
        const fullAddress = [
          item.address,
          item.districtName,
          item.provinceName
        ].filter(Boolean).join(', ');
        
        return (
          <Typography variant="body2" color="text.secondary">
            {fullAddress || value}
          </Typography>
        );
      }
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
    setProvinceId('');
    setDistrictId('');
    setOpenDialog(true);
  };

  const handleEditBranch = (branch) => {
    setDialogMode('edit');
    setSelectedBranch(branch);
    
    // Find provinceId from districtId
    if (branch?.districtId) {
      // Search through all provinces to find which one contains this district
      let foundProvinceId = '';
      for (const province of provinces) {
        if (province.districts && province.districts.some(d => d.id === branch.districtId)) {
          foundProvinceId = province.id;
          break;
        }
      }
      setProvinceId(foundProvinceId);
      setDistrictId(branch.districtId);
    } else {
      setProvinceId('');
      setDistrictId('');
    }
    
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
      // Only send districtId to API, not provinceId
      const submitData = {
        branchName: data.branchName,
        address: data.address,
        phone: data.phone,
        districtId: data.districtId
      };
      
      if (dialogMode === 'create') {
        await branchService.createBranch(submitData);
        toast.success(`Tạo chi nhánh "${data.branchName}" thành công!`, {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        await branchService.updateBranch(selectedBranch.id, submitData);
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
    <div className={styles.container}>
      {isPageLoading && <ContentLoading isLoading={isPageLoading} text={loadingText} />}
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          Quản lý Chi Nhánh
        </h1>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateBranch}
          className={styles.addButton}
        >
         Thêm Chi Nhánh
        </Button>
      </div>

      {/* Search by ID */}
      <Paper className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <TextField
            placeholder="Nhập ID chi nhánh để tìm kiếm..."
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
        maxWidth="md" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '8px',
            overflow: 'hidden',
            maxWidth: '800px'
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
              {dialogMode === 'create' ? 'Thêm Chi Nhánh mới' : 'Chỉnh sửa Chi Nhánh'}
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
          className={styles.dialogContent}
          sx={{ 
            padding: '24px !important',
            paddingTop: '32px !important'
          }}
        >
          <Box component="form" id="branch-form">
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {/* Branch Name */}
              <Grid item xs={12}>
                <TextField
                  name="branchName"
                  label="Tên Chi Nhánh"
                  required
                  fullWidth
                  placeholder="Ví dụ: Chi nhánh Quận 1, Chi nhánh Thủ Đức"
                  defaultValue={selectedBranch?.branchName || ''}
                  disabled={actionLoading}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { fontSize: '14px' }
                  }}
                />
              </Grid>

              {/* Province */}
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel sx={{ fontSize: '14px' }}>Tỉnh/Thành Phố</InputLabel>
                  <Select
                    value={provinceId}
                    onChange={(e) => setProvinceId(e.target.value)}
                    label="Tỉnh/Thành Phố"
                    disabled={actionLoading || locationLoading}
                    sx={{ fontSize: '14px' }}
                    MenuProps={{
                      PaperProps: {
                        style: { maxHeight: 250 }
                      }
                    }}
                  >
                    <MenuItem value="">Chọn tỉnh/thành phố</MenuItem>
                    {getProvinceOptions().map(option => (
                      <MenuItem key={option.value} value={option.value} sx={{ fontSize: '14px' }}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* District */}
              <Grid item xs={12}>
                <FormControl fullWidth required disabled={!provinceId}>
                  <InputLabel sx={{ fontSize: '14px' }}>Quận/Huyện</InputLabel>
                  <Select
                    value={districtId}
                    onChange={(e) => setDistrictId(e.target.value)}
                    label="Quận/Huyện"
                    disabled={actionLoading || locationLoading || !provinceId}
                    sx={{ fontSize: '14px' }}
                    MenuProps={{
                      PaperProps: {
                        style: { maxHeight: 250 }
                      }
                    }}
                  >
                    <MenuItem value="" sx={{ fontSize: '14px' }}>Chọn quận/huyện</MenuItem>
                    {getDistrictOptions().map(option => (
                      <MenuItem key={option.value} value={option.value} sx={{ fontSize: '14px' }}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Address */}
              <Grid item xs={12}>
                <TextField
                  name="address"
                  label="Địa Chỉ"
                  required
                  fullWidth
                  placeholder="Địa chỉ đầy đủ của chi nhánh"
                  defaultValue={selectedBranch?.address || ''}
                  disabled={actionLoading}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { fontSize: '14px' }
                  }}
                />
              </Grid>

              {/* Phone */}
              <Grid item xs={12}>
                <TextField
                  name="phone"
                  label="Số Điện Thoại"
                  required
                  fullWidth
                  placeholder="Ví dụ: 0123456789"
                  defaultValue={selectedBranch?.phone || ''}
                  disabled={actionLoading}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { fontSize: '14px' }
                  }}
                />
              </Grid>
            </Grid>

            {/* Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setOpenDialog(false);
                  setProvinceId('');
                  setDistrictId('');
                }}
                disabled={actionLoading}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                disabled={actionLoading}
                onClick={async () => {
                  const formElement = document.getElementById('branch-form');
                  const formData = new FormData(formElement);
                  const data = {
                    branchName: formData.get('branchName'),
                    address: formData.get('address'),
                    phone: formData.get('phone'),
                    districtId: districtId
                  };
                  await handleFormSubmit(data);
                }}
              >
                {actionLoading ? 'Đang xử lý...' : dialogMode === 'create' ? 'Tạo Chi Nhánh' : 'Cập nhật Chi Nhánh'}
              </Button>
            </Box>
          </Box>
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
    </div>
  );
};

export default BranchManagement;

