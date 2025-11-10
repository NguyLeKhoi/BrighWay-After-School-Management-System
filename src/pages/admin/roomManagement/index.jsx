import React, { useMemo } from 'react';
import {
  Alert,
  FormControl,
  Select,
  MenuItem,
  Paper
} from '@mui/material';
import {
  MeetingRoom as RoomIcon
} from '@mui/icons-material';
import DataTable from '../../../components/Common/DataTable';
import Form from '../../../components/Common/Form';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import ManagementPageHeader from '../../../components/Management/PageHeader';
import ManagementSearchSection from '../../../components/Management/SearchSection';
import ManagementFormDialog from '../../../components/Management/FormDialog';
import ContentLoading from '../../../components/Common/ContentLoading';
import { roomSchema } from '../../../utils/validationSchemas/facilitySchemas';
import roomService from '../../../services/room.service';
import useFacilityBranchData from '../../../hooks/useFacilityBranchData';
import useBaseCRUD from '../../../hooks/useBaseCRUD';
import { createRoomColumns } from '../../../constants/room/tableColumns';
import { createRoomFormFields } from '../../../constants/room/formFields';
import styles from './RoomManagement.module.css';

const RoomManagement = () => {
  // Facility and Branch data
  const {
    facilities,
    branches,
    isLoading: isDataLoading,
    error: dataError,
    getFacilityOptions,
    getBranchOptions,
    fetchAllData
  } = useFacilityBranchData();

  // Use shared CRUD hook with custom load function
  const {
    data: rooms,
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
    selectedItem: selectedRoom,
    confirmDialog,
    setConfirmDialog,
    handleCreate,
    handleEdit,
    handleDelete,
    handleFormSubmit,
    handleKeywordChange,
    handleKeywordSearch,
    handleClearSearch,
    handlePageChange,
    handleRowsPerPageChange,
    updateFilter,
    loadData
  } = useBaseCRUD({
    loadFunction: async (params) => {
      const response = await roomService.getRoomsPaged(
        params.page,
        params.pageSize,
        params.searchTerm || params.Keyword || '',
        params.facilityFilter || '',
        params.branchFilter || ''
      );
      return response;
    },
    createFunction: roomService.createRoom,
    updateFunction: roomService.updateRoom,
    deleteFunction: roomService.deleteRoom,
    defaultFilters: { facilityFilter: '', branchFilter: '' },
    loadOnMount: true
  });

  // Load facility and branch data on mount
  React.useEffect(() => {
    fetchAllData();
  }, []);

  // Override handleCreate to ensure data is loaded
  const handleCreateWithData = async () => {
    if (facilities.length === 0 && branches.length === 0) {
      await fetchAllData();
    }
    handleCreate();
  };

  // Override handleEdit to ensure data is loaded
  const handleEditWithData = async (room) => {
    if (facilities.length === 0 && branches.length === 0) {
      await fetchAllData();
    }
    handleEdit(room);
  };

  const columns = useMemo(() => createRoomColumns(), []);
  const facilityOptions = useMemo(() => getFacilityOptions(), [getFacilityOptions]);
  const branchOptions = useMemo(() => getBranchOptions(), [getBranchOptions]);
  const formFields = useMemo(
    () =>
      createRoomFormFields({
        actionLoading,
        isDataLoading,
        facilityOptions,
        branchOptions
      }),
    [actionLoading, isDataLoading, facilityOptions, branchOptions]
  );

  return (
    <div className={styles.container}>
      {isPageLoading && <ContentLoading isLoading={isPageLoading} text={loadingText} />}
      
      {/* Header */}
      <ManagementPageHeader
        title="Quản lý Phòng Học"
        createButtonText="Thêm Phòng Học"
        onCreateClick={handleCreateWithData}
      />

      {/* Search Section with Filters */}
      <Paper className={styles.searchAndFilterSection || styles.searchSection}>
        <ManagementSearchSection
          keyword={keyword}
          onKeywordChange={handleKeywordChange}
          onSearch={handleKeywordSearch}
          onClear={() => {
            handleClearSearch();
            updateFilter('facilityFilter', '');
            updateFilter('branchFilter', '');
          }}
          placeholder="Tìm kiếm theo tên phòng học..."
        >
          {/* Facility Filter */}
          <FormControl className={styles.filterGroupItem || styles.statusFilter}>
            <Select
              value={filters.facilityFilter || ''}
              onChange={(e) => updateFilter('facilityFilter', e.target.value)}
              displayEmpty
              disabled={isDataLoading}
              sx={{ minHeight: '40px', minWidth: '200px' }}
            >
              <MenuItem value="">Tất cả cơ sở vật chất</MenuItem>
              {isDataLoading ? (
                <MenuItem disabled>Đang tải...</MenuItem>
              ) : getFacilityOptions().length === 0 ? (
                <MenuItem disabled>Không có dữ liệu</MenuItem>
              ) : (
                getFacilityOptions().map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          {/* Branch Filter */}
          <FormControl className={styles.filterGroupItem || styles.statusFilter}>
            <Select
              value={filters.branchFilter || ''}
              onChange={(e) => updateFilter('branchFilter', e.target.value)}
              displayEmpty
              disabled={isDataLoading}
              sx={{ minHeight: '40px', minWidth: '200px' }}
            >
              <MenuItem value="">Tất cả chi nhánh</MenuItem>
              {isDataLoading ? (
                <MenuItem disabled>Đang tải...</MenuItem>
              ) : getBranchOptions().length === 0 ? (
                <MenuItem disabled>Không có dữ liệu</MenuItem>
              ) : (
                getBranchOptions().map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </ManagementSearchSection>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity={error.includes('Không tìm thấy') ? "info" : "error"} 
          className={styles.errorAlert} 
          onClose={() => {}}
        >
          {error}
        </Alert>
      )}

      {/* Table */}
      <div className={styles.tableContainer}>
        <DataTable
          data={rooms}
          columns={columns}
          loading={isPageLoading}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onEdit={handleEditWithData}
          onDelete={handleDelete}
          emptyMessage={
            error && error.includes('Không tìm thấy') 
              ? "Không có phòng học nào phù hợp với bộ lọc đã chọn" 
              : "Không có phòng học nào. Hãy thêm phòng học đầu tiên để bắt đầu."
          }
        />
      </div>

      {/* Form Dialog */}
      <ManagementFormDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        mode={dialogMode}
        title="Phòng Học"
        icon={RoomIcon}
        loading={actionLoading}
        maxWidth="md"
      >
        {isDataLoading ? (
          <Box sx={{ textAlign: 'center', padding: '32px 0' }}>
            <Typography>Đang tải dữ liệu...</Typography>
          </Box>
        ) : dataError ? (
          <Alert severity="error" sx={{ marginBottom: '16px' }}>
            {dataError}
          </Alert>
        ) : (
          <Form
            schema={roomSchema}
            defaultValues={selectedRoom || {}}
            onSubmit={handleFormSubmit}
            submitText={dialogMode === 'create' ? 'Tạo Phòng Học' : 'Cập nhật Phòng Học'}
            loading={actionLoading}
            disabled={actionLoading}
            fields={formFields}
          />
        )}
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

export default RoomManagement;
