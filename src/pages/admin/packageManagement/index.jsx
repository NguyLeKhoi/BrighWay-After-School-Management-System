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
  Checkbox,
  ListItemText,
  CircularProgress,
  TextField,
  Button,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import {
  ShoppingCart as PackageIcon,
  AttachMoney as PriceIcon,
  Schedule as DurationIcon,
  Group as SlotsIcon,
  DashboardCustomize as TemplateTabIcon
} from '@mui/icons-material';
import DataTable from '../../../components/Common/DataTable';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import AdminPageHeader from '../../../components/Admin/AdminPageHeader';
import AdminSearchSection from '../../../components/Admin/AdminSearchSection';
import AdminFormDialog from '../../../components/Admin/AdminFormDialog';
import ContentLoading from '../../../components/Common/ContentLoading';
import packageService from '../../../services/package.service';
import packageTemplateService from '../../../services/packageTemplate.service';
import benefitService from '../../../services/benefit.service';
import usePackageDependencies from '../../../hooks/usePackageDependencies';
import useBaseCRUD from '../../../hooks/useBaseCRUD';
import styles from './PackageManagement.module.css';

const PackageManagement = () => {
  const [activeTab, setActiveTab] = useState('templates');

  const { 
    benefitOptions, 
    studentLevelOptions, 
    branchOptions, 
    loading: dependenciesLoading,
    error: dependenciesError,
    fetchDependencies
  } = usePackageDependencies();

  const {
    data: templates,
    totalCount: templateTotalCount,
    page: templatePage,
    rowsPerPage: templateRowsPerPage,
    keyword: templateSearchTerm,
    filters: templateFilters,
    error: templateError,
    actionLoading: templateActionLoading,
    isPageLoading: templateIsPageLoading,
    loadingText: templateLoadingText,
    openDialog: templateDialogOpen,
    setOpenDialog: setTemplateDialogOpen,
    dialogMode: templateDialogMode,
    selectedItem: selectedTemplate,
    confirmDialog: templateConfirmDialog,
    setConfirmDialog: setTemplateConfirmDialog,
    handleCreate: templateHandleCreateBase,
    handleEdit: templateHandleEditBase,
    handleDelete: templateHandleDelete,
    handleFormSubmit: templateHandleFormSubmitBase,
    handleKeywordSearch: templateHandleKeywordSearch,
    handleKeywordChange: templateHandleKeywordChange,
    handleClearSearch: templateHandleClearSearch,
    handlePageChange: templateHandlePageChange,
    handleRowsPerPageChange: templateHandleRowsPerPageChange,
    updateFilter: templateUpdateFilter
  } = useBaseCRUD({
    loadFunction: async (params) => {
      return packageTemplateService.getTemplatesPaged({
        page: params.page,
        pageSize: params.pageSize,
        searchTerm: params.searchTerm || params.Keyword || '',
        status: params.status === '' ? null : params.status === 'true'
      });
    },
    createFunction: packageTemplateService.createTemplate,
    updateFunction: packageTemplateService.updateTemplate,
    deleteFunction: packageTemplateService.deleteTemplate,
    defaultFilters: { status: '' },
    loadOnMount: true
  });

  const {
    data: packages,
    totalCount: packageTotalCount,
    page: packagePage,
    rowsPerPage: packageRowsPerPage,
    keyword: packageSearchTerm,
    filters: packageFilters,
    error: packageError,
    actionLoading: packageActionLoading,
    isPageLoading: packageIsPageLoading,
    loadingText: packageLoadingText,
    openDialog: packageDialogOpen,
    setOpenDialog: setPackageDialogOpen,
    dialogMode: packageDialogMode,
    selectedItem: selectedPackage,
    confirmDialog: packageConfirmDialog,
    setConfirmDialog: setPackageConfirmDialog,
    handleCreate: packageHandleCreateBase,
    handleEdit: packageHandleEditBase,
    handleDelete: packageHandleDelete,
    handleFormSubmit: packageHandleFormSubmitBase,
    handleKeywordSearch: packageHandleKeywordSearch,
    handleKeywordChange: packageHandleKeywordChange,
    handleClearSearch: packageHandleClearSearch,
    handlePageChange: packageHandlePageChange,
    handleRowsPerPageChange: packageHandleRowsPerPageChange,
    updateFilter: packageUpdateFilter
  } = useBaseCRUD({
    loadFunction: async (params) => {
      return packageService.getPackagesPaged({
        page: params.page,
        pageSize: params.pageSize,
        searchTerm: params.searchTerm || params.Keyword || '',
        status: params.status === '' ? null : params.status === 'true'
      });
    },
    createFunction: packageService.createPackage,
    updateFunction: packageService.updatePackage,
    deleteFunction: packageService.deletePackage,
    defaultFilters: { status: '' },
    loadOnMount: true
  });

  const [selectedBenefits, setSelectedBenefits] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [availableBenefits, setAvailableBenefits] = useState([]);
  const [loadingBenefits, setLoadingBenefits] = useState(false);

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '0 VNĐ';
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return '0 VNĐ';
    return `${numericValue.toLocaleString('vi-VN')} VNĐ`;
  };

  const templateColumns = [
    {
      key: 'templateInfo',
      header: <Typography className={styles.noWrap}>Thông tin mẫu</Typography>,
      render: (_, item) => (
        <Box display="flex" alignItems="flex-start" gap={2}>
          <PackageIcon fontSize="small" color="primary" />
          <Box>
            <Typography variant="subtitle2" fontWeight="medium" className={styles.primaryText}>
              {item?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item?.desc || 'Không có mô tả'}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      key: 'templatePrice',
      header: <Typography className={styles.noWrap}>Giá bán</Typography>,
      render: (_, item) => (
        <Box className={styles.compactCell}>
          <Typography variant="body2">
            <strong>Khoảng:</strong> {formatCurrency(item?.minPrice)} - {formatCurrency(item?.maxPrice)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Mặc định:</strong> {formatCurrency(item?.defaultPrice)}
          </Typography>
        </Box>
      )
    },
    {
      key: 'templateDuration',
      header: <Typography className={styles.noWrap}>Thời hạn</Typography>,
      render: (_, item) => (
        <Box className={styles.compactCell}>
          <Typography variant="body2">
            <strong>Khoảng:</strong> {item?.minDurationInMonths || 0} - {item?.maxDurationInMonths || 0} tháng
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Mặc định:</strong> {item?.defaultDurationInMonths || 0} tháng
          </Typography>
        </Box>
      )
    },
    {
      key: 'templateSlots',
      header: <Typography className={styles.noWrap}>Số slot</Typography>,
      render: (_, item) => (
        <Box className={styles.compactCell}>
          <Typography variant="body2">
            <strong>Khoảng:</strong> {item?.minSlots || 0} - {item?.maxSlots || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Mặc định:</strong> {item?.defaultTotalSlots || 0}
          </Typography>
        </Box>
      )
    },
    {
      key: 'templateStatus',
      header: <Typography className={styles.noWrap}>Trạng thái</Typography>,
      render: (value, item) => (
        <Chip
          label={item?.isActive ? 'Hoạt động' : 'Không hoạt động'}
          color={item?.isActive ? 'success' : 'default'}
          size="small"
          variant={item?.isActive ? 'filled' : 'outlined'}
        />
      )
    }
  ];

  const packageColumns = [
    {
      key: 'packageInfo',
      header: <Typography className={styles.noWrap}>Thông tin gói</Typography>,
      render: (_, item) => (
        <Box display="flex" alignItems="flex-start" gap={2}>
          <PackageIcon fontSize="small" color="primary" />
          <Box>
            <Typography variant="subtitle2" fontWeight="medium" className={styles.primaryText}>
              {item?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item?.desc || 'Không có mô tả'}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      key: 'packagePrice',
      header: <Typography className={styles.noWrap}>Giá & Thời hạn</Typography>,
      render: (_, item) => (
        <Box className={styles.compactCell}>
          <Typography variant="body2">
            <strong>Giá:</strong> {formatCurrency(item?.price)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Thời hạn:</strong> {item?.durationInMonths || 0} tháng
          </Typography>
        </Box>
      )
    },
    {
      key: 'packageSlots',
      header: <Typography className={styles.noWrap}>Số lượng</Typography>,
      render: (_, item) => (
        <Box className={styles.compactCell}>
          <Typography variant="body2">
            <strong>Slots:</strong> {item?.totalSlots || 0}
          </Typography>
        </Box>
      )
    },
    {
      key: 'packageContext',
      header: <Typography className={styles.noWrap}>Phạm vi áp dụng</Typography>,
      render: (_, item) => (
        <Box className={styles.compactCell}>
          <Typography variant="body2">
            <strong>Chi nhánh:</strong> {item?.branch?.branchName || 'N/A'}
          </Typography>
          <Typography variant="body2">
            <strong>Cấp độ:</strong> {item?.studentLevel?.name || 'N/A'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Lợi ích:</strong>{' '}
            {item?.benefits && item.benefits.length > 0
              ? item.benefits.map((benefit) => benefit.name).join(', ')
              : 'Không có'}
          </Typography>
        </Box>
      )
    }
  ];

  useEffect(() => {
    const loadBenefitsForBranch = async () => {
      if (!selectedBranchId || !packageDialogOpen) {
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
  }, [selectedBranchId, packageDialogOpen]);

  const handleTemplateCreate = () => {
    templateHandleCreateBase();
  };

  const handleTemplateEdit = (templateItem) => {
    templateHandleEditBase(templateItem);
  };

  const toNumber = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    const numericValue = Number(value);
    return Number.isNaN(numericValue) ? 0 : numericValue;
  };

  const handleTemplateFormSubmit = async (data) => {
    const submitData = {
      name: data.name,
      desc: data.desc,
      minPrice: toNumber(data.minPrice),
      maxPrice: toNumber(data.maxPrice),
      minSlots: toNumber(data.minSlots),
      maxSlots: toNumber(data.maxSlots),
      minDurationInMonths: toNumber(data.minDurationInMonths),
      maxDurationInMonths: toNumber(data.maxDurationInMonths),
      defaultPrice: toNumber(data.defaultPrice),
      defaultTotalSlots: toNumber(data.defaultTotalSlots),
      defaultDurationInMonths: toNumber(data.defaultDurationInMonths),
      isActive: data.isActive === 'true'
    };
    await templateHandleFormSubmitBase(submitData);
  };

  const handlePackageCreate = async () => {
    if (
      benefitOptions.length === 0 &&
      studentLevelOptions.length === 0 &&
      branchOptions.length === 0
    ) {
      await fetchDependencies();
    }
    setSelectedBenefits([]);
    setSelectedBranchId('');
    setAvailableBenefits([]);
    packageHandleCreateBase();
  };

  const handlePackageEdit = async (packageItem) => {
    if (
      benefitOptions.length === 0 &&
      studentLevelOptions.length === 0 &&
      branchOptions.length === 0
    ) {
      await fetchDependencies();
    }
    setSelectedBenefits(packageItem?.benefits?.map((b) => b.id) || []);
    setSelectedBranchId(packageItem?.branchId || '');
    packageHandleEditBase(packageItem);
  };

  const handlePackageFormSubmit = async (data) => {
    const submitData = {
      name: data.name,
      desc: data.desc,
      minSlots: data.minSlots ? parseInt(data.minSlots, 10) : 0,
      maxSlots: data.maxSlots ? parseInt(data.maxSlots, 10) : 0,
      totalSlots: data.totalSlots ? parseInt(data.totalSlots, 10) : 0,
      minDurationInMonths: data.minDurationInMonths ? parseInt(data.minDurationInMonths, 10) : 0,
      maxDurationInMonths: data.maxDurationInMonths ? parseInt(data.maxDurationInMonths, 10) : 0,
      durationInMonths: data.durationInMonths ? parseInt(data.durationInMonths, 10) : 0,
      price: data.price ? parseFloat(data.price) : 0,
      studentLevelId: data.studentLevelId,
      branchId: data.branchId,
      benefitIds: selectedBenefits
    };
    await packageHandleFormSubmitBase(submitData);
    setSelectedBenefits([]);
    setSelectedBranchId('');
    setAvailableBenefits([]);
  };

  const isTemplateTab = activeTab === 'templates';
  const activeLoading = isTemplateTab ? templateIsPageLoading : packageIsPageLoading;
  const activeLoadingText = isTemplateTab ? templateLoadingText : packageLoadingText;

  const renderStatusFilter = (value, onChange) => (
    <FormControl className={styles.statusFilter}>
      <InputLabel>Trạng thái</InputLabel>
      <Select value={value} onChange={onChange} label="Trạng thái">
        <MenuItem value="">Tất cả</MenuItem>
        <MenuItem value="true">Hoạt động</MenuItem>
        <MenuItem value="false">Không hoạt động</MenuItem>
      </Select>
    </FormControl>
  );

  return (
    <div className={styles.container}>
      {activeLoading && <ContentLoading isLoading={activeLoading} text={activeLoadingText} />}
      
      <AdminPageHeader
        title={isTemplateTab ? 'Quản lý Mẫu Gói' : 'Quản lý Gói Bán'}
        createButtonText={isTemplateTab ? 'Thêm Mẫu Gói' : 'Thêm Gói Bán'}
        onCreateClick={isTemplateTab ? handleTemplateCreate : handlePackageCreate}
      />

      <Paper
        className={styles.tabsWrapper}
        elevation={0}
        sx={{
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          border: '1px solid #e0e0e0',
          backgroundColor: '#fff'
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '15px',
              fontWeight: 500,
              minHeight: 64,
              padding: '12px 24px',
              color: 'text.secondary',
              transition: 'all 0.3s ease',
              '& .MuiSvgIcon-root': {
                fontSize: 22,
                transition: 'color 0.2s ease'
              },
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                color: 'primary.main'
              },
              '&.Mui-selected': {
                color: 'primary.main',
                fontWeight: 600
              }
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              backgroundColor: '#1976d2'
            }
          }}
        >
          <Tab
            value="templates"
            disableRipple
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <TemplateTabIcon />
                <Box>
                  <Box component="span" sx={{ display: 'block', fontWeight: 'inherit' }}>
                    Mẫu gói
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 400,
                      opacity: 0.7,
                      mt: 0.25
                    }}
                  >
                    Template
                  </Box>
                </Box>
              </Box>
            }
            sx={{
              '& .MuiSvgIcon-root': {
                color: activeTab === 'templates' ? 'primary.main' : 'inherit'
              }
            }}
          />
          <Tab
            value="packages"
            disableRipple
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <PackageIcon />
                <Box>
                  <Box component="span" sx={{ display: 'block', fontWeight: 'inherit' }}>
                    Gói bán
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 400,
                      opacity: 0.7,
                      mt: 0.25
                    }}
                  >
                    Package
                  </Box>
                </Box>
              </Box>
            }
            sx={{
              '& .MuiSvgIcon-root': {
                color: activeTab === 'packages' ? 'primary.main' : 'inherit'
              }
            }}
          />
        </Tabs>
      </Paper>

      {!isTemplateTab && dependenciesError && (
        <Alert severity="warning" className={styles.errorAlert}>
          {dependenciesError}
        </Alert>
      )}

      {isTemplateTab ? (
        <>
      <AdminSearchSection
            keyword={templateSearchTerm}
            onKeywordChange={templateHandleKeywordChange}
            onSearch={templateHandleKeywordSearch}
        onClear={() => {
              templateHandleClearSearch();
              templateUpdateFilter('status', '');
            }}
            placeholder="Tìm kiếm theo tên mẫu gói..."
          >
            {renderStatusFilter(templateFilters.status || '', (e) =>
              templateUpdateFilter('status', e.target.value)
            )}
          </AdminSearchSection>

          {templateError && (
            <Alert severity="error" className={styles.errorAlert}>
              {templateError}
            </Alert>
          )}

          <div className={styles.tableContainer}>
            <DataTable
              data={templates}
              columns={templateColumns}
              loading={templateIsPageLoading}
              page={templatePage}
              rowsPerPage={templateRowsPerPage}
              totalCount={templateTotalCount}
              onPageChange={templateHandlePageChange}
              onRowsPerPageChange={templateHandleRowsPerPageChange}
              onEdit={handleTemplateEdit}
              onDelete={templateHandleDelete}
              emptyMessage="Chưa có mẫu gói nào. Hãy tạo mẫu đầu tiên để sử dụng lại nhanh chóng."
            />
          </div>

          <AdminFormDialog
            open={templateDialogOpen}
            onClose={() => {
              setTemplateDialogOpen(false);
              setTemplateSelectedBenefits([]);
            }}
            mode={templateDialogMode}
            title="Mẫu Gói"
            icon={PackageIcon}
            loading={templateActionLoading}
            maxWidth="md"
          >
            <Box
              component="form"
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
            const data = {
              name: formData.get('name'),
              desc: formData.get('desc'),
              minPrice: formData.get('minPrice'),
              maxPrice: formData.get('maxPrice'),
              defaultPrice: formData.get('defaultPrice'),
              minDurationInMonths: formData.get('minDurationInMonths'),
              maxDurationInMonths: formData.get('maxDurationInMonths'),
              defaultDurationInMonths: formData.get('defaultDurationInMonths'),
              minSlots: formData.get('minSlots'),
              maxSlots: formData.get('maxSlots'),
              defaultTotalSlots: formData.get('defaultTotalSlots'),
              isActive: formData.get('isActive')
            };
                await handleTemplateFormSubmit(data);
              }}
            >
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={8}>
                  <TextField
                    name="name"
                    label="Tên Mẫu Gói"
                    required
                    fullWidth
                    placeholder="Ví dụ: Gói học tiếng Anh cơ bản"
                    defaultValue={selectedTemplate?.name || ''}
                    disabled={templateActionLoading}
                    sx={{
                      '& .MuiOutlinedInput-root': { fontSize: '14px' }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth required>
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                      name="isActive"
                      defaultValue={
                        selectedTemplate?.isActive === undefined
                          ? 'true'
                          : String(selectedTemplate.isActive)
                      }
                      label="Trạng thái"
                      disabled={templateActionLoading}
                      sx={{ fontSize: '14px' }}
                    >
                      <MenuItem value="true">Hoạt động</MenuItem>
                      <MenuItem value="false">Không hoạt động</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    name="desc"
                    label="Mô Tả"
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Mô tả chi tiết về mẫu gói..."
                    defaultValue={selectedTemplate?.desc || ''}
                    disabled={templateActionLoading}
                    sx={{
                      '& .MuiOutlinedInput-root': { fontSize: '14px' }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" className={styles.sectionLabel}>
                        Giá bán
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        name="minPrice"
                        label="Giá thấp nhất (VNĐ)"
                        type="number"
                        required
                        fullWidth
                        placeholder="Ví dụ: 500000"
                        defaultValue={selectedTemplate?.minPrice || ''}
                        disabled={templateActionLoading}
                        sx={{
                          '& .MuiOutlinedInput-root': { fontSize: '14px' }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        name="maxPrice"
                        label="Giá cao nhất (VNĐ)"
                        type="number"
                        required
                        fullWidth
                        placeholder="Ví dụ: 2000000"
                        defaultValue={selectedTemplate?.maxPrice || ''}
                        disabled={templateActionLoading}
                        sx={{
                          '& .MuiOutlinedInput-root': { fontSize: '14px' }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        name="defaultPrice"
                        label="Giá mặc định (VNĐ)"
                        type="number"
                        required
                        fullWidth
                        placeholder="Ví dụ: 1000000"
                        defaultValue={selectedTemplate?.defaultPrice || ''}
                        disabled={templateActionLoading}
                        sx={{
                          '& .MuiOutlinedInput-root': { fontSize: '14px' }
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" className={styles.sectionLabel}>
                        Thời hạn & Slot
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        name="minDurationInMonths"
                        label="Thời hạn thấp nhất (tháng)"
                        type="number"
                        required
                        fullWidth
                        placeholder="Ví dụ: 3"
                        defaultValue={selectedTemplate?.minDurationInMonths || ''}
                        disabled={templateActionLoading}
                        sx={{
                          '& .MuiOutlinedInput-root': { fontSize: '14px' }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        name="maxDurationInMonths"
                        label="Thời hạn cao nhất (tháng)"
                        type="number"
                        required
                        fullWidth
                        placeholder="Ví dụ: 12"
                        defaultValue={selectedTemplate?.maxDurationInMonths || ''}
                        disabled={templateActionLoading}
                        sx={{
                          '& .MuiOutlinedInput-root': { fontSize: '14px' }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        name="defaultDurationInMonths"
                        label="Thời hạn mặc định (tháng)"
                        type="number"
                        required
                        fullWidth
                        placeholder="Ví dụ: 6"
                        defaultValue={selectedTemplate?.defaultDurationInMonths || ''}
                        disabled={templateActionLoading}
                        sx={{
                          '& .MuiOutlinedInput-root': { fontSize: '14px' }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        name="minSlots"
                        label="Slot thấp nhất"
                        type="number"
                        required
                        fullWidth
                        placeholder="Ví dụ: 10"
                        defaultValue={selectedTemplate?.minSlots || ''}
                        disabled={templateActionLoading}
                        sx={{
                          '& .MuiOutlinedInput-root': { fontSize: '14px' }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        name="maxSlots"
                        label="Slot cao nhất"
                        type="number"
                        required
                        fullWidth
                        placeholder="Ví dụ: 30"
                        defaultValue={selectedTemplate?.maxSlots || ''}
                        disabled={templateActionLoading}
                        sx={{
                          '& .MuiOutlinedInput-root': { fontSize: '14px' }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        name="defaultTotalSlots"
                        label="Slot mặc định"
                        type="number"
                        required
                        fullWidth
                        placeholder="Ví dụ: 20"
                        defaultValue={selectedTemplate?.defaultTotalSlots || ''}
                        disabled={templateActionLoading}
                        sx={{
                          '& .MuiOutlinedInput-root': { fontSize: '14px' }
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => setTemplateDialogOpen(false)}
                  disabled={templateActionLoading}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={templateActionLoading}
                >
                  {templateActionLoading
                    ? 'Đang xử lý...'
                    : templateDialogMode === 'create'
                      ? 'Tạo Mẫu Gói'
                      : 'Cập nhật Mẫu Gói'}
                </Button>
              </Box>
            </Box>
          </AdminFormDialog>

          <ConfirmDialog
            open={templateConfirmDialog.open}
            onClose={() => setTemplateConfirmDialog((prev) => ({ ...prev, open: false }))}
            onConfirm={templateConfirmDialog.onConfirm}
            title={templateConfirmDialog.title}
            description={templateConfirmDialog.description}
            confirmText="Xóa"
            cancelText="Hủy"
            confirmColor="error"
          />
        </>
      ) : (
        <>
          <AdminSearchSection
            keyword={packageSearchTerm}
            onKeywordChange={packageHandleKeywordChange}
            onSearch={packageHandleKeywordSearch}
            onClear={() => {
              packageHandleClearSearch();
              packageUpdateFilter('status', '');
            }}
            placeholder="Tìm kiếm theo tên gói bán..."
          >
            {renderStatusFilter(packageFilters.status || '', (e) =>
              packageUpdateFilter('status', e.target.value)
            )}
      </AdminSearchSection>

          {packageError && (
            <Alert severity="error" className={styles.errorAlert}>
              {packageError}
        </Alert>
      )}

      <div className={styles.tableContainer}>
        <DataTable
          data={packages}
              columns={packageColumns}
              loading={packageIsPageLoading}
              page={packagePage}
              rowsPerPage={packageRowsPerPage}
              totalCount={packageTotalCount}
              onPageChange={packageHandlePageChange}
              onRowsPerPageChange={packageHandleRowsPerPageChange}
              onEdit={handlePackageEdit}
              onDelete={packageHandleDelete}
          emptyMessage="Không có gói bán nào. Hãy thêm gói bán đầu tiên để bắt đầu."
        />
      </div>

      <AdminFormDialog
            open={packageDialogOpen}
        onClose={() => {
              setPackageDialogOpen(false);
          setSelectedBenefits([]);
          setSelectedBranchId('');
          setAvailableBenefits([]);
        }}
            mode={packageDialogMode}
        title="Gói Bán"
        icon={PackageIcon}
            loading={packageActionLoading || dependenciesLoading}
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
              price: formData.get('price'),
              durationInMonths: formData.get('durationInMonths'),
              minDurationInMonths: formData.get('minDurationInMonths'),
              maxDurationInMonths: formData.get('maxDurationInMonths'),
              totalSlots: formData.get('totalSlots'),
              minSlots: formData.get('minSlots'),
              maxSlots: formData.get('maxSlots'),
              studentLevelId: formData.get('studentLevelId'),
              branchId: formData.get('branchId')
            };
            await handlePackageFormSubmit(data);
          }}
        >
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={8}>
                <TextField
                  name="name"
                  label="Tên Gói Bán"
                  required
                  fullWidth
                  placeholder="Ví dụ: Gói học tiếng Anh cơ bản"
                  defaultValue={selectedPackage?.name || ''}
                disabled={packageActionLoading}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { fontSize: '14px' }
                  }}
                />
              </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Chi Nhánh</InputLabel>
                <Select
                  name="branchId"
                  value={selectedBranchId}
                  onChange={(e) => {
                    setSelectedBranchId(e.target.value);
                    setSelectedBenefits([]);
                  }}
                  label="Chi Nhánh"
                  disabled={packageActionLoading || dependenciesLoading}
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

            <Grid item xs={12}>
              <TextField
                name="desc"
                label="Mô Tả"
                fullWidth
                multiline
                rows={3}
                placeholder="Mô tả chi tiết về gói bán..."
                defaultValue={selectedPackage?.desc || ''}
                disabled={packageActionLoading}
                sx={{ 
                  '& .MuiOutlinedInput-root': { fontSize: '14px' }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" className={styles.sectionLabel}>
                    Giá & Thời hạn
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    name="price"
                    label="Giá (VNĐ)"
                    type="number"
                    required
                    fullWidth
                    placeholder="Ví dụ: 1000000"
                    defaultValue={selectedPackage?.price || ''}
                    disabled={packageActionLoading}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { fontSize: '14px' }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    name="durationInMonths"
                    label="Thời hạn mặc định (tháng)"
                    type="number"
                    required
                    fullWidth
                    placeholder="Ví dụ: 6"
                    defaultValue={selectedPackage?.durationInMonths || ''}
                    disabled={packageActionLoading}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { fontSize: '14px' }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    name="minDurationInMonths"
                    label="Thời hạn thấp nhất (tháng)"
                    type="number"
                    fullWidth
                    placeholder="Ví dụ: 3"
                    defaultValue={selectedPackage?.minDurationInMonths || ''}
                    disabled={packageActionLoading}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { fontSize: '14px' }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    name="maxDurationInMonths"
                    label="Thời hạn cao nhất (tháng)"
                    type="number"
                    fullWidth
                    placeholder="Ví dụ: 12"
                    defaultValue={selectedPackage?.maxDurationInMonths || ''}
                    disabled={packageActionLoading}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { fontSize: '14px' }
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" className={styles.sectionLabel}>
                    Slot & Phạm vi áp dụng
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    name="minSlots"
                    label="Slot thấp nhất"
                    type="number"
                    fullWidth
                    placeholder="Ví dụ: 10"
                    defaultValue={selectedPackage?.minSlots || ''}
                    disabled={packageActionLoading}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { fontSize: '14px' }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    name="maxSlots"
                    label="Slot cao nhất"
                    type="number"
                    fullWidth
                    placeholder="Ví dụ: 30"
                    defaultValue={selectedPackage?.maxSlots || ''}
                    disabled={packageActionLoading}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { fontSize: '14px' }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    name="totalSlots"
                    label="Slot mặc định"
                    type="number"
                    required
                    fullWidth
                    placeholder="Ví dụ: 20"
                    defaultValue={selectedPackage?.totalSlots || ''}
                    disabled={packageActionLoading}
                    sx={{ 
                      '& .MuiOutlinedInput-root': { fontSize: '14px' }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Cấp Độ Học Sinh</InputLabel>
                    <Select
                      name="studentLevelId"
                      defaultValue={selectedPackage?.studentLevelId || ''}
                      label="Cấp Độ Học Sinh"
                      disabled={packageActionLoading || dependenciesLoading}
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
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Lợi Ích</InputLabel>
                    <Select
                      name="benefitIds"
                      multiple
                      value={selectedBenefits}
                      onChange={(e) => setSelectedBenefits(e.target.value)}
                      label="Lợi Ích"
                      disabled={
                        packageActionLoading ||
                        dependenciesLoading ||
                        loadingBenefits ||
                        !selectedBranchId
                      }
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => {
                            const benefit = availableBenefits.find((b) => b.id === value);
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
                          <ListItemText
                            primary={
                              selectedBranchId
                                ? 'Chi nhánh này chưa có lợi ích nào'
                                : 'Vui lòng chọn chi nhánh trước'
                            }
                          />
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                type="button"
                variant="outlined"
                  onClick={() => setPackageDialogOpen(false)}
                  disabled={packageActionLoading}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="contained"
                  disabled={packageActionLoading || dependenciesLoading}
                >
                  {packageActionLoading
                    ? 'Đang xử lý...'
                    : packageDialogMode === 'create'
                      ? 'Tạo Gói Bán'
                      : 'Cập nhật Gói Bán'}
              </Button>
            </Box>
          </Box>
        </AdminFormDialog>

      <ConfirmDialog
            open={packageConfirmDialog.open}
            onClose={() => setPackageConfirmDialog((prev) => ({ ...prev, open: false }))}
            onConfirm={packageConfirmDialog.onConfirm}
            title={packageConfirmDialog.title}
            description={packageConfirmDialog.description}
        confirmText="Xóa"
        cancelText="Hủy"
        confirmColor="error"
      />
        </>
      )}
    </div>
  );
};

export default PackageManagement;
