import React, { useMemo, useCallback, useState, useEffect } from 'react';
import {
  Box,
  Alert,
  Button,
  Typography,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  Chip
} from '@mui/material';
import DataTable from '../../../components/Common/DataTable';
import Form from '../../../components/Common/Form';
import ManagementPageHeader from '../../../components/Management/PageHeader';
import ManagementSearchSection from '../../../components/Management/SearchSection';
import ManagementFormDialog from '../../../components/Management/FormDialog';
import ContentLoading from '../../../components/Common/ContentLoading';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import useBaseCRUD from '../../../hooks/useBaseCRUD';
import useManagerPackageDependencies from '../../../hooks/useManagerPackageDependencies';
import packageService from '../../../services/package.service';
import { createPackageColumns } from '../../../constants/package/tableColumns';
import { createManagerPackageFormFields } from '../../../constants/manager/package/formFields';
import { managerBranchPackageSchema } from '../../../utils/validationSchemas/packageSchemas';
import { CardGiftcard as BenefitIcon } from '@mui/icons-material';
import styles from './PackageManagement.module.css';

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? 0 : numericValue;
};

const extractBenefitIds = (source) => {
  if (!source) return [];
  if (Array.isArray(source.benefits)) {
    return source.benefits
      .map((benefit) => benefit?.id || benefit?.benefitId)
      .filter(Boolean);
  }
  if (Array.isArray(source.benefitIds)) {
    return source.benefitIds.filter(Boolean);
  }
  if (Array.isArray(source.templateBenefits)) {
    return source.templateBenefits
      .map((item) => item?.benefitId || item?.id)
      .filter(Boolean);
  }
  return [];
};

