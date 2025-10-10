import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Room as RoomIcon
} from '@mui/icons-material';
import DataTable from '../../../components/Common/DataTable';
import Form from '../../../components/Common/Form';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import { facilitySchema } from '../../../utils/validationSchemas';
import facilityService from '../../../services/facility.service';
import { useApp } from '../../../contexts/AppContext';
import useContentLoading from '../../../hooks/useContentLoading';
import ContentLoading from '../../../components/Common/ContentLoading';
import { toast } from 'react-toastify';
import styles from './FacilityManagement.module.css';

const FacilityManagement = () => {
  const [facilities, setFacilities] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedFacility, setSelectedFacility] = useState(null);
  
  // Confirm dialog states
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    onConfirm: null
  });
  
  // Global state
  const { showGlobalError, addNotification } = useApp();
  const { isLoading: isPageLoading, loadingText, showLoading, hideLoading } = useContentLoading(1500); // Only for page load

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

  // Load facilities with pagination
  const loadFacilities = async () => {
    showLoading();
    setError(null);
    try {
      const response = await facilityService.getFacilitiesPaged({
        page: page + 1, // Backend uses 1-based indexing
        pageSize: rowsPerPage
      });
      
      // Handle both paginated and non-paginated responses
      if (response.items) {
        // Paginated response
        setFacilities(response.items);
        setTotalCount(response.totalCount || response.items.length);
      } else {
        // Non-paginated response (fallback)
        setFacilities(response);
        setTotalCount(response.length);
      }
    } catch (err) {
      const errorMessage = err.message || 'Có lỗi xảy ra khi tải danh sách cơ sở vật chất';
      setError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      hideLoading();
    }
  };

  // Load facilities when page or rowsPerPage changes
  useEffect(() => {

    loadFacilities();
  }, [page, rowsPerPage]);

  // Use search result if available, otherwise use paginated facilities
  const displayFacilities = searchResult ? [searchResult] : facilities;
  const paginatedFacilities = displayFacilities;

  // Event handlers
  const handleSearchById = async () => {
    if (!searchId.trim()) {
      setSearchResult(null);
      return;
    }

    setSearchLoading(true);
    try {
      const result = await facilityService.getFacilityById(searchId.trim());
      setSearchResult(result);
      setPage(0);
      
      toast.success(`Tìm thấy cơ sở vật chất: ${result.facilityName}`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Không tìm thấy cơ sở vật chất với ID này';
      setError(errorMessage);
      setSearchResult(null);
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchId('');
    setSearchResult(null);
    setPage(0);
  };

  const handleSearchIdChange = (event) => {
    setSearchId(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreateFacility = () => {
    setDialogMode('create');
    setSelectedFacility(null);
    setOpenDialog(true);
  };

  const handleEditFacility = (facility) => {
    setDialogMode('edit');
    setSelectedFacility(facility);
    setOpenDialog(true);
  };

  const handleDeleteFacility = (facility) => {
    setConfirmDialog({
      open: true,
      title: 'Xác nhận xóa cơ sở vật chất',
      description: `Bạn có chắc chắn muốn xóa cơ sở vật chất "${facility.facilityName}"? Hành động này không thể hoàn tác.`,
      onConfirm: () => performDeleteFacility(facility.id)
    });
  };

  const performDeleteFacility = async (facilityId) => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
    setActionLoading(true);
    
    try {
      await facilityService.deleteFacility(facilityId);
      
      // Reload data without showing loading page
      const response = await facilityService.getFacilitiesPaged({
        page: page + 1,
        pageSize: rowsPerPage
      });
      
      if (response.items) {
        setFacilities(response.items);
        setTotalCount(response.totalCount || response.items.length);
      } else {
        setFacilities(response);
        setTotalCount(response.length);
      }
      
      toast.success(`Xóa cơ sở vật chất thành công!`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi xóa cơ sở vật chất';
      setError(errorMessage);
      showGlobalError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormSubmit = async (data) => {
    setActionLoading(true);
    
    try {
      if (dialogMode === 'create') {
        await facilityService.createFacility(data);
        toast.success(`Tạo cơ sở vật chất "${data.facilityName}" thành công!`, {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        await facilityService.updateFacility(selectedFacility.id, data);
        toast.success(`Cập nhật cơ sở vật chất "${data.facilityName}" thành công!`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
      
      // Reload data without showing loading page
      const response = await facilityService.getFacilitiesPaged({
        page: page + 1,
        pageSize: rowsPerPage
      });
      
      if (response.items) {
        setFacilities(response.items);
        setTotalCount(response.totalCount || response.items.length);
      } else {
        setFacilities(response);
        setTotalCount(response.length);
      }
      
      setOpenDialog(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 
        (dialogMode === 'create' ? 'Có lỗi xảy ra khi tạo cơ sở vật chất' : 'Có lỗi xảy ra khi cập nhật cơ sở vật chất');
      setError(errorMessage);
      showGlobalError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {isPageLoading && <ContentLoading isLoading={isPageLoading} text={loadingText} />}
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          Quản lý Cơ Sở Vật Chất
        </h1>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateFacility}
          className={styles.addButton}
        >
         Thêm Cơ Sở Vật Chất
        </Button>
      </div>

      {/* Search by ID */}
      <Paper className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <TextField
            placeholder="Nhập ID cơ sở vật chất để tìm kiếm..."
            value={searchId}
            onChange={handleSearchIdChange}
            className={styles.searchField}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearchById();
              }
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearchById}
            disabled={!searchId.trim() || searchLoading}
            className={styles.searchButton}
          >
            {searchLoading ? 'Đang tìm...' : 'Tìm theo ID'}
          </Button>
          {searchResult && (
            <Button
              variant="outlined"
              onClick={handleClearSearch}
              className={styles.clearButton}
            >
              Xóa tìm kiếm
            </Button>
          )}
        </div>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" className={styles.errorAlert} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <div className={styles.tableContainer}>
        <DataTable
          data={paginatedFacilities}
          columns={columns}
          loading={isPageLoading}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={searchResult ? 1 : totalCount}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onEdit={handleEditFacility}
          onDelete={handleDeleteFacility}
          emptyMessage={searchResult ? "Không có cơ sở vật chất nào." : "Không có cơ sở vật chất nào. Hãy thêm cơ sở vật chất đầu tiên để bắt đầu."}
      />

      {/* Create/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => !actionLoading && setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle className={styles.dialogTitle}>
          <span className={styles.dialogTitleText}>
            {dialogMode === 'create' ? 'Thêm Cơ Sở Vật Chất mới' : 'Chỉnh sửa Cơ Sở Vật Chất'}
          </span>
        </DialogTitle>
        <DialogContent className={styles.dialogContent}>
          <div style={{ paddingTop: '8px' }}>
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
          </div>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDialog(false)} 
            disabled={actionLoading}
          >
            Hủy
          </Button>
        </DialogActions>
      </Dialog>

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
    </div>
  );
};

export default FacilityManagement;
