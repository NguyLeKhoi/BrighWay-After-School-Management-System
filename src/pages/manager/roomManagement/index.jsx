import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  MeetingRoom as RoomIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import DataTable from '../../../components/Common/DataTable';
import Form from '../../../components/Common/Form';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import { roomSchema } from '../../../utils/validationSchemas';
import roomService from '../../../services/room.service';
import useFacilityBranchData from '../../../hooks/useFacilityBranchData';
import { useApp } from '../../../contexts/AppContext';
import useContentLoading from '../../../hooks/useContentLoading';
import ContentLoading from '../../../components/Common/ContentLoading';
import { toast } from 'react-toastify';
import styles from './RoomManagement.module.css';

const ManagerRoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filter states
  const [facilityFilter, setFacilityFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [roomNameFilter, setRoomNameFilter] = useState('');
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  // Confirm dialog states
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    onConfirm: null
  });
  
  // Global state
  const { showGlobalError, addNotification } = useApp();
  const { isLoading: isPageLoading, loadingText, showLoading, hideLoading } = useContentLoading(1500);
  
  // Facility and Branch data
  const {
    facilities,
    branches,
    isLoading: isDataLoading,
    error: dataError,
    getFacilityOptions,
    getBranchOptions,
    getFacilityById,
    getBranchById
  } = useFacilityBranchData();

  // Define table columns
  const columns = [
    {
      key: 'roomName',
      header: 'Tên Phòng',
      sortable: true,
      render: (value, row) => (
        <Typography variant="body2" fontWeight="medium">
          {row.roomName || 'N/A'}
        </Typography>
      )
    },
    {
      key: 'facilityName',
      header: 'Cơ Sở Vật Chất',
      sortable: true,
      render: (value, row) => (
        <div className={styles.facilityCell}>
          <RoomIcon className={styles.facilityIcon} />
          <span className={styles.facilityName}>
            {row.facilityName || 'N/A'}
          </span>
        </div>
      )
    },
    {
      key: 'branchName',
      header: 'Chi Nhánh',
      sortable: true,
      render: (value, row) => (
        <Typography variant="body2">
          {row.branchName || 'N/A'}
        </Typography>
      )
    },
    {
      key: 'capacity',
      header: 'Sức Chứa',
      sortable: true,
      render: (value) => (
        <span className={styles.capacityText}>
          {value} người
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Thao Tác',
      sortable: false,
      render: (value, row) => (
        <div className={styles.actionsCell}>
          <IconButton
            size="small"
            className={`${styles.actionButton} ${styles.edit}`}
            onClick={() => handleEdit(row)}
            disabled={actionLoading}
            title="Sửa"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            className={`${styles.actionButton} ${styles.delete}`}
            onClick={() => handleDelete(row)}
            disabled={actionLoading}
            title="Xóa"
          >
            <DeleteIcon />
          </IconButton>
        </div>
      )
    }
  ];

  // Load rooms data
  const loadRooms = async () => {
    try {
      showLoading();
      setError(null);
      
      // Convert page to pageIndex (API uses 1-based indexing)
      const pageIndex = page + 1;
      const response = await roomService.getRoomsPaged(pageIndex, rowsPerPage, roomNameFilter, facilityFilter, branchFilter);
      
      let roomsData = [];
      let totalCount = 0;
      
      // Handle API response structure: { items, pageIndex, totalPages, totalCount, pageSize, hasPreviousPage, hasNextPage }
      if (response && response.items) {
        roomsData = response.items || [];
        totalCount = response.totalCount || 0;
      } else if (Array.isArray(response)) {
        // Fallback: if response is directly an array
        roomsData = response;
        totalCount = response.length;
      }
      
      // Filter rooms on frontend if backend doesn't filter properly
      let filteredRooms = roomsData;
      if (facilityFilter || branchFilter) {
        filteredRooms = roomsData.filter(room => {
          let matchesFacility = true;
          let matchesBranch = true;
          
          if (facilityFilter) {
            matchesFacility = room.facilityId === facilityFilter;
          }
          
          if (branchFilter) {
            matchesBranch = room.branchId === branchFilter;
          }
          
          return matchesFacility && matchesBranch;
        });
        
        // If no rooms match the filter, show message and clear data
        if (filteredRooms.length === 0) {
          let filterMessage = '';
          if (facilityFilter && branchFilter) {
            const facilityName = getFacilityById(facilityFilter)?.facilityName || 'cơ sở vật chất đã chọn';
            const branchName = getBranchById(branchFilter)?.branchName || 'chi nhánh đã chọn';
            filterMessage = `Không tìm thấy phòng học nào thuộc "${facilityName}" tại "${branchName}"`;
          } else if (facilityFilter) {
            const facilityName = getFacilityById(facilityFilter)?.facilityName || 'cơ sở vật chất đã chọn';
            filterMessage = `Không tìm thấy phòng học nào thuộc "${facilityName}"`;
          } else if (branchFilter) {
            const branchName = getBranchById(branchFilter)?.branchName || 'chi nhánh đã chọn';
            filterMessage = `Không tìm thấy phòng học nào tại "${branchName}"`;
          }
          setError(filterMessage);
          setRooms([]);
          setTotalCount(0);
          return;
        }
      }
      
      // Set filtered data
      setRooms(filteredRooms);
      setTotalCount(filteredRooms.length);
      setError(null); // Clear any previous errors
      
    } catch (err) {
      console.error('Error loading rooms:', err);
      
      // Handle 404 error when no rooms found with filters
      // Check multiple possible error structures
      const is404Error = err.response?.status === 404 || 
                        err.status === 404 || 
                        err.statusCode === 404 ||
                        err.code === 404;
      
      const isRoomNotFound = err.response?.data?.code === 'room_not_found' ||
                            err.code === 'room_not_found' ||
                            err.message?.includes('No rooms found') ||
                            err.response?.data?.message?.includes('No rooms found');
      
      if (is404Error && isRoomNotFound) {
        // This is expected when filtering returns no results
        if (facilityFilter || branchFilter) {
          let filterMessage = '';
          if (facilityFilter && branchFilter) {
            const facilityName = getFacilityById(facilityFilter)?.facilityName || 'cơ sở vật chất đã chọn';
            const branchName = getBranchById(branchFilter)?.branchName || 'chi nhánh đã chọn';
            filterMessage = `Không tìm thấy phòng học nào thuộc "${facilityName}" tại "${branchName}"`;
          } else if (facilityFilter) {
            const facilityName = getFacilityById(facilityFilter)?.facilityName || 'cơ sở vật chất đã chọn';
            filterMessage = `Không tìm thấy phòng học nào thuộc "${facilityName}"`;
          } else if (branchFilter) {
            const branchName = getBranchById(branchFilter)?.branchName || 'chi nhánh đã chọn';
            filterMessage = `Không tìm thấy phòng học nào tại "${branchName}"`;
          }
          setError(filterMessage);
          setRooms([]);
          setTotalCount(0);
        } else {
          // No filter but still 404 - this might be a real error
          setError('Không tìm thấy phòng học nào');
          setRooms([]);
          setTotalCount(0);
        }
      } else {
        // Handle other errors
        const errorMessage = err.response?.data?.message || err.message || 'Không thể tải danh sách phòng học';
        setError(errorMessage);
        showGlobalError(errorMessage);
      }
    } finally {
      hideLoading();
    }
  };

  // Load data on component mount and when page/rowsPerPage changes
  useEffect(() => {
    loadRooms();
  }, [page, rowsPerPage]);

  // Auto filter when facility, branch, or keyword filter changes (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadRooms();
    }, 300); // 300ms debounce to avoid too many API calls

    return () => clearTimeout(timeoutId);
  }, [facilityFilter, branchFilter, roomNameFilter]);

  // Load data on initial mount only
  useEffect(() => {
    loadRooms();
  }, []);

  // Handle search
  const handleSearch = async () => {
    setSearchLoading(true);
    try {
      await loadRooms();
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle create
  const handleCreate = () => {
    setSelectedRoom(null);
    setDialogMode('create');
    setOpenDialog(true);
  };

  // Handle edit
  const handleEdit = (room) => {
    setSelectedRoom(room);
    setDialogMode('edit');
    setOpenDialog(true);
  };

  // Handle delete
  const handleDelete = (room) => {
    setConfirmDialog({
      open: true,
      title: 'Xác nhận xóa phòng học',
      description: `Bạn có chắc chắn muốn xóa phòng học tại ${room.facilityName} - ${room.branchName}?`,
      onConfirm: () => performDelete(room.id)
    });
  };

  // Perform delete
  const performDelete = async (roomId) => {
    setActionLoading(true);
    try {
      await roomService.deleteRoom(roomId);
      toast.success('Xóa phòng học thành công!');
      await loadRooms();
    } catch (err) {
      console.error('Delete error:', err);
      showGlobalError('Không thể xóa phòng học');
    } finally {
      setActionLoading(false);
      setConfirmDialog({ ...confirmDialog, open: false });
    }
  };

  // Handle form submit
  const handleFormSubmit = async (data) => {
    setActionLoading(true);
    try {
      if (dialogMode === 'create') {
        await roomService.createRoom(data);
        toast.success('Tạo phòng học thành công!');
      } else {
        await roomService.updateRoom(selectedRoom.id, data);
        addNotification({
          message: 'Cập nhật phòng học thành công!',
          severity: 'success'
        });
      }
      
      setOpenDialog(false);
      await loadRooms();
    } catch (err) {
      console.error('Form submit error:', err);
      showGlobalError(err.message || 'Có lỗi xảy ra khi lưu phòng học');
    } finally {
      setActionLoading(false);
    }
  };

  // Get form fields based on dialog mode
  const getFormFields = () => {
    const baseFields = [
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
        options: getBranchOptions()
      },
      {
        name: 'capacity',
        label: 'Sức Chứa',
        type: 'number',
        placeholder: 'Sức chứa: 10',
        required: true
      }
    ];

    return baseFields;
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          Quản lý Phòng Học
        </h1>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          disabled={isDataLoading}
          className={styles.addButton}
        >
          Thêm Phòng Học
        </Button>
      </div>

      {/* Combined Search and Filter Section */}
      <Paper className={styles.searchAndFilterSection}>
        <div className={styles.searchAndFilterGrid}>
          {/* Search Field */}
          <TextField
            fullWidth
            placeholder="Tìm kiếm theo tên phòng học..."
            value={roomNameFilter}
            onChange={(e) => setRoomNameFilter(e.target.value)}
            disabled={isDataLoading}
            className={styles.searchField}
            InputProps={{
              startAdornment: (
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                  <SearchIcon color="action" />
                </Box>
              ),
              endAdornment: roomNameFilter && (
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                  <IconButton onClick={() => setRoomNameFilter('')} edge="end" size="small">
                    <ClearIcon />
                  </IconButton>
                </Box>
              ),
            }}
          />

          {/* Facility Filter */}
          <div className={styles.filterGroupItem}>
            <Typography variant="subtitle2" className={styles.filterLabel}>
              Cơ Sở Vật Chất
            </Typography>
            <FormControl fullWidth className={styles.formControl}>
              <Select
                value={facilityFilter}
                onChange={(e) => {
                  setFacilityFilter(e.target.value);
                  // Error will be cleared when new data loads
                }}
                displayEmpty
                disabled={isDataLoading}
                sx={{ minHeight: '40px' }}
              >
                <MenuItem value="">
                  <em>Tất cả cơ sở vật chất</em>
                </MenuItem>
                {isDataLoading ? (
                  <MenuItem disabled>
                    <em>Đang tải dữ liệu...</em>
                  </MenuItem>
                ) : dataError ? (
                  <MenuItem disabled>
                    <em>❌ Lỗi tải dữ liệu</em>
                  </MenuItem>
                ) : getFacilityOptions().length === 0 ? (
                  <MenuItem disabled>
                    <em>📭 Không có dữ liệu</em>
                  </MenuItem>
                ) : (
                  getFacilityOptions().map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </div>
          
          {/* Branch Filter */}
          <div className={styles.filterGroupItem}>
            <Typography variant="subtitle2" className={styles.filterLabel}>
              Chi Nhánh
            </Typography>
            <FormControl fullWidth className={styles.formControl}>
              <Select
                value={branchFilter}
                onChange={(e) => {
                  setBranchFilter(e.target.value);
                  // Error will be cleared when new data loads
                }}
                displayEmpty
                disabled={isDataLoading}
                sx={{ minHeight: '40px' }}
              >
                <MenuItem value="">
                  <em>Tất cả chi nhánh</em>
                </MenuItem>
                {isDataLoading ? (
                  <MenuItem disabled>
                    <em>Đang tải dữ liệu...</em>
                  </MenuItem>
                ) : dataError ? (
                  <MenuItem disabled>
                    <em>Lỗi tải dữ liệu</em>
                  </MenuItem>
                ) : getBranchOptions().length === 0 ? (
                  <MenuItem disabled>
                    <em>Không có dữ liệu</em>
                  </MenuItem>
                ) : (
                  getBranchOptions().map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </div>
          
          {/* Clear Filter Button */}
          <Button
            variant="contained"
            onClick={() => {
              setRoomNameFilter('');
              setFacilityFilter('');
              setBranchFilter('');
            }}
            disabled={isDataLoading}
            className={styles.filterButton}
            sx={{ minHeight: '40px' }}
          >
            Xóa bộ lọc
          </Button>
        </div>
      </Paper>

      {/* Error/Info Alert */}
      {error && (
        <Alert 
          severity={error.includes('Không tìm thấy') ? "info" : "error"} 
          className={styles.errorAlert} 
          onClose={() => setError(null)}
          icon={error.includes('Không tìm thấy') ? null : undefined}
        >
          {error.includes('Không tìm thấy') ? (
            <Typography variant="body2">
              ℹ️ {error}
            </Typography>
          ) : (
            error
          )}
        </Alert>
      )}

      {/* Data Loading Error Alert */}
      {dataError && (
        <Alert severity="warning" className={styles.errorAlert}>
          <Typography variant="body2">
            <strong>Lưu ý:</strong> {dataError}. Một số tính năng có thể bị hạn chế.
          </Typography>
        </Alert>
      )}

      {/* Data Table with Loading */}
      <div className={styles.tableContainer}>
        {isPageLoading && <ContentLoading isLoading={isPageLoading} text={loadingText} />}
        <DataTable
          columns={columns}
          data={rooms}
          totalCount={totalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          loading={isPageLoading}
          showActions={false}
          emptyMessage={
            error && error.includes('Không tìm thấy') 
              ? "Không có phòng học nào phù hợp với bộ lọc đã chọn" 
              : "Không có phòng học nào. Hãy thêm phòng học đầu tiên để bắt đầu."
          }
        />
      </div>

      {/* Create/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => !actionLoading && setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '8px',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle className={styles.dialogTitle}>
          <RoomIcon color="primary" />
          <span className={styles.dialogTitleText}>
            {dialogMode === 'create' ? 'Thêm Phòng Học Mới' : 'Chỉnh Sửa Phòng Học'}
          </span>
        </DialogTitle>
        <DialogContent className={styles.dialogContent}>
          {isDataLoading ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <span>Đang tải dữ liệu...</span>
            </div>
          ) : dataError ? (
            <Alert severity="error" style={{ marginBottom: '16px' }}>
              {dataError}
            </Alert>
          ) : (
            <Form
              schema={roomSchema}
              onSubmit={handleFormSubmit}
              fields={getFormFields()}
              defaultValues={selectedRoom || {}}
              submitText={dialogMode === 'create' ? 'Tạo Phòng Học' : 'Cập Nhật'}
              loading={actionLoading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, open: false })}
        loading={actionLoading}
      />
    </div>
  );
};

export default ManagerRoomManagement;
