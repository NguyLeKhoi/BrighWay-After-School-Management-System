import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { School as StudentLevelIcon } from '@mui/icons-material';
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
import styles from './StudentLevelManagement.module.css';

const StudentLevelManagement = () => {
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
    handleRowsPerPageChange
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

  // Define table columns
  const columns = [
    {
      key: 'name',
      header: 'Tên Cấp Độ',
      render: (value, item) => (
        <Box display="flex" alignItems="center" gap={1}>
          <StudentLevelIcon fontSize="small" color="primary" />
          <Typography variant="subtitle2" fontWeight="medium">
            {value}
          </Typography>
        </Box>
      )
    },
    {
      key: 'description',
      header: 'Mô Tả',
      render: (value) => (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
          {value || 'Không có mô tả'}
        </Typography>
      )
    },
    {
      key: 'createdTime',
      header: 'Ngày Tạo',
      render: (value) => (
        <Typography variant="body2">
          {value ? new Date(value).toLocaleDateString('vi-VN') : 'N/A'}
        </Typography>
      )
    }
  ];

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
          fields={[
            {
              section: 'Thông tin cấp độ',
              sectionDescription: 'Tên và mô tả giúp phân biệt các cấp độ học sinh.',
              name: 'name',
              label: 'Tên Cấp Độ',
              type: 'text',
              required: true,
              placeholder: 'Ví dụ: Mầm Non, Tiểu Học, Trung Học Cơ Sở',
              disabled: actionLoading,
              gridSize: 6
            },
            {
              name: 'description',
              label: 'Mô Tả',
              type: 'textarea',
              required: false,
              placeholder: 'Mô tả chi tiết về cấp độ học sinh...',
              disabled: actionLoading,
              rows: 3,
              gridSize: 12
            }
          ]}
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
