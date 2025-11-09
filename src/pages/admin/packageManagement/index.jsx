import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import {
  ShoppingCart as PackageIcon,
  DashboardCustomize as TemplateTabIcon
} from '@mui/icons-material';
import DataTable from '../../../components/Common/DataTable';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import ManagementPageHeader from '../../../components/Management/PageHeader';
import ManagementSearchSection from '../../../components/Management/SearchSection';
import ManagementFormDialog from '../../../components/Management/FormDialog';
import ContentLoading from '../../../components/Common/ContentLoading';
import Form from '../../../components/Common/Form';
import packageService from '../../../services/package.service';
import packageTemplateService from '../../../services/packageTemplate.service';
import usePackageDependencies from '../../../hooks/usePackageDependencies';
import useBaseCRUD from '../../../hooks/useBaseCRUD';
import styles from './PackageManagement.module.css';
import { packageTemplateSchema, packageSchema } from '../../../utils/validationSchemas/packageSchemas';

const PackageManagement = () => {
  const [activeTab, setActiveTab] = useState('templates');

  const { 
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

  const [templateOptions, setTemplateOptions] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const fetchTemplateOptions = useCallback(async () => {
    setLoadingTemplates(true);
    try {
      const templatesData = await packageTemplateService.getAllTemplates();
      setTemplateOptions(templatesData || []);
    } catch (err) {
      setTemplateOptions([]);
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

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
          <TemplateTabIcon fontSize="small" color="primary" />
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
      key: 'packageStatus',
      header: <Typography className={styles.noWrap}>Trạng thái</Typography>,
      render: (_, item) => (
        <Chip
          label={item?.isActive ? 'Hoạt động' : 'Không hoạt động'}
          color={item?.isActive ? 'success' : 'default'}
          size="small"
          variant={item?.isActive ? 'filled' : 'outlined'}
        />
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
          <Typography variant="body2">
            <strong>Mẫu gói:</strong>{' '}
            {item?.packageTemplate?.name || item?.packageTemplateName || 'N/A'}
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
      isActive: data.isActive ?? true
    };
    await templateHandleFormSubmitBase(submitData);
  };

  const handlePackageCreate = async () => {
    if (studentLevelOptions.length === 0 && branchOptions.length === 0) {
      await fetchDependencies();
    }
    await fetchTemplateOptions();
    packageHandleCreateBase();
  };

  const handlePackageEdit = async (packageItem) => {
    if (studentLevelOptions.length === 0 && branchOptions.length === 0) {
      await fetchDependencies();
    }
    await fetchTemplateOptions();
    packageHandleEditBase(packageItem);
  };

  const handlePackageFormSubmit = async (data) => {
    const existingBenefitIds =
      packageDialogMode === 'edit'
        ? selectedPackage?.benefits?.map((b) => b.id) || []
        : [];

    const submitData = {
      name: data.name,
      desc: data.desc,
      durationInMonths: toNumber(data.durationInMonths),
      totalSlots: toNumber(data.totalSlots),
      price: toNumber(data.price),
      isActive: data.isActive ?? true,
      studentLevelId: data.studentLevelId,
      branchId: data.branchId,
      packageTemplateId: data.packageTemplateId,
      benefitIds: existingBenefitIds
    };
    await packageHandleFormSubmitBase(submitData);
  };

  const templateFormFields = useMemo(
    () => [
      {
        section: 'Thông tin cơ bản',
        sectionDescription: 'Các thông tin hiển thị khi quản trị chọn mẫu gói.',
        name: 'name',
        label: 'Tên Mẫu Gói',
        type: 'text',
        required: true,
        placeholder: 'Ví dụ: Mẫu gói tiếng Anh cơ bản',
        gridSize: 8,
        disabled: templateActionLoading
      },
      {
        name: 'isActive',
        label: 'Trạng thái hoạt động',
        type: 'switch',
        gridSize: 4,
        disabled: templateActionLoading
      },
      {
        name: 'desc',
        label: 'Mô Tả',
        type: 'textarea',
        rows: 3,
        placeholder: 'Mô tả chi tiết về mẫu gói...',
        gridSize: 12,
        disabled: templateActionLoading
      },
      {
        section: 'Khoảng giá đề xuất',
        sectionDescription: 'Thiết lập khung giá khi tạo gói dựa trên mẫu.',
        name: 'minPrice',
        label: 'Giá thấp nhất (VNĐ)',
        type: 'number',
        required: true,
        placeholder: 'Ví dụ: 500000',
        gridSize: 4,
        disabled: templateActionLoading
      },
      {
        name: 'defaultPrice',
        label: 'Giá mặc định (VNĐ)',
        type: 'number',
        required: true,
        placeholder: 'Ví dụ: 1000000',
        gridSize: 4,
        disabled: templateActionLoading
      },
      {
        name: 'maxPrice',
        label: 'Giá cao nhất (VNĐ)',
        type: 'number',
        required: true,
        placeholder: 'Ví dụ: 2000000',
        gridSize: 4,
        disabled: templateActionLoading
      },
      {
        section: 'Thời hạn & Slot',
        sectionDescription: 'Giới hạn thời lượng và số lượng slot cho mẫu gói.',
        name: 'minDurationInMonths',
        label: 'Thời hạn thấp nhất (tháng)',
        type: 'number',
        required: true,
        placeholder: 'Ví dụ: 3',
        gridSize: 4,
        disabled: templateActionLoading
      },
      {
        name: 'defaultDurationInMonths',
        label: 'Thời hạn mặc định (tháng)',
        type: 'number',
        required: true,
        placeholder: 'Ví dụ: 6',
        gridSize: 4,
        disabled: templateActionLoading
      },
      {
        name: 'maxDurationInMonths',
        label: 'Thời hạn cao nhất (tháng)',
        type: 'number',
        required: true,
        placeholder: 'Ví dụ: 12',
        gridSize: 4,
        disabled: templateActionLoading
      },
      {
        name: 'minSlots',
        label: 'Slot thấp nhất',
        type: 'number',
        required: true,
        placeholder: 'Ví dụ: 10',
        gridSize: 4,
        disabled: templateActionLoading
      },
      {
        name: 'defaultTotalSlots',
        label: 'Slot mặc định',
        type: 'number',
        required: true,
        placeholder: 'Ví dụ: 20',
        gridSize: 4,
        disabled: templateActionLoading
      },
      {
        name: 'maxSlots',
        label: 'Slot cao nhất',
        type: 'number',
        required: true,
        placeholder: 'Ví dụ: 30',
        gridSize: 4,
        disabled: templateActionLoading
      }
    ],
    [templateActionLoading]
  );

  const templateDefaultValues = useMemo(() => ({
    name: selectedTemplate?.name || '',
    desc: selectedTemplate?.desc || '',
    minPrice: selectedTemplate?.minPrice ?? '',
    maxPrice: selectedTemplate?.maxPrice ?? '',
    defaultPrice: selectedTemplate?.defaultPrice ?? '',
    minDurationInMonths: selectedTemplate?.minDurationInMonths ?? '',
    maxDurationInMonths: selectedTemplate?.maxDurationInMonths ?? '',
    defaultDurationInMonths: selectedTemplate?.defaultDurationInMonths ?? '',
    minSlots: selectedTemplate?.minSlots ?? '',
    maxSlots: selectedTemplate?.maxSlots ?? '',
    defaultTotalSlots: selectedTemplate?.defaultTotalSlots ?? '',
    isActive: selectedTemplate?.isActive ?? true
  }), [selectedTemplate]);

  const branchSelectOptions = useMemo(
    () => [
      { value: '', label: 'Chọn chi nhánh' },
      ...branchOptions.map((branch) => ({
        value: branch.id,
        label: branch.name
      }))
    ],
    [branchOptions]
  );

  const studentLevelSelectOptions = useMemo(
    () => [
      { value: '', label: 'Chọn cấp độ học sinh' },
      ...studentLevelOptions.map((level) => ({
        value: level.id,
        label: level.name
      }))
    ],
    [studentLevelOptions]
  );

  const templateSelectOptions = useMemo(() => {
    if (loadingTemplates) {
      return [{ value: '', label: 'Đang tải mẫu gói...' }];
    }

    const baseOptions = templateOptions.map((template) => ({
      value: template.id,
      label: template.name
    }));

    const placeholderLabel = baseOptions.length
      ? 'Chọn mẫu gói'
      : 'Không có mẫu gói khả dụng';

    const options = [{ value: '', label: placeholderLabel }, ...baseOptions];

    const currentTemplateId =
      selectedPackage?.packageTemplateId || selectedPackage?.packageTemplate?.id;

    if (
      currentTemplateId &&
      !options.some((option) => option.value === currentTemplateId)
    ) {
      options.push({
        value: currentTemplateId,
        label:
          selectedPackage?.packageTemplate?.name ||
          selectedPackage?.packageTemplateName ||
          'Mẫu gói hiện tại'
      });
    }

    return options;
  }, [loadingTemplates, templateOptions, selectedPackage]);

  const packageFormFields = useMemo(
    () => [
      {
        section: 'Thông tin cơ bản',
        sectionDescription: 'Thông tin quản trị viên sẽ thấy khi quản lý gói bán.',
        name: 'name',
        label: 'Tên Gói Bán',
        type: 'text',
        required: true,
        placeholder: 'Ví dụ: Gói bán tiếng Anh cơ bản',
        gridSize: 8,
        disabled: packageActionLoading || dependenciesLoading || loadingTemplates
      },
      {
        name: 'isActive',
        label: 'Trạng thái hoạt động',
        type: 'switch',
        gridSize: 4,
        disabled: packageActionLoading || dependenciesLoading
      },
      {
        name: 'desc',
        label: 'Mô Tả',
        type: 'textarea',
        rows: 3,
        placeholder: 'Mô tả chi tiết về gói bán...',
        gridSize: 12,
        disabled: packageActionLoading || dependenciesLoading
      },
      {
        section: 'Liên kết dữ liệu',
        sectionDescription: 'Xác định mẫu gói, chi nhánh và cấp độ học sinh áp dụng.',
        name: 'packageTemplateId',
        label: 'Mẫu Gói',
        type: 'select',
        required: true,
        options: templateSelectOptions,
        gridSize: 4,
        disabled: packageActionLoading || dependenciesLoading || loadingTemplates
      },
      {
        name: 'branchId',
        label: 'Chi Nhánh',
        type: 'select',
        required: true,
        options: branchSelectOptions,
        gridSize: 4,
        disabled: packageActionLoading || dependenciesLoading
      },
      {
        name: 'studentLevelId',
        label: 'Cấp Độ Học Sinh',
        type: 'select',
        required: true,
        options: studentLevelSelectOptions,
        gridSize: 4,
        disabled: packageActionLoading || dependenciesLoading
      },
      {
        section: 'Thông số gói',
        sectionDescription: 'Thiết lập giá bán và số slot mặc định của gói.',
        name: 'price',
        label: 'Giá (VNĐ)',
        type: 'number',
        required: true,
        placeholder: 'Ví dụ: 1000000',
        gridSize: 4,
        disabled: packageActionLoading || dependenciesLoading
      },
      {
        name: 'durationInMonths',
        label: 'Thời hạn (tháng)',
        type: 'number',
        required: true,
        placeholder: 'Ví dụ: 6',
        gridSize: 4,
        disabled: packageActionLoading || dependenciesLoading
      },
      {
        name: 'totalSlots',
        label: 'Tổng số slot',
        type: 'number',
        required: true,
        placeholder: 'Ví dụ: 20',
        gridSize: 4,
        disabled: packageActionLoading || dependenciesLoading
      }
    ],
    [
      packageActionLoading,
      dependenciesLoading,
      loadingTemplates,
      templateSelectOptions,
      branchSelectOptions,
      studentLevelSelectOptions
    ]
  );

  const packageDefaultValues = useMemo(
    () => ({
      name: selectedPackage?.name || '',
      desc: selectedPackage?.desc || '',
      price: selectedPackage?.price ?? '',
      durationInMonths: selectedPackage?.durationInMonths ?? '',
      totalSlots: selectedPackage?.totalSlots ?? '',
      studentLevelId:
        selectedPackage?.studentLevelId || selectedPackage?.studentLevel?.id || '',
      branchId: selectedPackage?.branchId || selectedPackage?.branch?.id || '',
      packageTemplateId:
        selectedPackage?.packageTemplateId ||
        selectedPackage?.packageTemplate?.id ||
        '',
      isActive: selectedPackage?.isActive ?? true
    }),
    [selectedPackage]
  );

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
      
      <ManagementPageHeader
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
          <ManagementSearchSection
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
          </ManagementSearchSection>

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

          <ManagementFormDialog
            open={templateDialogOpen}
            onClose={() => setTemplateDialogOpen(false)}
            mode={templateDialogMode}
            title="Mẫu Gói"
            icon={TemplateTabIcon}
            loading={templateActionLoading}
            maxWidth="md"
          >
            <Form
              key={`template-${templateDialogMode}-${selectedTemplate?.id || 'new'}`}
              schema={packageTemplateSchema}
              defaultValues={templateDefaultValues}
              onSubmit={handleTemplateFormSubmit}
              submitText={templateDialogMode === 'create' ? 'Tạo Mẫu Gói' : 'Cập nhật Mẫu Gói'}
              loading={templateActionLoading}
                    disabled={templateActionLoading}
              fields={templateFormFields}
              showReset={templateDialogMode === 'create'}
            />
          </ManagementFormDialog>

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
          <ManagementSearchSection
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
      </ManagementSearchSection>

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
              expandableConfig={{
                isRowExpandable: (item) => Array.isArray(item?.benefits) && item.benefits.length > 0,
              renderExpandedContent: (item) => (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Lợi ích trong gói
                  </Typography>
                  {item.benefits.length > 0 ? (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead sx={{ backgroundColor: '#f0f4ff' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Tên lợi ích</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {item.benefits.map((benefit, idx) => (
                            <TableRow key={benefit.id || idx}>
                              <TableCell>
                                <Typography fontWeight={600}>{benefit.name}</Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Không có lợi ích nào trong gói này.
                    </Typography>
                  )}
                </Box>
              )
              }}
          emptyMessage="Không có gói bán nào. Hãy thêm gói bán đầu tiên để bắt đầu."
        />
      </div>

      <ManagementFormDialog
            open={packageDialogOpen}
        onClose={() => setPackageDialogOpen(false)}
            mode={packageDialogMode}
        title="Gói Bán"
        icon={PackageIcon}
        loading={packageActionLoading || dependenciesLoading || loadingTemplates}
        maxWidth="lg"
      >
        <Form
          key={`package-${packageDialogMode}-${selectedPackage?.id || 'new'}`}
          schema={packageSchema}
          defaultValues={packageDefaultValues}
          onSubmit={handlePackageFormSubmit}
          submitText={packageDialogMode === 'create' ? 'Tạo Gói Bán' : 'Cập nhật Gói Bán'}
          loading={packageActionLoading || dependenciesLoading || loadingTemplates}
          disabled={packageActionLoading || dependenciesLoading || loadingTemplates}
          fields={packageFormFields}
          showReset={packageDialogMode === 'create'}
        />
      </ManagementFormDialog>

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
