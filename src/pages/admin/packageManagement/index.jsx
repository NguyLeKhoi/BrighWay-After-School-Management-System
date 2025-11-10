import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Alert,
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
import useFacilityBranchData from '../../../hooks/useFacilityBranchData';
import { createTemplateColumns, createPackageColumns } from '../../../constants/package/tableColumns';
import { createTemplateFormFields, createPackageFormFields } from '../../../constants/package/formFields';
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
        status: params.status === '' ? null : params.status === 'true',
        branchId: params.branchId || ''
      });
    },
    createFunction: packageService.createPackage,
    updateFunction: packageService.updatePackage,
    deleteFunction: packageService.deletePackage,
    defaultFilters: { status: '', branchId: '' },
    loadOnMount: true
  });

  const [templateOptions, setTemplateOptions] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [branchFilterLoading, setBranchFilterLoading] = useState(false);

  const { branches, fetchBranches } = useFacilityBranchData();

  useEffect(() => {
    let isMounted = true;

    const loadBranches = async () => {
      setBranchFilterLoading(true);
      try {
        await fetchBranches();
      } finally {
        if (isMounted) {
          setBranchFilterLoading(false);
        }
      }
    };

    loadBranches();

    return () => {
      isMounted = false;
    };
  }, [fetchBranches]);

  const branchFilterOptions = useMemo(
    () => [
      { value: '', label: 'Tất cả chi nhánh' },
      ...branches.map((branch) => ({
        value: branch.id,
        label: branch.branchName
      }))
    ],
    [branches]
  );

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

  const templateColumns = useMemo(() => createTemplateColumns(styles), [styles]);
  const packageColumns = useMemo(() => createPackageColumns(styles), [styles]);

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
    () => createTemplateFormFields({ templateActionLoading }),
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
    () =>
      createPackageFormFields({
        packageActionLoading,
        dependenciesLoading,
        loadingTemplates,
        templateSelectOptions,
        branchSelectOptions,
        studentLevelSelectOptions
      }),
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

  const renderBranchFilter = (value, onChange) => (
    <FormControl className={styles.statusFilter} disabled={branchFilterLoading}>
      <InputLabel>Chi nhánh</InputLabel>
      <Select value={value} onChange={onChange} label="Chi nhánh">
        {branchFilterOptions.map((option) => (
          <MenuItem key={option.value || 'all-branches'} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
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
              packageUpdateFilter('branchId', '');
            }}
            placeholder="Tìm kiếm theo tên gói bán..."
          >
            {renderStatusFilter(packageFilters.status || '', (e) =>
              packageUpdateFilter('status', e.target.value)
            )}
            {renderBranchFilter(packageFilters.branchId || '', (e) =>
              packageUpdateFilter('branchId', e.target.value)
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
