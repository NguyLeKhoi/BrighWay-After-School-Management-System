import React from 'react';
import { Box, Typography, Alert, Chip, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { CardGiftcard as BenefitIcon } from '@mui/icons-material';
import DataTable from '../../../components/Common/DataTable';
import Form from '../../../components/Common/Form';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import ManagementPageHeader from '../../../components/Management/PageHeader';
import ManagementSearchSection from '../../../components/Management/SearchSection';
import ManagementFormDialog from '../../../components/Management/FormDialog';
import ContentLoading from '../../../components/Common/ContentLoading';
import { benefitSchema } from '../../../utils/validationSchemas/benefitSchemas';
import benefitService from '../../../services/benefit.service';
import useBaseCRUD from '../../../hooks/useBaseCRUD';
import styles from './BenefitManagement.module.css';

const BenefitManagement = () => {
  // Use shared CRUD hook
  const {
    data: benefits,
    totalCount,
    page,
    rowsPerPage,
    keyword,
    filters,
    error,
    actionLoading,
    isPageLoading,
    loadingText,
    openDialog,
    setOpenDialog,
    dialogMode,
    selectedItem: selectedBenefit,
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
    updateFilter
  } = useBaseCRUD({
    loadFunction: async (params) => {
      const response = await benefitService.getBenefitsPaged({
        ...params,
        searchTerm: params.searchTerm || params.Keyword || '',
        status: params.status || null
      });
      return response;
    },
    createFunction: benefitService.createBenefit,
    updateFunction: benefitService.updateBenefit,
    deleteFunction: benefitService.deleteBenefit,
    defaultFilters: { status: '' },
    loadOnMount: true
  });

  // Define table columns
  const columns = [
    {
      key: 'name',
      header: 'Tên Lợi Ích',
      render: (value, item) => (
        <Box display="flex" alignItems="center" gap={1}>
          <BenefitIcon fontSize="small" color="primary" />
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
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
          {value || 'Không có mô tả'}
        </Typography>
      )
    },
    {
      key: 'status',
      header: 'Trạng Thái',
      render: (value) => (
        <Chip
          label={value ? 'Hoạt động' : 'Không hoạt động'}
          color={value ? 'success' : 'default'}
          size="small"
        />
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
        title="Quản lý Lợi Ích"
        createButtonText="Thêm Lợi Ích"
        onCreateClick={handleCreate}
      />

      {/* Search Section with Status Filter */}
      <ManagementSearchSection
        keyword={keyword}
        onKeywordChange={handleKeywordChange}
        onSearch={handleKeywordSearch}
        onClear={handleClearSearch}
        placeholder="Tìm kiếm theo tên lợi ích..."
      >
        <FormControl className={styles.statusFilter}>
          <InputLabel>Trạng thái</InputLabel>
          <Select
            value={filters.status || ''}
            onChange={(e) => updateFilter('status', e.target.value)}
            label="Trạng thái"
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="true">Hoạt động</MenuItem>
            <MenuItem value="false">Không hoạt động</MenuItem>
          </Select>
        </FormControl>
      </ManagementSearchSection>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" className={styles.errorAlert} onClose={() => {}}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <div className={styles.tableContainer}>
        <DataTable
          data={benefits}
          columns={columns}
          loading={isPageLoading}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage="Không có lợi ích nào. Hãy thêm lợi ích đầu tiên để bắt đầu."
        />
      </div>

      {/* Form Dialog */}
      <ManagementFormDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        mode={dialogMode}
        title="Lợi Ích"
        icon={BenefitIcon}
        loading={actionLoading}
        maxWidth="md"
      >
        <Form
          schema={benefitSchema}
          defaultValues={{
            name: selectedBenefit?.name || '',
            description: selectedBenefit?.description || '',
            status: selectedBenefit?.status !== false
          }}
          onSubmit={handleFormSubmit}
          submitText={dialogMode === 'create' ? 'Tạo Lợi Ích' : 'Cập nhật Lợi Ích'}
          loading={actionLoading}
          disabled={actionLoading}
          fields={[
            {
              section: 'Thông tin lợi ích',
              sectionDescription: 'Tên và mô tả sẽ hiển thị với quản trị viên khi chọn lợi ích cho chi nhánh.',
              name: 'name',
              label: 'Tên Lợi Ích',
              type: 'text',
              required: true,
              placeholder: 'Ví dụ: Giảm giá học phí, Tặng đồ dùng học tập',
              disabled: actionLoading,
              gridSize: 6
            },
            {
              name: 'description',
              label: 'Mô Tả',
              type: 'textarea',
              required: false,
              placeholder: 'Mô tả chi tiết về lợi ích...',
              disabled: actionLoading,
              rows: 3,
              gridSize: 12
            },
            {
              section: 'Trạng thái',
              sectionDescription: 'Bật để lợi ích xuất hiện trong danh sách lựa chọn.',
              name: 'status',
              label: 'Trạng thái hoạt động',
              type: 'switch',
              required: false,
              disabled: actionLoading,
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

export default BenefitManagement;
