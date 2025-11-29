import React, { useMemo, useEffect, useRef } from 'react';
import { Alert } from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import DataTable from '../../../components/Common/DataTable';
import Form from '../../../components/Common/Form';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import ManagementPageHeader from '../../../components/Management/PageHeader';
import ManagementSearchSection from '../../../components/Management/SearchSection';
import ManagementFormDialog from '../../../components/Management/FormDialog';
import ContentLoading from '../../../components/Common/ContentLoading';
import { schoolSchema } from '../../../utils/validationSchemas/schoolSchemas';
import schoolService from '../../../services/school.service';
import useBaseCRUD from '../../../hooks/useBaseCRUD';
import { toast } from 'react-toastify';
import { createSchoolColumns } from '../../../definitions/school/tableColumns';
import { createSchoolFormFields } from '../../../definitions/school/formFields';
import styles from './SchoolManagement.module.css';

const SchoolManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isInitialMount = useRef(true);
  // Use shared CRUD hook
  const {
    data: schools,
    totalCount,
    page,
    rowsPerPage,
    keyword,
    error,
    actionLoading,
    isPageLoading,
    loadingText,
    openDialog,
    setOpenDialog,
    dialogMode,
    selectedItem: selectedSchool,
    confirmDialog,
    setConfirmDialog,
    handleCreate,
    handleEdit,
    handleDelete,
    handleFormSubmit,
    handleKeywordSearch,
    handleKeywordChange,
    handleClearSearch,
    handlePageChange,
    handleRowsPerPageChange,
    loadData
  } = useBaseCRUD({
    loadFunction: async (params) => {
      return await schoolService.getSchoolsPaged({
        pageIndex: params.pageIndex,
        pageSize: params.pageSize,
        name: params.searchTerm || params.Keyword || '',
        includeDeleted: false
      });
    },
    createFunction: schoolService.createSchool,
    updateFunction: schoolService.updateSchool,
    deleteFunction: schoolService.softDeleteSchool,
    loadOnMount: true
  });
  
  // Custom restore handler
  const handleRestoreSchool = (school) => {
    setConfirmDialog({
      open: true,
      title: 'Xác nhận khôi phục trường',
      description: `Bạn có chắc chắn muốn khôi phục trường "${school.name}"?`,
      onConfirm: () => performRestoreSchool(school.id)
    });
  };

  const performRestoreSchool = async (schoolId) => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
    try {
      await schoolService.restoreSchool(schoolId);
      toast.success('Khôi phục trường thành công!', {
        position: "top-right",
        autoClose: 3000,
      });
      await loadData(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi khôi phục trường';
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
    }
  };

  const columns = useMemo(
    () => createSchoolColumns(),
    []
  );

  const schoolFormFields = useMemo(
    () => createSchoolFormFields(actionLoading),
    [actionLoading]
  );

  // Reload data when navigate back to this page (e.g., from create/update pages)
  useEffect(() => {
    if (location.pathname === '/admin/schools') {
      // Skip first mount to avoid double loading
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }
      loadData(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div className={styles.container}>
      {isPageLoading && <ContentLoading isLoading={isPageLoading} text={loadingText} />}
      
      {/* Header */}
      <ManagementPageHeader
        title="Quản lý Trường"
        createButtonText="Thêm Trường"
        onCreateClick={handleCreate}
      />

      {/* Search Section */}
      <ManagementSearchSection
        keyword={keyword}
        onKeywordChange={handleKeywordChange}
        onSearch={handleKeywordSearch}
        onClear={handleClearSearch}
        placeholder="Tìm kiếm theo tên trường..."
      />

      {/* Error Alert */}
      {error && (
        <Alert severity="error" className={styles.errorAlert} onClose={() => {}}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <div className={styles.tableContainer}>
        <DataTable
          data={schools}
          columns={columns}
          loading={isPageLoading}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onView={(school) => navigate(`/admin/schools/detail/${school.id}`)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage="Không có trường nào. Hãy thêm trường đầu tiên để bắt đầu."
        />
      </div>

      {/* Form Dialog */}
      <ManagementFormDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        mode={dialogMode}
        title="Trường"
        icon={SchoolIcon}
        loading={actionLoading}
      >
        <Form
          schema={schoolSchema}
          defaultValues={{
            name: selectedSchool?.name || '',
            address: selectedSchool?.address || '',
            phoneNumber: selectedSchool?.phoneNumber || '',
            email: selectedSchool?.email || ''
          }}
          onSubmit={handleFormSubmit}
          submitText={dialogMode === 'create' ? 'Tạo Trường' : 'Cập nhật Trường'}
          loading={actionLoading}
          disabled={actionLoading}
          fields={schoolFormFields}
        />
      </ManagementFormDialog>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.title.includes('khôi phục') ? 'Khôi phục' : 'Xóa'}
        cancelText="Hủy"
        confirmColor={confirmDialog.title.includes('khôi phục') ? 'success' : 'error'}
      />
    </div>
  );
};

export default SchoolManagement;

