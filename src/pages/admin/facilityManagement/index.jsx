import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { Room as RoomIcon } from '@mui/icons-material';
import DataTable from '../../../components/Common/DataTable';
import Form from '../../../components/Common/Form';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import AdminPageHeader from '../../../components/Admin/AdminPageHeader';
import AdminSearchSection from '../../../components/Admin/AdminSearchSection';
import AdminFormDialog from '../../../components/Admin/AdminFormDialog';
import ContentLoading from '../../../components/Common/ContentLoading';
import { facilitySchema } from '../../../utils/validationSchemas/facilitySchemas';
import facilityService from '../../../services/facility.service';
import useBaseCRUD from '../../../hooks/useBaseCRUD';
import styles from './FacilityManagement.module.css';

const FacilityManagement = () => {
  // Use shared CRUD hook
  const {
    data: facilities,
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
    selectedItem: selectedFacility,
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
    loadFunction: facilityService.getFacilitiesPaged,
    createFunction: facilityService.createFacility,
    updateFunction: facilityService.updateFacility,
    deleteFunction: facilityService.deleteFacility,
    loadOnMount: true
  });

  // Define table columns
  const columns = [
    {
      key: 'facilityName',
      header: 'Tên Cơ Sở Vật Chất',
      render: (value, item) => (
        <Box display="flex" alignItems="center" gap={1}>
          <RoomIcon fontSize="small" color="primary" />
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
        <Typography variant="body2" color="text.secondary">
          {value}
        </Typography>
      )
    }
  ];

  return (
    <div className={styles.container}>
      {isPageLoading && <ContentLoading isLoading={isPageLoading} text={loadingText} />}
      
      {/* Header - Reusable Component */}
      <AdminPageHeader
        title="Quản lý Cơ Sở Vật Chất"
        createButtonText="Thêm Cơ Sở Vật Chất"
        onCreateClick={handleCreate}
      />

      {/* Search Section - Reusable Component */}
      <AdminSearchSection
        keyword={keyword}
        onKeywordChange={handleKeywordChange}
        onSearch={handleKeywordSearch}
        onClear={handleClearSearch}
        placeholder="Tìm kiếm theo tên..."
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
          data={facilities}
          columns={columns}
          loading={isPageLoading}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage="Không có cơ sở vật chất nào. Hãy thêm cơ sở vật chất đầu tiên để bắt đầu."
        />
      </div>

      {/* Form Dialog - Reusable Component */}
      <AdminFormDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        mode={dialogMode}
        title="Cơ Sở Vật Chất"
        icon={RoomIcon}
        loading={actionLoading}
      >
        <Form
          schema={facilitySchema}
          defaultValues={{
            facilityName: selectedFacility?.facilityName || '',
            description: selectedFacility?.description || ''
          }}
          onSubmit={handleFormSubmit}
          submitText={dialogMode === 'create' ? 'Tạo Cơ Sở Vật Chất' : 'Cập nhật Cơ Sở Vật Chất'}
          loading={actionLoading}
          disabled={actionLoading}
          fields={[
            {
              name: 'facilityName',
              label: 'Tên Cơ Sở Vật Chất',
              type: 'text',
              required: true,
              placeholder: 'Ví dụ: Phòng học A1, Thư viện, Sân thể thao',
              disabled: actionLoading
            },
            {
              name: 'description',
              label: 'Mô Tả',
              type: 'text',
              required: true,
              placeholder: 'Mô tả chi tiết về cơ sở vật chất',
              disabled: actionLoading
            }
          ]}
        />
      </AdminFormDialog>

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

export default FacilityManagement;
