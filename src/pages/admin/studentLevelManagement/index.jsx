import React, { useMemo, useEffect, useRef } from 'react';
import { Alert } from '@mui/material';
import { School as StudentLevelIcon } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import DataTable from '../../../components/Common/DataTable';
import Form from '../../../components/Common/Form';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import ManagementPageHeader from '../../../components/Management/PageHeader';
import ManagementSearchSection from '../../../components/Management/SearchSection';
import ManagementFormDialog from '../../../components/Management/FormDialog';
import ContentLoading from '../../../components/Common/ContentLoading';
import { studentLevelSchema } from '../../../utils/validationSchemas/studentLevelSchemas';
import studentLevelService from '../../../services/studentLevel.service';
import useBaseCRUD from '../../../hooks/useBaseCRUD';
import { createStudentLevelColumns } from '../../../definitions/studentLevel/tableColumns';
import { createStudentLevelFormFields } from '../../../definitions/studentLevel/formFields';
import styles from './StudentLevelManagement.module.css';

const StudentLevelManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isInitialMount = useRef(true);
  
  // Use shared CRUD hook
  const {
    data: studentLevels,
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
    selectedItem: selectedStudentLevel,
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
      return await studentLevelService.getStudentLevelsPaged({
        pageIndex: params.pageIndex,
        pageSize: params.pageSize,
        keyword: params.searchTerm || params.Keyword || ''
      });
    },
    createFunction: studentLevelService.createStudentLevel,
    updateFunction: studentLevelService.updateStudentLevel,
    deleteFunction: studentLevelService.deleteStudentLevel,
    loadOnMount: true
  });

  const columns = useMemo(() => createStudentLevelColumns(), []);
  const studentLevelFormFields = useMemo(
    () => createStudentLevelFormFields(actionLoading),
    [actionLoading]
  );

  // Reload data when navigate back to this page (e.g., from create/update pages)
  useEffect(() => {
    if (location.pathname === '/admin/student-levels') {
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
        title="Quản lý Cấp Độ Trẻ Em"
        createButtonText="Thêm Cấp Độ"
        onCreateClick={handleCreate}
      />

      {/* Search Section */}
      <ManagementSearchSection
        keyword={keyword}
        onKeywordChange={handleKeywordChange}
        onSearch={handleKeywordSearch}
        onClear={handleClearSearch}
        placeholder="Tìm kiếm theo tên cấp độ trẻ em..."
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
          data={studentLevels}
          columns={columns}
          loading={isPageLoading}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onView={(studentLevel) => navigate(`/admin/student-levels/detail/${studentLevel.id}`)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage="Không có cấp độ trẻ em nào. Hãy thêm cấp độ đầu tiên để bắt đầu."
        />
      </div>

      {/* Form Dialog */}
      <ManagementFormDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        mode={dialogMode}
        title="Cấp Độ Trẻ Em"
        icon={StudentLevelIcon}
        loading={actionLoading}
        maxWidth="md"
      >
        <Form
          schema={studentLevelSchema}
          defaultValues={{
            name: selectedStudentLevel?.name || '',
            description: selectedStudentLevel?.description || ''
          }}
          onSubmit={handleFormSubmit}
          submitText={dialogMode === 'create' ? 'Tạo Cấp Độ' : 'Cập nhật Cấp Độ'}
          loading={actionLoading}
          disabled={actionLoading}
          fields={studentLevelFormFields}
        />
      </ManagementFormDialog>

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

export default StudentLevelManagement;
