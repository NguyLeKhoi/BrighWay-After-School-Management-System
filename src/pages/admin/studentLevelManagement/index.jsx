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
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  School as StudentLevelIcon
} from '@mui/icons-material';
import DataTable from '../../../components/Common/DataTable';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import studentLevelService from '../../../services/studentLevel.service';
import { useApp } from '../../../contexts/AppContext';
import useContentLoading from '../../../hooks/useContentLoading';
import ContentLoading from '../../../components/Common/ContentLoading';
import { toast } from 'react-toastify';
import styles from './StudentLevelManagement.module.css';

const StudentLevelManagement = () => {
  const [studentLevels, setStudentLevels] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedStudentLevel, setSelectedStudentLevel] = useState(null);
  
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
      header: 'Tên Cấp Độ',
      render: (value, item) => (
        <Box display="flex" alignItems="center" gap={1}>
          <StudentLevelIcon fontSize="small" color="primary" />
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
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
          {value || 'Không có mô tả'}
        </Typography>
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

  // Load student levels with pagination
  const loadStudentLevels = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) {
      showLoading();
    }
    setError(null);
    try {
      const response = await studentLevelService.getStudentLevelsPaged({
        page: page + 1,
        pageSize: rowsPerPage,
        keyword: searchTerm
      });
      
      if (response.items) {
        setStudentLevels(response.items);
        setTotalCount(response.totalCount || response.items.length);
      } else {
        setStudentLevels(response);
        setTotalCount(response.length);
      }
    } catch (err) {
      const errorMessage = err.message || 'Có lỗi xảy ra khi tải danh sách cấp độ học sinh';
      setError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      if (showLoadingIndicator) {
        hideLoading();
      }
    }
  };

  // Load student levels when page or rowsPerPage changes
  useEffect(() => {
    loadStudentLevels();
  }, [page, rowsPerPage]);

  // Load student levels when keyword changes (debounced search while typing)
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadStudentLevels(false); // Don't show loading indicator for debounced search
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Event handlers
  const handleSearch = () => {
    setPage(0);
    loadStudentLevels();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(0);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreateStudentLevel = () => {
    setDialogMode('create');
    setSelectedStudentLevel(null);
    setOpenDialog(true);
  };

  const handleEditStudentLevel = (studentLevel) => {
    setDialogMode('edit');
    setSelectedStudentLevel(studentLevel);
    setOpenDialog(true);
  };

  const handleDeleteStudentLevel = (studentLevel) => {
    setConfirmDialog({
      open: true,
      title: 'Xác nhận xóa cấp độ học sinh',
      description: `Bạn có chắc chắn muốn xóa cấp độ học sinh "${studentLevel.name}"? Hành động này không thể hoàn tác.`,
      onConfirm: () => performDeleteStudentLevel(studentLevel.id)
    });
  };

  const performDeleteStudentLevel = async (studentLevelId) => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
    setActionLoading(true);
    
    try {
      await studentLevelService.deleteStudentLevel(studentLevelId);
      
      toast.success('Xóa cấp độ học sinh thành công!', {
        position: "top-right",
        autoClose: 3000,
      });
      
      // If we're deleting the last item on current page and not on first page, go to previous page
      if (studentLevels.length === 1 && page > 0) {
        setPage(page - 1);
      }
      
      loadStudentLevels(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi xóa cấp độ học sinh';
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
        description: data.description
      };
      
      if (dialogMode === 'create') {
        await studentLevelService.createStudentLevel(submitData);
        toast.success(`Tạo cấp độ học sinh "${data.name}" thành công!`, {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        await studentLevelService.updateStudentLevel(selectedStudentLevel.id, submitData);
        toast.success(`Cập nhật cấp độ học sinh "${data.name}" thành công!`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
      
      setOpenDialog(false);
      loadStudentLevels();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 
        (dialogMode === 'create' ? 'Có lỗi xảy ra khi tạo cấp độ học sinh' : 'Có lỗi xảy ra khi cập nhật cấp độ học sinh');
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
          Quản lý Cấp Độ Học Sinh
        </h1>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateStudentLevel}
          className={styles.addButton}
        >
          Thêm Cấp Độ
        </Button>
      </div>

      {/* Search Section */}
      <Paper className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <TextField
            placeholder="Tìm kiếm theo tên cấp độ học sinh..."
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
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={searchLoading}
            className={styles.searchButton}
          >
            {searchLoading ? 'Đang tìm...' : 'Tìm kiếm'}
          </Button>
          {searchTerm && (
            <Button
              variant="outlined"
              onClick={handleClearSearch}
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
          data={studentLevels}
          columns={columns}
          loading={isPageLoading}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onEdit={handleEditStudentLevel}
          onDelete={handleDeleteStudentLevel}
          emptyMessage="Không có cấp độ học sinh nào. Hãy thêm cấp độ đầu tiên để bắt đầu."
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
            <StudentLevelIcon />
            <span>
              {dialogMode === 'create' ? 'Thêm Cấp Độ Học Sinh mới' : 'Chỉnh sửa Cấp Độ Học Sinh'}
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
            id="studentlevel-form"
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = {
                name: formData.get('name'),
                description: formData.get('description')
              };
              await handleFormSubmit(data);
            }}
          >
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {/* Student Level Name */}
              <Grid item xs={12}>
                <TextField
                  name="name"
                  label="Tên Cấp Độ"
                  required
                  fullWidth
                  placeholder="Ví dụ: Mầm Non, Tiểu Học, Trung Học Cơ Sở"
                  defaultValue={selectedStudentLevel?.name || ''}
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
                  placeholder="Mô tả chi tiết về cấp độ học sinh..."
                  defaultValue={selectedStudentLevel?.description || ''}
                  disabled={actionLoading}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { fontSize: '14px' }
                  }}
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
                {actionLoading ? 'Đang xử lý...' : dialogMode === 'create' ? 'Tạo Cấp Độ' : 'Cập nhật Cấp Độ'}
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

export default StudentLevelManagement;
