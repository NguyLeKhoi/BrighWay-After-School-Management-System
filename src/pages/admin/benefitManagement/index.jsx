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
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  CardGiftcard as BenefitIcon
} from '@mui/icons-material';
import DataTable from '../../../components/Common/DataTable';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import benefitService from '../../../services/benefit.service';
import { useApp } from '../../../contexts/AppContext';
import useContentLoading from '../../../hooks/useContentLoading';
import ContentLoading from '../../../components/Common/ContentLoading';
import { toast } from 'react-toastify';
import styles from './BenefitManagement.module.css';

const BenefitManagement = () => {
  const [benefits, setBenefits] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedBenefit, setSelectedBenefit] = useState(null);
  
  // Confirm dialog states
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    onConfirm: null
  });
  
  // Global state
  const { showGlobalError, addNotification } = useApp();
  const { isLoading: isPageLoading, loadingText, showLoading, hideLoading } = useContentLoading(300);

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

  // Load benefits with pagination
  const loadBenefits = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) {
      showLoading();
    }
    setError(null);
    try {
      const response = await benefitService.getBenefitsPaged({
        page: page + 1,
        pageSize: rowsPerPage,
        searchTerm: searchTerm,
        status: statusFilter || null
      });
      
      if (response.items) {
        setBenefits(response.items);
        setTotalCount(response.totalCount || response.items.length);
      } else {
        setBenefits(response);
        setTotalCount(response.length);
      }
    } catch (err) {
      const errorMessage = err.message || 'Có lỗi xảy ra khi tải danh sách lợi ích';
      setError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      if (showLoadingIndicator) {
        hideLoading();
      }
    }
  };

  // Load benefits when page, rowsPerPage, or statusFilter changes
  useEffect(() => {
    loadBenefits();
  }, [page, rowsPerPage, statusFilter]);

  // Load benefits when keyword changes (debounced search while typing)
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadBenefits(false); // Don't show loading indicator for debounced search
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Event handlers
  const handleSearch = () => {
    setPage(0);
    loadBenefits();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPage(0);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreateBenefit = () => {
    setDialogMode('create');
    setSelectedBenefit(null);
    setOpenDialog(true);
  };

  const handleEditBenefit = (benefit) => {
    setDialogMode('edit');
    setSelectedBenefit(benefit);
    setOpenDialog(true);
  };

  const handleDeleteBenefit = (benefit) => {
    setConfirmDialog({
      open: true,
      title: 'Xác nhận xóa lợi ích',
      description: `Bạn có chắc chắn muốn xóa lợi ích "${benefit.name}"? Hành động này không thể hoàn tác.`,
      onConfirm: () => performDeleteBenefit(benefit.id)
    });
  };

  const performDeleteBenefit = async (benefitId) => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
    setActionLoading(true);
    
    try {
      await benefitService.deleteBenefit(benefitId);
      
      toast.success('Xóa lợi ích thành công!', {
        position: "top-right",
        autoClose: 3000,
      });
      
      // If we're deleting the last item on current page and not on first page, go to previous page
      if (benefits.length === 1 && page > 0) {
        setPage(page - 1);
      }
      
      loadBenefits(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi xóa lợi ích';
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
      const submitData = {
        name: data.name,
        description: data.description,
        status: data.status
      };
      
      if (dialogMode === 'create') {
        await benefitService.createBenefit(submitData);
        toast.success(`Tạo lợi ích "${data.name}" thành công!`, {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        await benefitService.updateBenefit(selectedBenefit.id, submitData);
        toast.success(`Cập nhật lợi ích "${data.name}" thành công!`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
      
      setOpenDialog(false);
      loadBenefits();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 
        (dialogMode === 'create' ? 'Có lỗi xảy ra khi tạo lợi ích' : 'Có lỗi xảy ra khi cập nhật lợi ích');
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
          Quản lý Lợi Ích
        </h1>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateBenefit}
          className={styles.addButton}
        >
          Thêm Lợi Ích
        </Button>
      </div>

      {/* Search Section */}
      <Paper className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <TextField
            placeholder="Tìm kiếm theo tên lợi ích..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <FormControl className={styles.statusFilter}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Trạng thái"
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="true">Hoạt động</MenuItem>
              <MenuItem value="false">Không hoạt động</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={searchLoading}
            className={styles.searchButton}
          >
            {searchLoading ? 'Đang tìm...' : 'Tìm kiếm'}
          </Button>
          {(searchTerm || statusFilter) && (
            <Button
              variant="outlined"
              onClick={handleClearSearch}
            >
              Xóa bộ lọc
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
          data={benefits}
          columns={columns}
          loading={isPageLoading}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onEdit={handleEditBenefit}
          onDelete={handleDeleteBenefit}
          emptyMessage="Không có lợi ích nào. Hãy thêm lợi ích đầu tiên để bắt đầu."
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
            overflow: 'hidden',
            maxWidth: '600px'
          }
        }}
      >
        <DialogTitle 
          sx={{
            backgroundColor: '#1976d2',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            position: 'relative'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BenefitIcon />
            <span>
              {dialogMode === 'create' ? 'Thêm Lợi Ích mới' : 'Chỉnh sửa Lợi Ích'}
            </span>
          </Box>
          <Button
            onClick={() => setOpenDialog(false)}
            disabled={actionLoading}
            sx={{
              color: 'white',
              minWidth: 'auto',
              padding: '8px',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            ✕
          </Button>
        </DialogTitle>
        <DialogContent 
          className={styles.dialogContent}
          sx={{ 
            padding: '24px !important',
            paddingTop: '32px !important'
          }}
        >
          <Box 
            component="form" 
            id="benefit-form"
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const statusSwitch = e.target.querySelector('input[name="status"]');
              const data = {
                name: formData.get('name'),
                description: formData.get('description'),
                status: statusSwitch ? statusSwitch.checked : true
              };
              await handleFormSubmit(data);
            }}
          >
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {/* Benefit Name */}
              <Grid item xs={12}>
                <TextField
                  name="name"
                  label="Tên Lợi Ích"
                  required
                  fullWidth
                  placeholder="Ví dụ: Giảm giá học phí, Tặng đồ dùng học tập"
                  defaultValue={selectedBenefit?.name || ''}
                  disabled={actionLoading}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { fontSize: '14px' }
                  }}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Mô Tả"
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Mô tả chi tiết về lợi ích..."
                  defaultValue={selectedBenefit?.description || ''}
                  disabled={actionLoading}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { fontSize: '14px' }
                  }}
                />
              </Grid>

              {/* Status */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name="status"
                      defaultChecked={selectedBenefit?.status !== false}
                      disabled={actionLoading}
                    />
                  }
                  label="Trạng thái hoạt động"
                />
              </Grid>
            </Grid>

            {/* Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                type="button"
                variant="outlined"
                onClick={() => setOpenDialog(false)}
                disabled={actionLoading}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={actionLoading}
              >
                {actionLoading ? 'Đang xử lý...' : dialogMode === 'create' ? 'Tạo Lợi Ích' : 'Cập nhật Lợi Ích'}
              </Button>
            </Box>
          </Box>
        </DialogContent>
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
  );
};

export default BenefitManagement;
