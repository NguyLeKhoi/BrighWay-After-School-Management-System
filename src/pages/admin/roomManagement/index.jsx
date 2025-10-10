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
  Delete as DeleteIcon
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

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter states
  const [facilityFilter, setFacilityFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  
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
      
      // Convert page to pageIndex (API uses 1-based indexing)
      const pageIndex = page + 1;
      const response = await roomService.getRoomsPaged(pageIndex, rowsPerPage, searchTerm, facilityFilter, branchFilter);
      
      // Handle API response structure: { items, pageIndex, totalPages, totalCount, pageSize, hasPreviousPage, hasNextPage }
      if (response && response.items) {
        setRooms(response.items || []);
        setTotalCount(response.totalCount || 0);
      } else if (Array.isArray(response)) {
        // Fallback: if response is directly an array
        setRooms(response);
        setTotalCount(response.length);
      } else {
        // Fallback: empty data
        setRooms([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error('Error loading rooms:', err);
      showGlobalError('Không thể tải danh sách phòng học');
    } finally {
      hideLoading();
    }
  };

  // Load data on component mount and when dependencies change
  useEffect(() => {
    loadRooms();
  }, [page, rowsPerPage, searchTerm, facilityFilter, branchFilter]);

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

      {/* Filter Section */}
      <Paper className={styles.filterSection}>
        <div className={styles.filterContainer}>
          <FormControl className={styles.formControl}>
            <InputLabel>Cơ Sở Vật Chất</InputLabel>
            <Select
              value={facilityFilter}
              onChange={(e) => setFacilityFilter(e.target.value)}
              label="Cơ Sở Vật Chất"
            >
              <MenuItem value="">Tất cả</MenuItem>
              {getFacilityOptions().map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl className={styles.formControl}>
            <InputLabel>Chi Nhánh</InputLabel>
            <Select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              label="Chi Nhánh"
            >
              <MenuItem value="">Tất cả</MenuItem>
              {getBranchOptions().map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            placeholder="Tìm kiếm theo tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchField}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={searchLoading}
            className={styles.filterButton}
          >
            {searchLoading ? 'Đang tìm...' : 'Lọc'}
          </Button>
        </div>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" className={styles.errorAlert} onClose={() => setError(null)}>
          {error}
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
        />
      </div>

      {/* Create/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => !actionLoading && setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
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

export default RoomManagement;
