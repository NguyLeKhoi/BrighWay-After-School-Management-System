import React from 'react';
import { Box, Typography, Alert, Chip, IconButton, Tooltip } from '@mui/material';
import { School as SchoolIcon, Edit as EditIcon, Delete as DeleteIcon, Restore as RestoreIcon } from '@mui/icons-material';
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
import styles from './SchoolManagement.module.css';

const SchoolManagement = () => {
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
      const response = await schoolService.getSchoolsPaged({
        ...params,
        name: params.searchTerm || params.Keyword || '',
        includeDeleted: false
      });
      return response;
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

  // Define table columns with custom actions for restore
  const columns = [
    {
      key: 'name',
      header: 'Tên Trường',
      render: (value, item) => (
        <Box display="flex" alignItems="center" gap={1}>
          <SchoolIcon fontSize="small" color="primary" />
          <Typography variant="subtitle2" fontWeight="medium">
            {value}
          </Typography>
        </Box>
      )
    },
    {
      key: 'address',
      header: 'Địa Chỉ',
      render: (value) => (
        <Typography variant="body2" color="text.secondary">
          {value}
        </Typography>
      )
    },
    {
      key: 'phoneNumber',
      header: 'Số Điện Thoại',
      render: (value) => (
        <Typography variant="body2">
          {value}
        </Typography>
      )
    },
    {
      key: 'email',
      header: 'Email',
      render: (value) => (
        <Typography variant="body2" color="text.secondary">
          {value}
        </Typography>
      )
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'center',
      render: (value, item) => (
        <Box display="flex" gap={0.5} justifyContent="center">
          <Tooltip title="Sửa">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleEdit(item)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa (Soft Delete)">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(item)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

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
          onEdit={handleEdit}
          onDelete={handleDelete}
          showActions={false}
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
          fields={[
            {
              name: 'name',
              label: 'Tên Trường',
              type: 'text',
              required: true,
              placeholder: 'Ví dụ: Trường Tiểu học ABC',
              disabled: actionLoading
            },
            {
              name: 'address',
              label: 'Địa Chỉ',
              type: 'text',
              required: true,
              placeholder: 'Địa chỉ đầy đủ của trường',
              disabled: actionLoading
            },
            {
              name: 'phoneNumber',
              label: 'Số Điện Thoại',
              type: 'text',
              required: true,
              placeholder: 'Ví dụ: 0123456789',
              disabled: actionLoading
            },
            {
              name: 'email',
              label: 'Email',
              type: 'email',
              required: true,
              placeholder: 'Ví dụ: contact@school.edu.vn',
              disabled: actionLoading
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
        confirmText={confirmDialog.title.includes('khôi phục') ? 'Khôi phục' : 'Xóa'}
        cancelText="Hủy"
        confirmColor={confirmDialog.title.includes('khôi phục') ? 'success' : 'error'}
      />
    </div>
  );
};

export default SchoolManagement;

