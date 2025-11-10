import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import {
  MeetingRoom as RoomIcon
} from '@mui/icons-material';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import ManagementPageHeader from '../../../components/Management/PageHeader';
import ManagementSearchSection from '../../../components/Management/SearchSection';
import ManagementFormDialog from '../../../components/Management/FormDialog';
import ContentLoading from '../../../components/Common/ContentLoading';
import DataTable from '../../../components/Common/DataTable';
import Form from '../../../components/Common/Form';
import { roomSchema } from '../../../utils/validationSchemas/facilitySchemas';
import roomService from '../../../services/room.service';
import userService from '../../../services/user.service';
import useFacilityBranchData from '../../../hooks/useFacilityBranchData';
import useBaseCRUD from '../../../hooks/useBaseCRUD';
import { createManagerRoomColumns } from '../../../constants/manager/room/tableColumns';
import { createManagerRoomFormFields } from '../../../constants/manager/room/formFields';
import { toast } from 'react-toastify';
import styles from './RoomManagement.module.css';

const ManagerRoomManagement = () => {
  const [managerBranchId, setManagerBranchId] = useState(null);
  const [facilityFilter, setFacilityFilter] = useState('');
  
  // Facility and Branch data
  const {
    facilities,
    branches,
    isLoading: isDataLoading,
    error: dataError,
    getFacilityOptions,
    getBranchOptions,
    getFacilityById,
    getBranchById,
    fetchAllData
  } = useFacilityBranchData();

  // Load manager's branch ID on mount
  useEffect(() => {
    const fetchManagerBranch = async () => {
      try {
        const currentUser = await userService.getCurrentUser();
        if (currentUser?.branchId) {
          setManagerBranchId(currentUser.branchId);
        }
        // Fetch facility and branch data for form dropdowns
        await fetchAllData();
      } catch (err) {
        console.error('Error fetching manager branch:', err);
      }
    };
    fetchManagerBranch();
  }, []);

  // Use Manager CRUD hook with custom load function
  const {
    data: rooms,
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
    selectedItem: selectedRoom,
    confirmDialog,
    setConfirmDialog,
    handleCreate,
    handleEdit,
    handleDelete,
    handleFormSubmit: baseHandleFormSubmit,
    handleKeywordSearch,
    handleKeywordChange,
    handleClearSearch,
    handlePageChange,
    handleRowsPerPageChange,
    updateFilter,
    filters
  } = useBaseCRUD({
    loadFunction: async (params) => {
      // Manager can only see rooms in their branch
      const effectiveBranchFilter = managerBranchId || params.branchId || '';
      const effectiveFacilityFilter = facilityFilter || params.facilityId || '';
      
      const response = await roomService.getRoomsPaged(
        params.page || params.pageIndex || 1,
        params.pageSize || params.rowsPerPage || 10,
        params.Keyword || params.searchTerm || keyword || '',
        effectiveFacilityFilter,
        effectiveBranchFilter
      );
      return response;
    },
    createFunction: async (data) => {
      // Ensure manager can only create rooms in their branch
      if (managerBranchId) {
        data.branchId = managerBranchId;
      }
      return await roomService.createRoom(data);
    },
    updateFunction: async (roomId, data) => {
      // Ensure manager can only update rooms in their branch
      if (managerBranchId) {
        data.branchId = managerBranchId;
      }
      return await roomService.updateRoom(roomId, data);
    },
    deleteFunction: roomService.deleteRoom,
    defaultFilters: {
      facilityId: '',
      branchId: ''
    },
    loadOnMount: true
  });

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

  // Custom form submit handler
  const handleFormSubmit = async (data) => {
    const submitData = {
      ...data,
      branchId: managerBranchId // Always use manager's branch
    };
    await baseHandleFormSubmit(submitData);
  };

  // Handle facility filter change
  const handleFacilityFilterChange = (e) => {
    const value = e.target.value;
    setFacilityFilter(value);
    updateFilter('facilityId', value);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFacilityFilter('');
    handleClearSearch();
    updateFilter('facilityId', '');
    updateFilter('branchId', '');
  };

  const columns = useMemo(() => createManagerRoomColumns(styles), [styles]);
  const facilityOptions = useMemo(() => getFacilityOptions(), [getFacilityOptions]);
  const branchOptions = useMemo(
    () => getBranchOptions(),
    [getBranchOptions, managerBranchId]
  );

  const formFields = useMemo(
    () =>
      createManagerRoomFormFields({
        actionLoading,
        facilityOptions,
        managerBranchId,
        branchOptions
      }),
    [actionLoading, facilityOptions, managerBranchId, branchOptions]
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

      {/* Search Section with Additional Filters */}
      <ManagementSearchSection
        keyword={keyword}
        onKeywordChange={handleKeywordChange}
        onSearch={handleKeywordSearch}
        onClear={handleClearFilters}
        placeholder="Tìm kiếm theo tên phòng học..."
      >
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Facility Filter */}
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Cơ Sở Vật Chất</InputLabel>
            <Select
              value={facilityFilter}
              onChange={handleFacilityFilterChange}
              label="Cơ Sở Vật Chất"
              disabled={isDataLoading}
            >
              <MenuItem value="">Tất cả cơ sở vật chất</MenuItem>
              {getFacilityOptions().map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Branch Filter - Read-only for Manager */}
          {managerBranchId && (
            <TextField
              label="Chi Nhánh"
              value={getBranchById(managerBranchId)?.branchName || 'Chi nhánh của bạn'}
              disabled
              sx={{ minWidth: 200 }}
            />
          )}
        </Box>
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
          emptyMessage="Không có phòng học nào. Hãy thêm phòng học đầu tiên để bắt đầu."
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
          <Alert severity="error" sx={{ mb: 2 }}>
            {dataError}
          </Alert>
        ) : (
          <Form
            schema={roomSchema}
            onSubmit={handleFormSubmit}
            fields={formFields}
            defaultValues={{
              ...selectedRoom,
              branchId: managerBranchId // Pre-fill with manager's branch
            }}
            submitText={dialogMode === 'create' ? 'Tạo Phòng Học' : 'Cập Nhật'}
            loading={actionLoading}
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

export default ManagerRoomManagement;
