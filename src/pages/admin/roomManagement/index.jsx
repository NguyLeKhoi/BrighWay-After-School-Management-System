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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RoomIcon color="primary" />
          <Typography variant="body2" fontWeight="medium">
            {row.facilityName || 'N/A'}
          </Typography>
        </Box>
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
        <Typography variant="body2">
          {value} người
        </Typography>
      )
    },
    {
      key: 'actions',
      header: 'Thao Tác',
      sortable: false,
      render: (value, row) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleEdit(row)}
            disabled={actionLoading}
            title="Sửa"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(row)}
            disabled={actionLoading}
            title="Xóa"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
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
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Quản lý Phòng Học
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          disabled={isDataLoading}
        >
          Thêm Phòng Học
        </Button>
      </Box>

      {/* Filter Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 200 }}>
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
          
          <FormControl sx={{ minWidth: 200 }}>
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
            sx={{ minWidth: 200 }}
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
          >
            {searchLoading ? 'Đang tìm...' : 'Lọc'}
          </Button>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Data Table with Loading */}
      <Box sx={{ position: 'relative' }}>
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
      </Box>

      {/* Create/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => !actionLoading && setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <RoomIcon color="primary" />
            <Typography variant="h6" component="span">
              {dialogMode === 'create' ? 'Thêm Phòng Học Mới' : 'Chỉnh Sửa Phòng Học'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {isDataLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
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
    </Box>
  );
};

export default RoomManagement;
