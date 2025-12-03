import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccessTime as SlotTypeIcon } from '@mui/icons-material';
import DataTable from '../../../components/Common/DataTable';
import Form from '../../../components/Common/Form';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import ManagementPageHeader from '../../../components/Management/PageHeader';
import ManagementSearchSection from '../../../components/Management/SearchSection';
import ManagementFormDialog from '../../../components/Management/FormDialog';
import ContentLoading from '../../../components/Common/ContentLoading';
import useBaseCRUD from '../../../hooks/useBaseCRUD';
import slotTypeService from '../../../services/slotType.service';
import { createSlotTypeColumns } from '../../../definitions/slotType/tableColumns';
import { createSlotTypeFormFields } from '../../../definitions/slotType/formFields';
import { slotTypeSchema } from '../../../utils/validationSchemas/slotTypeSchemas';
import styles from './SlotTypeManagement.module.css';

const SlotTypeManagement = () => {
  const navigate = useNavigate();

  const columns = useMemo(() => createSlotTypeColumns(), []);
  const slotTypeFormFields = useMemo(() => createSlotTypeFormFields(false), []);

  const {
    data: slotTypes,
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
    selectedItem: selectedSlotType,
    confirmDialog,
    setConfirmDialog,
    loadData,
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
    loadFunction: slotTypeService.getSlotTypesPaged,
    createFunction: slotTypeService.createSlotType,
    updateFunction: slotTypeService.updateSlotType,
    deleteFunction: slotTypeService.deleteSlotType,
    minLoadingDuration: 300,
    loadOnMount: true
  });

  const handleViewDetail = (slotType) => {
    navigate(`/manager/slot-types/detail/${slotType.id}`);
  };

  return (
    <div className={styles.container}>
      {isPageLoading && <ContentLoading isLoading={isPageLoading} text={loadingText} />}

      {/* Header */}
      <ManagementPageHeader
        title="Quản lý Loại Ca Giữ Trẻ"
        createButtonText="Thêm Loại Ca"
        onCreateClick={handleCreate}
      />

      {/* Search Section */}
      <ManagementSearchSection
        keyword={keyword}
        onKeywordChange={handleKeywordChange}
        onSearch={handleKeywordSearch}
        onClear={handleClearSearch}
        placeholder="Tìm kiếm theo tên loại ca..."
      />

      {/* Error Alert */}
      {error && (
        <div className={styles.errorAlert}>
          {error}
        </div>
      )}

      {/* Table */}
      <div className={styles.tableContainer}>
        <DataTable
          data={slotTypes}
          columns={columns}
          loading={isPageLoading}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onView={handleViewDetail}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage="Không có loại ca nào. Hãy thêm loại ca đầu tiên để bắt đầu."
        />
      </div>

      {/* Form Dialog */}
      <ManagementFormDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
        }}
        mode={dialogMode}
        title="Loại Ca Giữ Trẻ"
        icon={SlotTypeIcon}
        loading={actionLoading}
        maxWidth="sm"
      >
        <Form
          schema={slotTypeSchema}
          defaultValues={{
            name: selectedSlotType?.name || '',
            description: selectedSlotType?.description || ''
          }}
          onSubmit={handleFormSubmit}
          submitText={dialogMode === 'edit' ? 'Cập nhật Loại Ca' : 'Tạo Loại Ca'}
          loading={actionLoading}
          disabled={actionLoading}
          fields={slotTypeFormFields}
        />
      </ManagementFormDialog>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, title: '', description: '', onConfirm: null })}
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

export default SlotTypeManagement;
