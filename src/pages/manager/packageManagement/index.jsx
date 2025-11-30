import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import {
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  CircularProgress,
  Button,
  TablePagination
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
import { createManagerPackageColumns } from '../../../definitions/package/tableColumns';
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

  const packageColumns = useMemo(() => createManagerPackageColumns(styles), []);

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    item: null
  });
  const [deletingPackageId, setDeletingPackageId] = useState(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templatePage, setTemplatePage] = useState(0);
  const templatesPerPage = 3;

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

  // Reload data when navigate back to this page (e.g., from create/update pages)
  useEffect(() => {
    if (location.pathname === '/manager/packages') {
      // Skip first mount to avoid double loading
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }
      loadData(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handlePackageCreate = useCallback(() => {
    setTemplateDialogOpen(true);
    setTemplatePage(0); // Reset to first page when opening dialog
    if (templates.length === 0) {
      fetchDependencies();
    }
  }, [templates.length, fetchDependencies]);

  const handleTemplateSelect = useCallback(
    (template) => {
      setTemplateDialogOpen(false);
      navigate(`/manager/packages/create?templateId=${template.id}`);
    },
    [navigate]
  );

  const handleTemplateDialogClose = useCallback(() => {
    setTemplateDialogOpen(false);
    setTemplatePage(0); // Reset page when closing dialog
  }, []);

  // Calculate paginated templates
  const paginatedTemplates = useMemo(() => {
    const startIndex = templatePage * templatesPerPage;
    const endIndex = startIndex + templatesPerPage;
    return templates.slice(startIndex, endIndex);
  }, [templates, templatePage, templatesPerPage]);

  const handleTemplatePageChange = useCallback((event, newPage) => {
    setTemplatePage(newPage);
  }, []);

  const handleTemplateRowsPerPageChange = useCallback((event) => {
    // Keep templatesPerPage fixed at 3, but handle if needed
    setTemplatePage(0);
  }, []);

  const handlePackageEdit = useCallback(
    (packageItem) => {
      navigate(`/manager/packages/update/${packageItem.id}`);
    },
    [navigate]
  );

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
        createButtonText="Tạo gói"
        onCreateClick={handlePackageCreate}
      />

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

      {/* Template Selection Dialog */}
      <Dialog
        open={templateDialogOpen}
        onClose={handleTemplateDialogClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Chọn mẫu gói
          </Typography>
        </DialogTitle>
        <DialogContent>
          {dependenciesError && (
            <Alert
              severity="warning"
              sx={{ mb: 2 }}
              action={
                <Button color="inherit" size="small" onClick={fetchDependencies}>
                  Thử lại
                </Button>
              }
            >
              {dependenciesError}
            </Alert>
          )}

          {dependenciesLoading && templates.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
              <CircularProgress size={32} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Đang tải mẫu gói...
              </Typography>
            </Box>
          ) : templates.length === 0 ? (
            <Alert severity="info">
              Hiện chưa có mẫu gói nào khả dụng. Liên hệ quản trị viên để được cấp mẫu.
            </Alert>
          ) : (
            <>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: 3,
                  py: 2
                }}
              >
                {paginatedTemplates.map((template) => (
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
                        onClick: () => handleTemplateSelect(template)
                      }
                    ]}
                  />
                ))}
              </Box>
              {templates.length > templatesPerPage && (
                <TablePagination
                  component="div"
                  count={templates.length}
                  page={templatePage}
                  onPageChange={handleTemplatePageChange}
                  rowsPerPage={templatesPerPage}
                  onRowsPerPageChange={handleTemplateRowsPerPageChange}
                  rowsPerPageOptions={[templatesPerPage]}
                  labelRowsPerPage="Mẫu mỗi trang:"
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`}
                  sx={{
                    borderTop: '1px solid #e0e0e0',
                    mt: 2,
                    pt: 2
                  }}
                />
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagerPackageManagement;


