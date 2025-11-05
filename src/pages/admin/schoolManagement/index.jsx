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
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  School as SchoolIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Restore as RestoreIcon
} from '@mui/icons-material';
import DataTable from '../../../components/Common/DataTable';
import Form from '../../../components/Common/Form';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import { schoolSchema } from '../../../utils/validationSchemas/schoolSchemas';
import schoolService from '../../../services/school.service';
import { useApp } from '../../../contexts/AppContext';
import useContentLoading from '../../../hooks/useContentLoading';
import ContentLoading from '../../../components/Common/ContentLoading';
import { toast } from 'react-toastify';
import styles from './SchoolManagement.module.css';

const SchoolManagement = () => {
  const [schools, setSchools] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [keyword, setKeyword] = useState('');
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedSchool, setSelectedSchool] = useState(null);
  
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
      header: 'Tên Trường',
      render: (value, item) => (
        <Box display="flex" alignItems="center" gap={1}>
          <SchoolIcon fontSize="small" color={item.isDeleted ? 'disabled' : 'primary'} />
          <Typography 
            variant="subtitle2" 
            fontWeight="medium"
            sx={{ 
              color: item.isDeleted ? 'text.disabled' : 'text.primary',
              textDecoration: item.isDeleted ? 'line-through' : 'none'
            }}
          >
            {value}
          </Typography>
        </Box>
      )
    },
    {
      key: 'address',
      header: 'Địa Chỉ',
      render: (value, item) => (
        <Typography 
          variant="body2" 
          color={item.isDeleted ? 'text.disabled' : 'text.secondary'}
          sx={{ textDecoration: item.isDeleted ? 'line-through' : 'none' }}
        >
          {value}
        </Typography>
      )
    },
    {
      key: 'phoneNumber',
      header: 'Số Điện Thoại',
      render: (value, item) => (
        <Typography 
          variant="body2"
          sx={{ textDecoration: item.isDeleted ? 'line-through' : 'none' }}
        >
          {value}
        </Typography>
      )
    },
    {
      key: 'email',
      header: 'Email',
      render: (value, item) => (
        <Typography 
          variant="body2"
          color={item.isDeleted ? 'text.disabled' : 'text.secondary'}
          sx={{ textDecoration: item.isDeleted ? 'line-through' : 'none' }}
        >
          {value}
        </Typography>
      )
    },
    {
      key: 'status',
      header: 'Trạng Thái',
      render: (value, item) => (
        <Chip
          label={item.isDeleted ? 'Đã xóa' : 'Hoạt động'}
          color={item.isDeleted ? 'default' : 'success'}
          size="small"
          sx={{ fontWeight: 500 }}
        />
      )
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'center',
      render: (value, item) => (
        <Box display="flex" gap={0.5} justifyContent="center">
          {item.isDeleted ? (
            <Tooltip title="Khôi phục">
              <IconButton
                size="small"
                color="success"
                onClick={() => handleRestoreSchool(item)}
                title="Khôi phục"
              >
                <RestoreIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <>
              <Tooltip title="Sửa">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => handleEditSchool(item)}
                  title="Sửa"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Xóa (Soft Delete)">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteSchool(item)}
                  title="Xóa"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      )
    }
  ];

  // Load schools with pagination
  const loadSchools = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) {
      showLoading();
    }
    setError(null);
    try {
      const response = await schoolService.getSchoolsPaged({
        page: page + 1,
        pageSize: rowsPerPage,
        name: keyword.trim(),
        includeDeleted: false
      });
      
      // Handle both paginated and non-paginated responses
      if (response.items) {
        setSchools(response.items);
        setTotalCount(response.totalCount || response.items.length);
      } else if (Array.isArray(response)) {
        setSchools(response);
        setTotalCount(response.length);
      } else {
        setSchools([]);
        setTotalCount(0);
      }
    } catch (err) {
      const errorMessage = err.message || 'Có lỗi xảy ra khi tải danh sách trường';
      setError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      if (showLoadingIndicator) {
        hideLoading();
      }
    }
  };

  // Load schools when page or rowsPerPage changes
  useEffect(() => {
    loadSchools();
  }, [page, rowsPerPage]);

  // Load schools when keyword changes (debounced search)
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (keyword.trim() !== '') {
        loadSchools(false);
      } else {
        loadSchools(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [keyword]);

  // Event handlers
  const handleKeywordSearch = () => {
    setPage(0);
    loadSchools();
  };

  const handleKeywordChange = (e) => {
    setKeyword(e.target.value);
    setPage(0);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreateSchool = () => {
    setDialogMode('create');
    setSelectedSchool(null);
    setOpenDialog(true);
  };

  const handleEditSchool = (school) => {
    setDialogMode('edit');
    setSelectedSchool(school);
    setOpenDialog(true);
  };

  const handleDeleteSchool = (school) => {
    setConfirmDialog({
      open: true,
      title: 'Xác nhận xóa trường',
      description: `Bạn có chắc chắn muốn xóa trường "${school.name}"? Trường sẽ được đánh dấu là đã xóa và có thể khôi phục sau.`,
      onConfirm: () => performSoftDeleteSchool(school.id)
    });
  };

  const performSoftDeleteSchool = async (schoolId) => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
    setActionLoading(true);
    
    try {
      await schoolService.softDeleteSchool(schoolId);
      
      toast.success(`Xóa trường thành công!`, {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Reload data
      await loadSchools(false);
      
      // If we're deleting the last item on current page and not on first page, go to previous page
      if (schools.length === 1 && page > 0) {
        setPage(page - 1);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi xóa trường';
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

  const handleRestoreSchool = (school) => {
    setConfirmDialog({
      open: true,
      title: 'Xác nhận khôi phục trường',
      description: `Bạn có chắc chắn muốn khôi phục trường "${school.name}"?`,
      onConfirm: () => performRestoreSchool(school.id)
    });
  };

  const performRestoreSchool = async (schoolId) => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
    setActionLoading(true);
    
    try {
      await schoolService.restoreSchool(schoolId);
      
      toast.success(`Khôi phục trường thành công!`, {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Reload data
      await loadSchools(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi khôi phục trường';
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
        await schoolService.createSchool(data);
        toast.success(`Tạo trường "${data.name}" thành công!`, {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        await schoolService.updateSchool(selectedSchool.id, data);
        toast.success(`Cập nhật trường "${data.name}" thành công!`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
      
      // Reload data
      await loadSchools(false);
      
      setOpenDialog(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 
        (dialogMode === 'create' ? 'Có lỗi xảy ra khi tạo trường' : 'Có lỗi xảy ra khi cập nhật trường');
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
          Quản lý Trường
        </h1>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateSchool}
          className={styles.addButton}
        >
          Thêm Trường
        </Button>
      </div>

      {/* Search Section */}
      <Paper className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <TextField
            placeholder="Tìm kiếm theo tên trường..."
            value={keyword}
            onChange={handleKeywordChange}
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
                handleKeywordSearch();
              }
            }}
          />
          <Button
            variant="contained"
            onClick={handleKeywordSearch}
            disabled={searchLoading}
            className={styles.searchButton}
          >
            {searchLoading ? 'Đang tìm...' : 'Tìm kiếm'}
          </Button>
          {keyword && (
            <Button
              variant="outlined"
              onClick={() => {
                setKeyword('');
                setPage(0);
              }}
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
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell key={column.key} align={column.align || 'left'}>
                      {column.header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {isPageLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center">
                      <Typography variant="body2">Đang tải...</Typography>
                    </TableCell>
                  </TableRow>
                ) : !schools || schools.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center">
                      <Typography variant="h6" color="text.secondary">
                        Không có trường nào. Hãy thêm trường đầu tiên để bắt đầu.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  schools.map((school, index) => (
                    <TableRow 
                      key={school.id || index}
                      hover
                      sx={{
                        backgroundColor: school.isDeleted ? 'action.hover' : 'transparent',
                        opacity: school.isDeleted ? 0.7 : 1
                      }}
                    >
                      {columns.map((column) => (
                        <TableCell key={column.key} align={column.align || 'left'}>
                          {column.render ? column.render(school[column.key], school) : school[column.key]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Pagination */}
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Số dòng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) => 
              `${from}-${to} của ${count !== -1 ? count : `nhiều hơn ${to}`}`
            }
          />
        </Paper>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => !actionLoading && setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '8px',
            overflow: 'hidden'
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
            <SchoolIcon />
            <span>
              {dialogMode === 'create' ? 'Thêm Trường mới' : 'Chỉnh sửa Trường'}
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
        <DialogContent className={styles.dialogContent}>
          <div style={{ paddingTop: '8px' }}>
            <Form
              schema={schoolSchema}
              defaultValues={{
                name: selectedSchool?.name || '',
                address: selectedSchool?.address || '',
                phoneNumber: selectedSchool?.phoneNumber || '',
                email: selectedSchool?.email || ''
              }}
              onSubmit={handleFormSubmit}
              submitText={dialogMode === 'create' ? 'Tạo Trường' : 'Cập nhật Trường'}
              loading={actionLoading}
              disabled={actionLoading}
              fields={[
                { 
                  name: 'name', 
                  label: 'Tên Trường', 
                  type: 'text', 
                  required: true, 
                  placeholder: 'Ví dụ: Trường Tiểu học ABC',
                  disabled: actionLoading
                },
                { 
                  name: 'address', 
                  label: 'Địa Chỉ', 
                  type: 'text', 
                  required: true, 
                  placeholder: 'Địa chỉ đầy đủ của trường',
                  disabled: actionLoading
                },
                { 
                  name: 'phoneNumber', 
                  label: 'Số Điện Thoại', 
                  type: 'text', 
                  required: true, 
                  placeholder: 'Ví dụ: 0123456789',
                  disabled: actionLoading
                },
                { 
                  name: 'email', 
                  label: 'Email', 
                  type: 'email', 
                  required: true, 
                  placeholder: 'Ví dụ: contact@school.edu.vn',
                  disabled: actionLoading
                }
              ]}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.title.includes('khôi phục') ? 'Khôi phục' : 'Xóa'}
        cancelText="Hủy"
        confirmColor={confirmDialog.title.includes('khôi phục') ? 'success' : 'error'}
      />
    </div>
  );
};

export default SchoolManagement;

