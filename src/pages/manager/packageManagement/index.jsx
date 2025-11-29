import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
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
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import DataTable from '../../../components/Common/DataTable';
import ManagementPageHeader from '../../../components/Management/PageHeader';
import ManagementSearchSection from '../../../components/Management/SearchSection';
import ContentLoading from '../../../components/Common/ContentLoading';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import Card from '../../../components/Common/Card';
import useBaseCRUD from '../../../hooks/useBaseCRUD';
import useManagerPackageDependencies from '../../../hooks/useManagerPackageDependencies';
import { getErrorMessage } from '../../../utils/errorHandler';
import { useApp } from '../../../contexts/AppContext';
import packageService from '../../../services/package.service';
import { createPackageColumns } from '../../../definitions/package/tableColumns';
import { CardGiftcard as BenefitIcon } from '@mui/icons-material';
import styles from './PackageManagement.module.css';

const ManagerPackageManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isInitialMount = useRef(true);
  const { showGlobalError } = useApp();
  const {
    templates,
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
    isPageLoading,
    loadingText,
    handleKeywordSearch,
    handleKeywordChange,
    handleClearSearch,
    handlePageChange,
    handleRowsPerPageChange,
    updateFilter,
    loadData
  } = useBaseCRUD({
    loadFunction: async (params) => {
      return packageService.getMyBranchPackagesPaged({
        pageIndex: params.pageIndex,
        pageSize: params.pageSize,
        searchTerm: params.searchTerm || params.Keyword || '',
        status: params.status === '' ? null : params.status === 'true',
        branchId: params.branchId || ''
      });
    },
    createFunction: packageService.createMyBranchPackage,
    updateFunction: packageService.updateMyBranchPackage,
    deleteFunction: null,
    defaultFilters: { status: '' },
    loadOnMount: true
  });

  const packageColumns = useMemo(() => createPackageColumns(styles), []);

  const [activeTab, setActiveTab] = useState('packages');

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    item: null
  });
  const [deletingPackageId, setDeletingPackageId] = useState(null);

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
        onChange={(event) => updateFilter('status', event.target.value)}
      >
        <MenuItem value="">
          <em>Tất cả trạng thái</em>
        </MenuItem>
        <MenuItem value="true">Hoạt động</MenuItem>
        <MenuItem value="false">Không hoạt động</MenuItem>
      </Select>
    </FormControl>
  ), [filters.status, updateFilter]);

  useEffect(() => {
    if (activeTab === 'templates' && !dependenciesLoading && templates.length === 0) {
      fetchDependencies();
    }
  }, [activeTab, dependenciesLoading, templates.length, fetchDependencies]);

  // Reload data when navigate back to this page (e.g., from create/update pages)
  useEffect(() => {
    if (location.pathname === '/manager/packages' && activeTab === 'packages') {
      // Skip first mount to avoid double loading
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }
      loadData(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, activeTab]);

  const handlePackageCreate = useCallback(() => {
    navigate('/manager/packages/create');
  }, [navigate]);

  const handlePackageEdit = useCallback(
    (packageItem) => {
      navigate(`/manager/packages/update/${packageItem.id}`);
    },
    [navigate]
  );

  const handleTemplateCreate = useCallback(
    (template) => {
      navigate(`/manager/packages/create?templateId=${template.id}`);
    },
    [navigate]
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

  const handleDeletePrompt = useCallback(
    (item) => {
      setDeleteDialog({ open: true, item });
    },
    []
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteDialog.item) return;
    
    const packageId = deleteDialog.item.id;
    setDeletingPackageId(packageId);
    
    try {
      await packageService.deletePackage(packageId);
      toast.success(`Đã xóa gói "${deleteDialog.item.name}" thành công!`);
      setDeleteDialog({ open: false, item: null });
      await loadData(false);
    } catch (err) {
      const errorMessage = getErrorMessage(err) || 'Có lỗi xảy ra khi xóa gói';
      toast.error(errorMessage, {
        autoClose: 5000,
        style: { whiteSpace: 'pre-line' }
      });
      showGlobalError(errorMessage);
    } finally {
      setDeletingPackageId(null);
    }
  }, [deleteDialog, loadData, showGlobalError]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialog({ open: false, item: null });
  }, []);

  return (
    <div className={styles.container}>
      {isPageLoading && <ContentLoading isLoading={isPageLoading} text={loadingText} />}

      <ManagementPageHeader
        title="Quản lý gói của chi nhánh"
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
            onKeywordChange={handleKeywordChange}
            onSearch={handleKeywordSearch}
            onClear={() => {
              handleClearSearch();
              updateFilter('status', '');
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
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              onView={(pkg) => navigate(`/manager/packages/detail/${pkg.id}`)}
              onEdit={handlePackageEdit}
              onDelete={handleDeletePrompt}
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
                <Box 
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: 3,
                    mt: 2
                  }}
                >
                  {templates.map((template) => (
                    <Card
                      key={template.id}
                      title={template.name}
                      description={template.desc || 'Không có mô tả'}
                      infoRows={[
                        {
                          label: 'GIÁ (VNĐ)',
                          value: `${template.minPrice?.toLocaleString('vi-VN') ?? '-'} - ${template.maxPrice?.toLocaleString('vi-VN') ?? '-'}`
                        },
                        {
                          label: 'THỜI HẠN (THÁNG)',
                          value: `${template.minDurationInMonths ?? '-'} - ${template.maxDurationInMonths ?? '-'}`
                        },
                        {
                          label: 'SLOTS',
                          value: `${template.minSlots ?? '-'} - ${template.maxSlots ?? '-'}`
                        }
                      ]}
                      actions={[
                        {
                          text: 'Tạo gói từ mẫu',
                          primary: true,
                          onClick: () => handleTemplateCreate(template)
                        }
                      ]}
                    />
                  ))}
                </Box>
              )}
            </>
          )}
        </div>
      )}

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa gói"
        description={`Bạn có chắc chắn muốn xóa gói "${deleteDialog.item?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        confirmColor="error"
        loading={deletingPackageId !== null}
      />
    </div>
  );
};

export default ManagerPackageManagement;


