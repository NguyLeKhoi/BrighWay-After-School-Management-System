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
  Grid,
  FormControlLabel,
  Switch,
  Autocomplete,
  Checkbox,
  ListItemText,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  ShoppingCart as PackageIcon,
  AttachMoney as PriceIcon,
  Schedule as DurationIcon,
  Group as SlotsIcon
} from '@mui/icons-material';
import DataTable from '../../../components/Common/DataTable';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import packageService from '../../../services/package.service';
import benefitService from '../../../services/benefit.service';
import usePackageDependencies from '../../../hooks/usePackageDependencies';
import { useApp } from '../../../contexts/AppContext';
import useContentLoading from '../../../hooks/useContentLoading';
import ContentLoading from '../../../components/Common/ContentLoading';
import { toast } from 'react-toastify';
import styles from './PackageManagement.module.css';

const PackageManagement = () => {
  const [packages, setPackages] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedBenefits, setSelectedBenefits] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [availableBenefits, setAvailableBenefits] = useState([]);
  const [loadingBenefits, setLoadingBenefits] = useState(false);
  
  // Confirm dialog states
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    onConfirm: null
  });
  
  // Global state
  const { showGlobalError, addNotification } = useApp();
  const { isLoading: isPageLoading, loadingText, showLoading, hideLoading } = useContentLoading(300);
  
  // Package dependencies (lazy loading - only fetch when dialog opens)
  const { 
    benefitOptions, 
    studentLevelOptions, 
    branchOptions, 
    loading: dependenciesLoading,
    error: dependenciesError,
    fetchDependencies
  } = usePackageDependencies();

  // Define table columns
  const columns = [
    {
      key: 'name',
      header: 'Tên Gói',
      render: (value, item) => (
        <Box display="flex" alignItems="center" gap={1}>
          <PackageIcon fontSize="small" color="primary" />
          <Typography variant="subtitle2" fontWeight="medium">
            {value}
          </Typography>
        </Box>
      )
    },
    {
      key: 'desc',
      header: 'Mô Tả',
      render: (value) => (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
          {value || 'Không có mô tả'}
        </Typography>
      )
    },
    {
      key: 'price',
      header: 'Giá',
      align: 'right',
      render: (value) => (
        <Box display="flex" alignItems="center" gap={0.5} justifyContent="flex-end">
          <PriceIcon fontSize="small" color="success" />
          <Typography variant="body2" fontWeight="medium" color="success.main">
            {value ? value.toLocaleString('vi-VN') + ' VNĐ' : '0 VNĐ'}
          </Typography>
        </Box>
      )
    },
    {
      key: 'durationInMonths',
      header: 'Thời Hạn',
      align: 'center',
      render: (value) => (
        <Box display="flex" alignItems="center" gap={0.5} justifyContent="center">
          <DurationIcon fontSize="small" color="info" />
          <Typography variant="body2">
            {value} tháng
          </Typography>
        </Box>
      )
    },
    {
      key: 'totalSlots',
      header: 'Số Slot',
      align: 'center',
      render: (value) => (
        <Box display="flex" alignItems="center" gap={0.5} justifyContent="center">
          <SlotsIcon fontSize="small" color="warning" />
          <Typography variant="body2">
            {value}
          </Typography>
        </Box>
      )
    },
    {
      key: 'branch',
      header: 'Chi Nhánh',
      render: (value) => (
        <Typography variant="body2">
          {value?.branchName || 'N/A'}
        </Typography>
      )
    },
    {
      key: 'studentLevel',
      header: 'Cấp Độ',
      render: (value) => (
        <Typography variant="body2">
          {value?.name || 'N/A'}
        </Typography>
      )
    },
    {
      key: 'benefits',
      header: 'Lợi Ích',
      render: (value) => (
        <Box display="flex" gap={0.5} flexWrap="wrap">
          {value && value.length > 0 ? (
            value.slice(0, 2).map((benefit, index) => (
              <Chip
                key={index}
                label={benefit.name}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              Không có
            </Typography>
          )}
          {value && value.length > 2 && (
            <Chip
              label={`+${value.length - 2}`}
              size="small"
              color="default"
              variant="outlined"
            />
          )}
        </Box>
      )
    }
  ];

  // Load packages with pagination and filters
  const loadPackages = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) {
      showLoading();
    }
    setError(null);
    try {
      const response = await packageService.getPackagesPaged({
        page: page + 1,
        pageSize: rowsPerPage,
        searchTerm: searchTerm,
        status: statusFilter === '' ? null : statusFilter === 'true'
      });
      
      if (response.items) {
        setPackages(response.items);
        setTotalCount(response.totalCount || response.items.length);
      } else {
        setPackages(response);
        setTotalCount(response.length);
      }
    } catch (err) {
      const errorMessage = err.message || 'Có lỗi xảy ra khi tải danh sách gói bán';
      setError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      if (showLoadingIndicator) {
        hideLoading();
      }
    }
  };

  // Load packages when page, rowsPerPage, or filters change
  useEffect(() => {
    loadPackages();
  }, [page, rowsPerPage, statusFilter]);

  // Load packages when keyword changes (debounced search while typing)
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadPackages(false); // Don't show loading indicator for debounced search
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Load benefits when branch is selected in dialog
  useEffect(() => {
    const loadBenefitsForBranch = async () => {
      if (!selectedBranchId || !openDialog) {
        setAvailableBenefits([]);
        return;
      }

      setLoadingBenefits(true);
      try {
        const benefits = await benefitService.getBenefitsByBranchId(selectedBranchId);
        setAvailableBenefits(benefits || []);
      } catch (err) {
        console.error('Error loading benefits for branch:', err);
        setAvailableBenefits([]);
      } finally {
        setLoadingBenefits(false);
      }
    };

    loadBenefitsForBranch();
  }, [selectedBranchId, openDialog]);

  // Event handlers
  const handleSearch = () => {
    setPage(0);
    loadPackages();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPage(0);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreatePackage = async () => {
    // Fetch dependencies when opening dialog
    if (benefitOptions.length === 0 && studentLevelOptions.length === 0 && branchOptions.length === 0) {
      await fetchDependencies();
    }
    setDialogMode('create');
    setSelectedPackage(null);
    setSelectedBenefits([]);
    setSelectedBranchId('');
    setAvailableBenefits([]);
    setOpenDialog(true);
  };

  const handleEditPackage = async (packageItem) => {
    // Fetch dependencies when opening dialog
    if (benefitOptions.length === 0 && studentLevelOptions.length === 0 && branchOptions.length === 0) {
      await fetchDependencies();
    }
    setDialogMode('edit');
    setSelectedPackage(packageItem);
    setSelectedBenefits(packageItem?.benefits?.map(b => b.id) || []);
    setSelectedBranchId(packageItem?.branchId || '');
    setOpenDialog(true);
  };

  const handleDeletePackage = (packageItem) => {
    setConfirmDialog({
      open: true,
      title: 'Xác nhận xóa gói bán',
      description: `Bạn có chắc chắn muốn xóa gói bán "${packageItem.name}"? Hành động này không thể hoàn tác.`,
      onConfirm: () => performDeletePackage(packageItem.id)
    });
  };

  const performDeletePackage = async (packageId) => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
    setActionLoading(true);
    
    try {
      await packageService.deletePackage(packageId);
      
      toast.success('Xóa gói bán thành công!', {
        position: "top-right",
        autoClose: 3000,
      });
      
      // If we're deleting the last item on current page and not on first page, go to previous page
      if (packages.length === 1 && page > 0) {
        setPage(page - 1);
      }
      
      // Reload data after delete
      await loadPackages(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi xóa gói bán';
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
      const submitData = {
        name: data.name,
        desc: data.desc,
        durationInMonths: parseInt(data.durationInMonths),
        totalSlots: parseInt(data.totalSlots),
        price: parseInt(data.price),
        studentLevelId: data.studentLevelId,
        branchId: data.branchId,
        benefitIds: data.benefitIds || []
      };
      
      if (dialogMode === 'create') {
        await packageService.createPackage(submitData);
        toast.success(`Tạo gói bán "${data.name}" thành công!`, {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        await packageService.updatePackage(selectedPackage.id, submitData);
        toast.success(`Cập nhật gói bán "${data.name}" thành công!`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
      
      setOpenDialog(false);
      loadPackages();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 
        (dialogMode === 'create' ? 'Có lỗi xảy ra khi tạo gói bán' : 'Có lỗi xảy ra khi cập nhật gói bán');
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
          Quản lý Gói Bán
        </h1>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreatePackage}
          className={styles.addButton}
        >
          Thêm Gói Bán
        </Button>
      </div>

      {/* Search Section */}
      <Paper className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <TextField
            placeholder="Tìm kiếm theo tên gói bán..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <FormControl variant="outlined" className={styles.statusFilter}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Trạng thái"
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="true">Hoạt động</MenuItem>
              <MenuItem value="false">Không hoạt động</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={searchLoading}
            className={styles.searchButton}
          >
            {searchLoading ? 'Đang tìm...' : 'Tìm kiếm'}
          </Button>
          {(searchTerm || statusFilter) && (
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
          data={packages}
          columns={columns}
          loading={isPageLoading}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onEdit={handleEditPackage}
          onDelete={handleDeletePackage}
          emptyMessage="Không có gói bán nào. Hãy thêm gói bán đầu tiên để bắt đầu."
        />
      </div>

      {/* Create/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => !actionLoading && setOpenDialog(false)} 
        maxWidth="lg" 
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
            <PackageIcon />
            <span>
              {dialogMode === 'create' ? 'Thêm Gói Bán mới' : 'Chỉnh sửa Gói Bán'}
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
          <Box 
            component="form" 
            id="package-form"
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              
              const data = {
                name: formData.get('name'),
                desc: formData.get('desc'),
                durationInMonths: formData.get('durationInMonths'),
                totalSlots: formData.get('totalSlots'),
                price: formData.get('price'),
                studentLevelId: formData.get('studentLevelId'),
                branchId: formData.get('branchId'),
                benefitIds: selectedBenefits
              };
              await handleFormSubmit(data);
            }}
          >
            <Grid container spacing={3} sx={{ mb: 3 }}>
              {/* Package Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  name="name"
                  label="Tên Gói Bán"
                  required
                  fullWidth
                  placeholder="Ví dụ: Gói học tiếng Anh cơ bản"
                  defaultValue={selectedPackage?.name || ''}
                  disabled={actionLoading}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { fontSize: '14px' }
                  }}
                />
              </Grid>

              {/* Price */}
              <Grid item xs={12} md={6}>
                <TextField
                  name="price"
                  label="Giá (VNĐ)"
                  type="number"
                  required
                  fullWidth
                  placeholder="Ví dụ: 1000000"
                  defaultValue={selectedPackage?.price || ''}
                  disabled={actionLoading}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { fontSize: '14px' }
                  }}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  name="desc"
                  label="Mô Tả"
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Mô tả chi tiết về gói bán..."
                  defaultValue={selectedPackage?.desc || ''}
                  disabled={actionLoading}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { fontSize: '14px' }
                  }}
                />
              </Grid>

              {/* Duration */}
              <Grid item xs={12} md={4}>
                <TextField
                  name="durationInMonths"
                  label="Thời Hạn (tháng)"
                  type="number"
                  required
                  fullWidth
                  placeholder="Ví dụ: 6"
                  defaultValue={selectedPackage?.durationInMonths || ''}
                  disabled={actionLoading}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { fontSize: '14px' }
                  }}
                />
              </Grid>

              {/* Total Slots */}
              <Grid item xs={12} md={4}>
                <TextField
                  name="totalSlots"
                  label="Số Slot"
                  type="number"
                  required
                  fullWidth
                  placeholder="Ví dụ: 20"
                  defaultValue={selectedPackage?.totalSlots || ''}
                  disabled={actionLoading}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { fontSize: '14px' }
                  }}
                />
              </Grid>

              {/* Student Level */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth required>
                  <InputLabel>Cấp Độ Học Sinh</InputLabel>
                  <Select
                    name="studentLevelId"
                    defaultValue={selectedPackage?.studentLevelId || ''}
                    label="Cấp Độ Học Sinh"
                    disabled={actionLoading || dependenciesLoading}
                    sx={{ fontSize: '14px' }}
                  >
                    <MenuItem value="">Chọn cấp độ học sinh</MenuItem>
                    {studentLevelOptions.map((level) => (
                      <MenuItem key={level.id} value={level.id} sx={{ fontSize: '14px' }}>
                        {level.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Branch */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Chi Nhánh</InputLabel>
                  <Select
                    name="branchId"
                    value={selectedBranchId}
                    onChange={(e) => {
                      setSelectedBranchId(e.target.value);
                      setSelectedBenefits([]); // Clear selected benefits when branch changes
                    }}
                    label="Chi Nhánh"
                    disabled={actionLoading || dependenciesLoading}
                    sx={{ fontSize: '14px' }}
                  >
                    <MenuItem value="">Chọn chi nhánh</MenuItem>
                    {branchOptions.map((branch) => (
                      <MenuItem key={branch.id} value={branch.id} sx={{ fontSize: '14px' }}>
                        {branch.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Benefits */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Lợi Ích</InputLabel>
                  <Select
                    name="benefitIds"
                    multiple
                    value={selectedBenefits}
                    onChange={(e) => setSelectedBenefits(e.target.value)}
                    label="Lợi Ích"
                    disabled={actionLoading || dependenciesLoading || loadingBenefits || !selectedBranchId}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const benefit = availableBenefits.find(b => b.id === value);
                          return (
                            <Chip key={value} label={benefit?.name || value} size="small" />
                          );
                        })}
                      </Box>
                    )}
                    sx={{ fontSize: '14px' }}
                  >
                    {loadingBenefits ? (
                      <MenuItem disabled>
                        <Box display="flex" alignItems="center" gap={1}>
                          <CircularProgress size={16} />
                          <ListItemText primary="Đang tải lợi ích..." />
                        </Box>
                      </MenuItem>
                    ) : availableBenefits.length > 0 ? (
                      availableBenefits.map((benefit) => (
                        <MenuItem key={benefit.id} value={benefit.id} sx={{ fontSize: '14px' }}>
                          <Checkbox 
                            checked={selectedBenefits.includes(benefit.id)}
                            sx={{ padding: '4px' }}
                          />
                          <ListItemText 
                            primary={benefit.name}
                            secondary={benefit.description}
                          />
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>
                        <ListItemText primary={selectedBranchId ? "Chi nhánh này chưa có lợi ích nào" : "Vui lòng chọn chi nhánh trước"} />
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                type="button"
                variant="outlined"
                onClick={() => setOpenDialog(false)}
                disabled={actionLoading}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={actionLoading || dependenciesLoading}
              >
                {actionLoading ? 'Đang xử lý...' : dialogMode === 'create' ? 'Tạo Gói Bán' : 'Cập nhật Gói Bán'}
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
  );
};

export default PackageManagement;
