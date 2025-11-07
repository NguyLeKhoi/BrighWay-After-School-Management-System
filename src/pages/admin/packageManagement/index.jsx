import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Autocomplete,
  Checkbox,
  ListItemText,
  CircularProgress,
  TextField,
  Button
} from '@mui/material';
import {
  ShoppingCart as PackageIcon,
  AttachMoney as PriceIcon,
  Schedule as DurationIcon,
  Group as SlotsIcon
} from '@mui/icons-material';
import DataTable from '../../../components/Common/DataTable';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import AdminPageHeader from '../../../components/Admin/AdminPageHeader';
import AdminSearchSection from '../../../components/Admin/AdminSearchSection';
import AdminFormDialog from '../../../components/Admin/AdminFormDialog';
import ContentLoading from '../../../components/Common/ContentLoading';
import packageService from '../../../services/package.service';
import benefitService from '../../../services/benefit.service';
import usePackageDependencies from '../../../hooks/usePackageDependencies';
import useBaseCRUD from '../../../hooks/useBaseCRUD';
import { toast } from 'react-toastify';
import styles from './PackageManagement.module.css';

const PackageManagement = () => {
  // Package dependencies
  const { 
    benefitOptions, 
    studentLevelOptions, 
    branchOptions, 
    loading: dependenciesLoading,
    error: dependenciesError,
    fetchDependencies
  } = usePackageDependencies();

  // Benefit selection state (keep this special feature)
  const [selectedBenefits, setSelectedBenefits] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [availableBenefits, setAvailableBenefits] = useState([]);
  const [loadingBenefits, setLoadingBenefits] = useState(false);

  // Use shared CRUD hook for basic operations
  const {
    data: packages,
    totalCount,
    page,
    rowsPerPage,
    keyword: searchTerm,
    filters,
    error,
    actionLoading,
    isPageLoading,
    loadingText,
    openDialog,
    setOpenDialog,
    dialogMode,
    selectedItem: selectedPackage,
    confirmDialog,
    setConfirmDialog,
    handleCreate,
    handleEdit,
    handleDelete,
    handleFormSubmit: baseHandleFormSubmit,
    handleKeywordSearch,
    handleKeywordChange,
    handleClearSearch,
    handlePageChange,
    handleRowsPerPageChange,
    updateFilter
  } = useBaseCRUD({
    loadFunction: async (params) => {
      const response = await packageService.getPackagesPaged({
        page: params.page,
        pageSize: params.pageSize,
        searchTerm: params.searchTerm || params.Keyword || '',
        status: params.status === '' ? null : params.status === 'true'
      });
      return response;
    },
    createFunction: packageService.createPackage,
    updateFunction: packageService.updatePackage,
    deleteFunction: packageService.deletePackage,
    defaultFilters: { status: '' },
    loadOnMount: true
  });

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

  // Load benefits when branch is selected in dialog (keep this special feature)
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
        setAvailableBenefits([]);
      } finally {
        setLoadingBenefits(false);
      }
    };

    loadBenefitsForBranch();
  }, [selectedBranchId, openDialog]);

  // Override handleCreate to ensure dependencies are loaded
  const handleCreateWithData = async () => {
    if (benefitOptions.length === 0 && studentLevelOptions.length === 0 && branchOptions.length === 0) {
      await fetchDependencies();
    }
    setSelectedBenefits([]);
    setSelectedBranchId('');
    setAvailableBenefits([]);
    handleCreate();
  };

  // Override handleEdit to ensure dependencies are loaded
  const handleEditWithData = async (packageItem) => {
    if (benefitOptions.length === 0 && studentLevelOptions.length === 0 && branchOptions.length === 0) {
      await fetchDependencies();
    }
    setSelectedBenefits(packageItem?.benefits?.map(b => b.id) || []);
    setSelectedBranchId(packageItem?.branchId || '');
    handleEdit(packageItem);
  };

  // Custom form submit handler (need to include benefitIds and parse numbers)
  const handleFormSubmit = async (data) => {
    const submitData = {
      name: data.name,
      desc: data.desc,
      durationInMonths: parseInt(data.durationInMonths),
      totalSlots: parseInt(data.totalSlots),
      price: parseFloat(data.price),
      studentLevelId: data.studentLevelId,
      branchId: data.branchId,
      benefitIds: selectedBenefits
    };
    await baseHandleFormSubmit(submitData);
    setSelectedBenefits([]);
    setSelectedBranchId('');
    setAvailableBenefits([]);
  };

  return (
    <div className={styles.container}>
      {isPageLoading && <ContentLoading isLoading={isPageLoading} text={loadingText} />}
      
      {/* Header */}
      <AdminPageHeader
        title="Quản lý Gói Bán"
        createButtonText="Thêm Gói Bán"
        onCreateClick={handleCreateWithData}
      />

      {/* Search Section with Status Filter */}
      <AdminSearchSection
        keyword={searchTerm}
        onKeywordChange={handleKeywordChange}
        onSearch={handleKeywordSearch}
        onClear={() => {
          handleClearSearch();
          updateFilter('status', '');
        }}
        placeholder="Tìm kiếm theo tên gói bán..."
      >
        <FormControl className={styles.statusFilter}>
          <InputLabel>Trạng thái</InputLabel>
          <Select
            value={filters.status || ''}
            onChange={(e) => updateFilter('status', e.target.value)}
            label="Trạng thái"
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="true">Hoạt động</MenuItem>
            <MenuItem value="false">Không hoạt động</MenuItem>
          </Select>
        </FormControl>
      </AdminSearchSection>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" className={styles.errorAlert} onClose={() => {}}>
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
          onEdit={handleEditWithData}
          onDelete={handleDelete}
          emptyMessage="Không có gói bán nào. Hãy thêm gói bán đầu tiên để bắt đầu."
        />
      </div>

      {/* Form Dialog with Benefit Selection */}
      <AdminFormDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSelectedBenefits([]);
          setSelectedBranchId('');
          setAvailableBenefits([]);
        }}
        mode={dialogMode}
        title="Gói Bán"
        icon={PackageIcon}
        loading={actionLoading || dependenciesLoading}
        maxWidth="lg"
      >
        <Box 
          component="form" 
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
              branchId: formData.get('branchId')
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
        </AdminFormDialog>

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
