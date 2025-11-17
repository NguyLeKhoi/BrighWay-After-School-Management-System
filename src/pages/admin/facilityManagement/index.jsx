import React, { useMemo } from 'react';
import { Alert } from '@mui/material';
import { Room as RoomIcon } from '@mui/icons-material';
import DataTable from '../../../components/Common/DataTable';
import Form from '../../../components/Common/Form';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import ManagementPageHeader from '../../../components/Management/PageHeader';
import ManagementSearchSection from '../../../components/Management/SearchSection';
import ManagementFormDialog from '../../../components/Management/FormDialog';
import ContentLoading from '../../../components/Common/ContentLoading';
import { facilitySchema } from '../../../utils/validationSchemas/facilitySchemas';
import facilityService from '../../../services/facility.service';
import useBaseCRUD from '../../../hooks/useBaseCRUD';
import { createFacilityColumns } from '../../../constants/facility/tableColumns';
import { createFacilityFormFields } from '../../../constants/facility/formFields';
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

  const columns = useMemo(() => createFacilityColumns(), []);
  const facilityFormFields = useMemo(
    () => createFacilityFormFields(actionLoading),
    [actionLoading]
  );

  return (
    <div className={styles.container}>
      {isPageLoading && <ContentLoading isLoading={isPageLoading} text={loadingText} />}
      
      {/* Header - Reusable Component */}
      <ManagementPageHeader
        title="Quản lý Cơ Sở Vật Chất"
        createButtonText="Thêm Cơ Sở Vật Chất"
        onCreateClick={handleCreate}
      />

      {/* Search Section - Reusable Component */}
      <ManagementSearchSection
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
      <ManagementFormDialog
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
          fields={facilityFormFields}
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

export default FacilityManagement;