const ManagerPackageManagement = () => {
  const {
    templates,
    studentLevelOptions,
    benefitOptions,
    loading: dependenciesLoading,
    error: dependenciesError,
    fetchDependencies
  } = useManagerPackageDependencies();

  const {
    data: packages,
    totalCount,
    page,
    rowsPerPage,
    keyword,
    filters,
    error,
    actionLoading,
    isPageLoading,
    loadingText,
    openDialog: packageDialogOpen,
    setOpenDialog: setPackageDialogOpen,
    dialogMode: packageDialogMode,
    selectedItem: selectedPackage,
    handleCreate: packageHandleCreateBase,
    handleEdit: packageHandleEditBase,
    handleFormSubmit: packageHandleFormSubmitBase,
    handleKeywordSearch: packageHandleKeywordSearch,
    handleKeywordChange: packageHandleKeywordChange,
    handleClearSearch: packageHandleClearSearch,
    handlePageChange: packageHandlePageChange,
    handleRowsPerPageChange: packageHandleRowsPerPageChange,
    updateFilter: packageUpdateFilter,
    loadData
  } = useBaseCRUD({
    loadFunction: packageService.getMyBranchPackagesPaged,
    createFunction: packageService.createMyBranchPackage,
    updateFunction: packageService.updateMyBranchPackage,
    deleteFunction: null,
    defaultFilters: { status: '' },
    loadOnMount: true
  });

  const packageColumns = useMemo(() => createPackageColumns(styles), []);

  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [activeTab, setActiveTab] = useState('packages');
  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) || null,
    [templates, selectedTemplateId]
  );

  const packageFormFields = useMemo(
    () =>
      createManagerPackageFormFields({
        actionLoading,
        dependenciesLoading,
        studentLevelOptions,
        benefitOptions,
        selectedTemplate
      }),
    [actionLoading, dependenciesLoading, studentLevelOptions, benefitOptions, selectedTemplate]
  );

  const validationSchema = useMemo(
    () => managerBranchPackageSchema(selectedTemplate),
    [selectedTemplate]
  );

  const hasDependencies = templates.length > 0 && studentLevelOptions.length > 0;

  const [deactivateDialog, setDeactivateDialog] = useState({
    open: false,
    item: null
  });

  const statusFilterControl = useMemo(() => (
    <FormControl size="small" className={styles.filterControl}>
      <InputLabel id="manager-package-status-label" shrink>
        Trạng thái
      </InputLabel>
      <Select
        labelId="manager-package-status-label"
        value={filters.status || ''}
        label="Trạng thái"
        notched
        displayEmpty
        renderValue={(selected) => {
          if (!selected) {
            return <span className={styles.filterPlaceholder}>Tất cả trạng thái</span>;
          }
          if (selected === 'true') return 'Hoạt động';
          if (selected === 'false') return 'Không hoạt động';
          return 'Không xác định';
        }}
        onChange={(event) => packageUpdateFilter('status', event.target.value)}
      >
        <MenuItem value="">
          <em>Tất cả trạng thái</em>
        </MenuItem>
        <MenuItem value="true">Hoạt động</MenuItem>
        <MenuItem value="false">Không hoạt động</MenuItem>
      </Select>
    </FormControl>
  ), [filters.status, packageUpdateFilter]);

  const packageDefaultValues = useMemo(() => {
    if (packageDialogMode === 'edit' && selectedPackage) {
      return {
        name: selectedPackage?.name || '',
        desc: selectedPackage?.desc || '',
        price: selectedPackage?.price ?? '',
        durationInMonths: selectedPackage?.durationInMonths ?? '',
        totalSlots: selectedPackage?.totalSlots ?? '',
        studentLevelId:
          selectedPackage?.studentLevelId || selectedPackage?.studentLevel?.id || '',
        isActive: selectedPackage?.isActive ?? true,
        packageTemplateId: selectedTemplate?.id || selectedPackage?.packageTemplateId || '',
        benefitIds: extractBenefitIds(selectedPackage).map(String)
      };
    }

    return {
      name: '',
      desc: '',
      price: selectedTemplate?.defaultPrice ?? '',
      durationInMonths: selectedTemplate?.defaultDurationInMonths ?? '',
      totalSlots: selectedTemplate?.defaultTotalSlots ?? '',
      studentLevelId: studentLevelOptions[0]?.value || '',
      isActive: true,
      packageTemplateId: selectedTemplate?.id || '',
      benefitIds: extractBenefitIds(selectedTemplate).map(String)
    };
  }, [packageDialogMode, selectedPackage, selectedTemplate, studentLevelOptions]);

  useEffect(() => {
    if (!packageDialogOpen) {
      setSelectedTemplateId(null);
    }
  }, [packageDialogOpen]);

  useEffect(() => {
    if (!packageDialogOpen || packageDialogMode !== 'edit' || !selectedPackage) {
      return;
    }

    const templateId =
      selectedPackage.packageTemplateId || selectedPackage.packageTemplate?.id || null;
    setSelectedTemplateId(templateId);
  }, [packageDialogOpen, packageDialogMode, selectedPackage]);

  useEffect(() => {
    if (activeTab === 'templates' && !dependenciesLoading && templates.length === 0) {
      fetchDependencies();
    }
  }, [activeTab, dependenciesLoading, templates.length, fetchDependencies]);

  const handlePackageCreate = useCallback(async () => {
    setActiveTab('templates');
    if (!hasDependencies && !dependenciesLoading) {
      await fetchDependencies();
    }
  }, [dependenciesLoading, fetchDependencies, hasDependencies]);

  const handlePackageEdit = useCallback(
    async (packageItem) => {
      let success = true;
      if (!hasDependencies) {
        success = await fetchDependencies();
      }
      if (!success) return;
      packageHandleEditBase(packageItem);
    },
    [fetchDependencies, packageHandleEditBase, hasDependencies]
  );

  const handlePackageFormSubmit = useCallback(
    async (data) => {
      const isCreateMode = packageDialogMode === 'create';
      if (isCreateMode && !selectedTemplate) {
        throw new Error('Vui lòng chọn mẫu gói trước khi lưu.');
      }

      const templateIdForSubmit =
        selectedTemplate?.id ??
        selectedPackage?.packageTemplateId ??
        selectedPackage?.packageTemplate?.id ??
        null;

      const benefitIdsFromForm = Array.isArray(data.benefitIds)
        ? data.benefitIds.filter(Boolean).map(String)
        : data.benefitIds
        ? [data.benefitIds].filter(Boolean).map(String)
        : [];

      const fallbackBenefitIds = (
        isCreateMode
          ? extractBenefitIds(selectedTemplate)
          : extractBenefitIds(selectedPackage)
      ).map(String);

      const benefitIds = benefitIdsFromForm.length ? benefitIdsFromForm : fallbackBenefitIds;

      const submitData = {
        name: data.name,
        desc: data.desc,
        durationInMonths: toNumber(data.durationInMonths),
        totalSlots: toNumber(data.totalSlots),
        price: toNumber(data.price),
        isActive: data.isActive ?? true,
        studentLevelId: data.studentLevelId || null,
        packageTemplateId: templateIdForSubmit,
        benefitIds
      };

      await packageHandleFormSubmitBase(submitData);
    },
    [packageDialogMode, packageHandleFormSubmitBase, selectedPackage, selectedTemplate]
  );

  const renderBenefits = useCallback((item) => {
    const benefits = item?.benefits || [];

    if (!benefits.length) {
      return (
        <Typography variant="body2" color="text.secondary">
          Gói này chưa gán lợi ích nào.
        </Typography>
      );
    }

    return (
      <Box className={styles.benefitWrapper}>
        <Box className={styles.benefitMeta}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Lợi ích trong gói
          </Typography>
          <Chip
            label={`${benefits.length} lợi ích`}
            color="primary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 500 }}
          />
        </Box>
        <TableContainer component={Paper} variant="outlined" className={styles.benefitTable}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: 'grey.100' }}>
              <TableRow>
                <TableCell sx={{ width: 56, fontWeight: 600 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tên lợi ích</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Mô tả</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {benefits.map((benefit, idx) => (
                  <TableRow
                    key={benefit.id || idx}
                    hover
                    sx={{ '&:hover': { backgroundColor: 'grey.50' } }}
                  >
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <BenefitIcon fontSize="small" color="primary" />
                        <Typography fontWeight={600}>{benefit.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {benefit.description || benefit.desc || 'Không có mô tả'}
                      </Typography>
                    </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }, []);

  const buildUpdatePayload = (pkg, override = {}) => ({
    name: pkg.name,
    desc: pkg.desc,
    durationInMonths: pkg.durationInMonths,
    totalSlots: pkg.totalSlots,
    price: pkg.price,
    isActive: pkg.isActive,
    studentLevelId: pkg.studentLevel?.id || pkg.studentLevelId || null,
    packageTemplateId: pkg.packageTemplateId || pkg.packageTemplate?.id || null,
    ...override
  });

  const handleDeactivatePrompt = useCallback(
    (item) => {
      setDeactivateDialog({ open: true, item });
    },
    []
  );

  const handleDeactivateConfirm = useCallback(async () => {
    if (!deactivateDialog.item) return;
    const payload = buildUpdatePayload(deactivateDialog.item, { isActive: false });
    await packageService.updateMyBranchPackage(deactivateDialog.item.id, payload);
    setDeactivateDialog({ open: false, item: null });
    await loadData(false);
  }, [deactivateDialog, loadData]);

  const handleDeactivateCancel = useCallback(() => {
    setDeactivateDialog({ open: false, item: null });
  }, []);

  const handleTemplateCreate = useCallback(
    async (template) => {
      let success = true;
      if (!hasDependencies) {
        success = await fetchDependencies();
      }
      if (!success) return;
      setSelectedTemplateId(template.id);
      packageHandleCreateBase();
    },
    [fetchDependencies, hasDependencies, packageHandleCreateBase]
  );

  const handleTemplateChange = useCallback(() => {
    setPackageDialogOpen(false);
    setSelectedTemplateId(null);
    setActiveTab('templates');
  }, [setPackageDialogOpen, setActiveTab]);

  return (
    <div className={styles.container}>
      {isPageLoading && <ContentLoading isLoading={isPageLoading} text={loadingText} />}

      <ManagementPageHeader
        title="Quản lý gói của chi nhánh"
        createButtonText="Tạo gói mới"
        onCreateClick={activeTab === 'packages' ? handlePackageCreate : null}
      />

      <Paper
        className={styles.tabsWrapper}
        elevation={0}
        sx={{
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          border: '1px solid #e0e0e0',
          backgroundColor: '#fff',
          mb: 2
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          variant="fullWidth"
          aria-label="manager package tabs"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '15px',
              fontWeight: 500,
              minHeight: 56,
              padding: '12px 24px',
              color: 'text.secondary',
              transition: 'all 0.3s ease',
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
          <Tab value="packages" label="Gói đang bán" disableRipple />
          <Tab value="templates" label="Mẫu gói" disableRipple />
        </Tabs>
      </Paper>

      {dependenciesError && (
        <Alert
          severity="warning"
          className={styles.errorAlert}
          action={
            <Button color="inherit" size="small" onClick={fetchDependencies}>
              Thử lại
            </Button>
          }
        >
          {dependenciesError}
        </Alert>
      )}

      {activeTab === 'packages' && (
        <>
          <ManagementSearchSection
            keyword={keyword}
            onKeywordChange={packageHandleKeywordChange}
            onSearch={packageHandleKeywordSearch}
            onClear={() => {
              packageHandleClearSearch();
              packageUpdateFilter('status', '');
            }}
            placeholder="Tìm kiếm theo tên gói bán..."
          >
            {statusFilterControl}
          </ManagementSearchSection>

          {error && (
            <Alert severity="error" className={styles.errorAlert}>
              {error}
            </Alert>
          )}

          <div className={styles.tableWrapper}>
            <DataTable
              data={packages}
              columns={packageColumns}
              loading={isPageLoading}
              page={page}
              rowsPerPage={rowsPerPage}
              totalCount={totalCount}
              onPageChange={packageHandlePageChange}
              onRowsPerPageChange={packageHandleRowsPerPageChange}
              onEdit={handlePackageEdit}
              onDelete={handleDeactivatePrompt}
              expandableConfig={{
                isRowExpandable: (item) => Array.isArray(item?.benefits) && item.benefits.length > 0,
                renderExpandedContent: renderBenefits
              }}
            />
          </div>
        </>
      )}

      {activeTab === 'templates' && (
        <div className={styles.templateTabContent}>
          {dependenciesLoading && templates.length === 0 ? (
            <Box className={styles.templateLoading}>
              <CircularProgress size={32} />
              <Typography variant="body2" color="text.secondary">
                Đang tải mẫu gói...
              </Typography>
            </Box>
          ) : (
            <>
              {templates.length === 0 ? (
                <Alert severity="info" className={styles.templateEmpty}>
                  Hiện chưa có mẫu gói nào khả dụng. Liên hệ quản trị viên để được cấp mẫu.
                </Alert>
              ) : (
                <Box className={styles.templateList}>
                  {templates.map((template) => (
                    <Paper key={template.id} className={styles.templateCard} elevation={2}>
                      <div className={styles.templateCardHeader}>
                        <Typography variant="subtitle1" className={styles.templateCardTitle}>
                          {template.name}
                        </Typography>
                      </div>
                      <Typography variant="body2" color="text.secondary" className={styles.templateDescription}>
                        {template.desc || 'Không có mô tả'}
                      </Typography>
                      <Box className={styles.templateMetrics}>
                        <div className={styles.templateMetric}>
                          <span className={styles.metricLabel}>Giá (VNĐ)</span>
                          <span className={styles.metricValue}>
                            {template.minPrice?.toLocaleString('vi-VN') ?? '-'} -{' '}
                            {template.maxPrice?.toLocaleString('vi-VN') ?? '-'}
                          </span>
                        </div>
                        <div className={styles.templateMetric}>
                          <span className={styles.metricLabel}>Thời hạn (tháng)</span>
                          <span className={styles.metricValue}>
                            {template.minDurationInMonths ?? '-'} - {template.maxDurationInMonths ?? '-'}
                          </span>
                        </div>
                        <div className={styles.templateMetric}>
                          <span className={styles.metricLabel}>Slots</span>
                          <span className={styles.metricValue}>
                            {template.minSlots ?? '-'} - {template.maxSlots ?? '-'}
                          </span>
                        </div>
                      </Box>
                      <Button
                        variant="contained"
                        size="small"
                        className={styles.templateSelectButton}
                        onClick={() => handleTemplateCreate(template)}
                      >
                        Tạo gói từ mẫu
                      </Button>
                    </Paper>
                  ))}
                </Box>
              )}
            </>
          )}
        </div>
      )}

      <ManagementFormDialog
        open={packageDialogOpen}
        onClose={() => setPackageDialogOpen(false)}
        mode={packageDialogMode}
        title="Gói Bán"
        loading={actionLoading || dependenciesLoading}
        maxWidth="md"
      >
        {selectedTemplate && (
          <Box className={styles.templateSummary}>
            <Box className={styles.templateSummaryContent}>
              <Typography variant="subtitle1" className={styles.templateSummaryTitle}>
                {selectedTemplate.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" className={styles.templateSummaryDesc}>
                {selectedTemplate.desc || 'Không có mô tả'}
              </Typography>
            </Box>
            <Box className={styles.templateSummaryActions}>
              <Button variant="text" onClick={handleTemplateChange}>
                Đổi mẫu
              </Button>
            </Box>
          </Box>
        )}

        {packageDialogMode !== 'create' || selectedTemplate ? (
          <Form
            key={`manager-package-${packageDialogMode}-${selectedPackage?.id || 'new'}-${selectedTemplate?.id || 'none'}`}
            schema={validationSchema}
            defaultValues={packageDefaultValues}
            onSubmit={handlePackageFormSubmit}
            submitText={packageDialogMode === 'create' ? 'Tạo Gói Bán' : 'Cập nhật Gói Bán'}
            loading={actionLoading || dependenciesLoading}
            fields={packageFormFields}
            showReset={packageDialogMode === 'create'}
          />
        ) : (
          <Alert severity="info">
            Vui lòng chọn một mẫu gói từ tab "Mẫu gói" trước khi tạo mới.
          </Alert>
        )}
      </ManagementFormDialog>

      <ConfirmDialog
        open={deactivateDialog.open}
        onClose={handleDeactivateCancel}
        onConfirm={handleDeactivateConfirm}
        title="Xác nhận vô hiệu hóa"
        description={`Bạn có chắc muốn vô hiệu hóa gói "${deactivateDialog.item?.name}"? Người dùng sẽ không còn thấy gói này.`}
        confirmText="Vô hiệu hóa"
        cancelText="Hủy"
        confirmColor="error"
      />
    </div>
  );
};

export default ManagerPackageManagement;


