import React, { useState, useEffect } from 'react';
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
import ManagerPageHeader from '../../../components/Manager/ManagerPageHeader';
import ManagerSearchSection from '../../../components/Manager/ManagerSearchSection';
import ManagerFormDialog from '../../../components/Manager/ManagerFormDialog';
import ContentLoading from '../../../components/Common/ContentLoading';
import DataTable from '../../../components/Common/DataTable';
import Form from '../../../components/Common/Form';
import { roomSchema } from '../../../utils/validationSchemas/facilitySchemas';
import roomService from '../../../services/room.service';
import userService from '../../../services/user.service';
import useFacilityBranchData from '../../../hooks/useFacilityBranchData';
import useBaseCRUD from '../../../hooks/useBaseCRUD';
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

  // Define table columns
  const columns = [
    {
      key: 'roomName',
      header: 'Tên Phòng',
      render: (value, item) => (
        <Typography variant="body2" fontWeight="medium">
          {item.roomName || 'N/A'}
        </Typography>
      )
    },
    {
      key: 'facilityName',
      header: 'Cơ Sở Vật Chất',
      render: (value, item) => (
        <div className={styles.facilityCell}>
          <RoomIcon className={styles.facilityIcon} fontSize="small" />
          <span className={styles.facilityName}>
            {item.facilityName || 'N/A'}
          </span>
        </div>
      )
    },
    {
      key: 'branchName',
      header: 'Chi Nhánh',
      render: (value, item) => (
        <Typography variant="body2">
          {item.branchName || 'N/A'}
        </Typography>
      )
    },
    {
      key: 'capacity',
      header: 'Sức Chứa',
      render: (value) => (
        <span className={styles.capacityText}>
          {value} người
        </span>
      )
    }
  ];

  // Get form fields
  const getFormFields = () => {
    return [
      {
        name: 'roomName',
        label: 'Tên Phòng',
        type: 'text',
        placeholder: 'Nhập tên phòng học',
        required: true
      },
      {
        name: 'facilityId',
        label: 'Cơ Sở Vật Chất',
        type: 'select',
        required: true,
        options: getFacilityOptions()
      },
      {
        name: 'branchId',
        label: 'Chi Nhánh',
        type: 'select',
        required: true,
        disabled: true, // Manager can only use their branch
        options: managerBranchId 
          ? getBranchOptions().filter(opt => opt.value === managerBranchId)
          : getBranchOptions()
      },
      {
        name: 'capacity',
        label: 'Sức Chứa',
        type: 'number',
        placeholder: 'Sức chứa: 10',
        required: true
      }
    ];
  };

  return (
    <div className={styles.container}>
      {isPageLoading && <ContentLoading isLoading={isPageLoading} text={loadingText} />}
      
      {/* Header */}
      <ManagerPageHeader
        title="Quản lý Phòng Học"
        createButtonText="Thêm Phòng Học"
        onCreateClick={handleCreateWithData}
      />

      {/* Search Section with Additional Filters */}
      <ManagerSearchSection
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
      </ManagerSearchSection>

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
      <ManagerFormDialog
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
            fields={getFormFields()}
            defaultValues={{
              ...selectedRoom,
              branchId: managerBranchId // Pre-fill with manager's branch
            }}
            submitText={dialogMode === 'create' ? 'Tạo Phòng Học' : 'Cập Nhật'}
            loading={actionLoading}
          />
        )}
      </ManagerFormDialog>

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
