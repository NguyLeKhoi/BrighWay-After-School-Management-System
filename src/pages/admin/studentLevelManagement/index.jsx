import React, { useMemo, useEffect, useRef } from 'react';
import { Alert } from '@mui/material';
import { School as StudentLevelIcon } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
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
import { createStudentLevelColumns } from '../../../constants/studentLevel/tableColumns';
import { createStudentLevelFormFields } from '../../../constants/studentLevel/formFields';
import styles from './StudentLevelManagement.module.css';

const StudentLevelManagement = () => {
  const location = useLocation();
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
      const response = await studentLevelService.getStudentLevelsPaged({
        ...params,
        keyword: params.searchTerm || params.Keyword || ''
      });
      return response;
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
        title="Quản lý Cấp Độ Học Sinh"
        createButtonText="Thêm Cấp Độ"
        onCreateClick={handleCreate}
      />

      {/* Search Section */}
      <ManagementSearchSection
        keyword={keyword}
        onKeywordChange={handleKeywordChange}
        onSearch={handleKeywordSearch}
        onClear={handleClearSearch}
        placeholder="Tìm kiếm theo tên cấp độ học sinh..."
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
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage="Không có cấp độ học sinh nào. Hãy thêm cấp độ đầu tiên để bắt đầu."
        />
      </div>

      {/* Form Dialog */}
      <ManagementFormDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        mode={dialogMode}
        title="Cấp Độ Học Sinh"
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
