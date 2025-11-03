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
  Checkbox,
  ListItemText,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  Autocomplete,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Collapse,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Business as BusinessIcon,
  Search as SearchIcon,
  CardGiftcard as BenefitIcon,
  Assignment as AssignIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import DataTable from '../../../components/Common/DataTable';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import branchService from '../../../services/branch.service';
import benefitService from '../../../services/benefit.service';
import useLocationData from '../../../hooks/useLocationData';
import { useApp } from '../../../contexts/AppContext';
import useContentLoading from '../../../hooks/useContentLoading';
import ContentLoading from '../../../components/Common/ContentLoading';
import { toast } from 'react-toastify';
import styles from './BranchManagement.module.css';

const BranchManagement = () => {
  const [branches, setBranches] = useState([]);
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
  const [selectedBranch, setSelectedBranch] = useState(null);
  
  // Assign benefits dialog states
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [selectedBranchForAssign, setSelectedBranchForAssign] = useState(null);
  const [availableBenefits, setAvailableBenefits] = useState([]);
  const [assignedBenefits, setAssignedBenefits] = useState([]);
  const [selectedBenefits, setSelectedBenefits] = useState([]);
  const [loadingBenefits, setLoadingBenefits] = useState(false);
  
  // Expanded rows state
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [rowBenefits, setRowBenefits] = useState({});
  
  // Confirm dialog states
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    onConfirm: null
  });
  
  // Global state
  const { showGlobalError, addNotification } = useApp();
  const { isLoading: isPageLoading, loadingText, showLoading, hideLoading } = useContentLoading(300); // Only for page load
  
  // Location data
  const {
    provinces,
    districts,
    selectedProvinceId,
    isLoading: locationLoading,
    error: locationError,
    handleProvinceChange,
    getProvinceOptions,
    getDistrictOptions
  } = useLocationData();

  const [provinceId, setProvinceId] = useState('');
  const [districtId, setDistrictId] = useState('');

  // Handle province change
  useEffect(() => {
    if (provinceId) {
      handleProvinceChange(provinceId);
      // Only clear districtId if it's not from edit mode (selectedBranch)
      if (!selectedBranch) {
        setDistrictId(''); // Clear district when province changes
      }
    }
  }, [provinceId, handleProvinceChange, selectedBranch]);

  // Handle expand/collapse row
  const handleToggleExpand = async (branchId) => {
    const newExpanded = new Set(expandedRows);
    const isCurrentlyExpanded = expandedRows.has(branchId);
    
    if (isCurrentlyExpanded) {
      newExpanded.delete(branchId);
    } else {
      newExpanded.add(branchId);
      // Load benefits if not already loaded
      if (!rowBenefits[branchId]) {
        try {
          const benefits = await benefitService.getBenefitsByBranchId(branchId);
          setRowBenefits(prev => ({ ...prev, [branchId]: benefits }));
        } catch (err) {
          setRowBenefits(prev => ({ ...prev, [branchId]: [] }));
        }
      }
    }
    setExpandedRows(newExpanded);
  };

  // Define table columns
  const columns = [
    {
      key: 'branchName',
      header: 'Tên Chi Nhánh',
      render: (value, item) => (
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton
            size="small"
            onClick={() => handleToggleExpand(item.id)}
            sx={{ padding: '4px', ml: -1 }}
          >
            {expandedRows.has(item.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
          <BusinessIcon fontSize="small" color="primary" />
          <Typography variant="subtitle2" fontWeight="medium">
            {value}
          </Typography>
        </Box>
      )
    },
    {
      key: 'address',
      header: 'Địa Chỉ',
      render: (value, item) => {
        const fullAddress = [
          item.address,
          item.districtName,
          item.provinceName
        ].filter(Boolean).join(', ');
        
        return (
          <Typography variant="body2" color="text.secondary">
            {fullAddress || value}
          </Typography>
        );
      }
    },
    {
      key: 'phone',
      header: 'Số Điện Thoại',
      render: (value) => (
        <Typography variant="body2">
          {value}
        </Typography>
      )
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'center',
      render: (value, item) => (
        <Box display="flex" gap={0.5} justifyContent="center">
          <IconButton
            size="small"
            color="info"
            onClick={() => handleAssignBenefits(item)}
            title="Gán lợi ích"
          >
            <AssignIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleEditBranch(item)}
            title="Sửa"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeleteBranch(item)}
            title="Xóa"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )
    }
  ];

  // Load branches with pagination
  const loadBranches = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) {
      showLoading();
    }
    setError(null);
    try {
      const response = await branchService.getBranchesPaged({
        page: page + 1, // Backend uses 1-based indexing
        pageSize: rowsPerPage,
        searchTerm: keyword.trim()
      });
      
      // Handle both paginated and non-paginated responses
      if (response.items) {
        // Paginated response
        setBranches(response.items);
        setTotalCount(response.totalCount || response.items.length);
      } else {
        // Non-paginated response (fallback)
        setBranches(response);
        setTotalCount(response.length);
      }
    } catch (err) {
      const errorMessage = err.message || 'Có lỗi xảy ra khi tải danh sách chi nhánh';
      setError(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      if (showLoadingIndicator) {
        hideLoading();
      }
    }
  };

  // Load branches when page or rowsPerPage changes
  useEffect(() => {
    loadBranches();
  }, [page, rowsPerPage]);

  // Load branches when keyword changes (debounced search while typing)
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadBranches(false); // Don't show loading indicator for debounced search
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimer);
  }, [keyword]);

  // Use loaded branches
  const displayBranches = branches;
  const paginatedBranches = displayBranches;

  // Event handlers
  const handleKeywordSearch = () => {
    setPage(0);
    loadBranches();
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

  const handleCreateBranch = () => {
    setDialogMode('create');
    setSelectedBranch(null);
    setProvinceId('');
    setDistrictId('');
    setOpenDialog(true);
  };

  const handleEditBranch = (branch) => {
    setDialogMode('edit');
    setSelectedBranch(branch);
    
    // Find provinceId from districtId
    if (branch?.districtId) {
      // Search through all provinces to find which one contains this district
      let foundProvinceId = '';
      for (const province of provinces) {
        if (province.districts && province.districts.some(d => d.id === branch.districtId)) {
          foundProvinceId = province.id;
          break;
        }
      }
      setProvinceId(foundProvinceId);
      setDistrictId(branch.districtId);
    } else {
      setProvinceId('');
      setDistrictId('');
    }
    
    setOpenDialog(true);
  };

  const handleDeleteBranch = (branch) => {
    setConfirmDialog({
      open: true,
      title: 'Xác nhận xóa chi nhánh',
      description: `Bạn có chắc chắn muốn xóa chi nhánh "${branch.branchName}"? Hành động này không thể hoàn tác.`,
      onConfirm: () => performDeleteBranch(branch.id)
    });
  };

  const performDeleteBranch = async (branchId) => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
    setActionLoading(true);
    
    try {
      await branchService.deleteBranch(branchId);
      
      // Reload data without showing loading page
      const response = await branchService.getBranchesPaged({
        page: page + 1,
        pageSize: rowsPerPage
      });
      
      if (response.items) {
        setBranches(response.items);
        setTotalCount(response.totalCount || response.items.length);
      } else {
        setBranches(response);
        setTotalCount(response.length);
      }
      
      toast.success(`Xóa chi nhánh thành công!`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi xóa chi nhánh';
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
      // Only send districtId to API, not provinceId
      const submitData = {
        branchName: data.branchName,
        address: data.address,
        phone: data.phone,
        districtId: data.districtId
      };
      
      if (dialogMode === 'create') {
        await branchService.createBranch(submitData);
        toast.success(`Tạo chi nhánh "${data.branchName}" thành công!`, {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        await branchService.updateBranch(selectedBranch.id, submitData);
        toast.success(`Cập nhật chi nhánh "${data.branchName}" thành công!`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
      
      // Reload data without showing loading page
      const response = await branchService.getBranchesPaged({
        page: page + 1,
        pageSize: rowsPerPage
      });
      
      if (response.items) {
        setBranches(response.items);
        setTotalCount(response.totalCount || response.items.length);
      } else {
        setBranches(response);
        setTotalCount(response.length);
      }
      
      setOpenDialog(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 
        (dialogMode === 'create' ? 'Có lỗi xảy ra khi tạo chi nhánh' : 'Có lỗi xảy ra khi cập nhật chi nhánh');
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

  // Handle assign benefits
  const handleAssignBenefits = async (branch) => {
    setSelectedBranchForAssign(branch);
    setLoadingBenefits(true);
    setOpenAssignDialog(true);
    
    try {
      // Load all available benefits and assigned benefits in parallel
      const [allBenefits, assigned] = await Promise.all([
        benefitService.getAllBenefits(),
        benefitService.getBenefitsByBranchId(branch.id).catch(() => []) // Return empty array if no benefits assigned
      ]);
      
      setAvailableBenefits(allBenefits);
      setAssignedBenefits(assigned);
      // Pre-select already assigned benefits
      setSelectedBenefits(assigned.map(b => b.id));
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tải danh sách lợi ích';
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoadingBenefits(false);
    }
  };

  // Handle submit assignment
  const handleSubmitAssignment = async () => {
    if (!selectedBranchForAssign) return;
    
    setActionLoading(true);
    try {
      await benefitService.assignBenefitsToBranch({
        branchId: selectedBranchForAssign.id,
        benefitIds: selectedBenefits
      });
      
      toast.success(`Gán lợi ích cho "${selectedBranchForAssign.branchName}" thành công!`, {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Refresh assigned benefits list
      const updated = await benefitService.getBenefitsByBranchId(selectedBranchForAssign.id);
      setAssignedBenefits(updated);
      
      // Refresh row benefits if branch is expanded
      if (expandedRows.has(selectedBranchForAssign.id)) {
        setRowBenefits(prev => ({ ...prev, [selectedBranchForAssign.id]: updated }));
      }
      
      setOpenAssignDialog(false);
      setSelectedBranchForAssign(null);
      setSelectedBenefits([]);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi gán lợi ích';
      showGlobalError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle remove benefit from branch
  const handleRemoveBenefit = async (branchId, benefitId, benefitName) => {
    setConfirmDialog({
      open: true,
      title: 'Xác nhận gỡ lợi ích',
      description: `Bạn có chắc chắn muốn gỡ lợi ích "${benefitName}" khỏi chi nhánh này không?`,
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await benefitService.removeBenefitFromBranch(branchId, benefitId);
          
          toast.success(`Đã gỡ lợi ích "${benefitName}" khỏi chi nhánh thành công!`, {
            position: "top-right",
            autoClose: 3000,
          });
          
          // Refresh benefits list for this branch
          const updated = await benefitService.getBenefitsByBranchId(branchId);
          setRowBenefits(prev => ({ ...prev, [branchId]: updated }));
          
          // If dialog is open for this branch, update assigned benefits
          if (selectedBranchForAssign?.id === branchId) {
            setAssignedBenefits(updated);
          }
        } catch (err) {
          const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi gỡ lợi ích';
          showGlobalError(errorMessage);
          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 4000,
          });
        } finally {
          setActionLoading(false);
          setConfirmDialog({
            open: false,
            title: '',
            description: '',
            onConfirm: null
          });
        }
      }
    });
  };

  return (
    <div className={styles.container}>
      {isPageLoading && <ContentLoading isLoading={isPageLoading} text={loadingText} />}
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          Quản lý Chi Nhánh
        </h1>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateBranch}
          className={styles.addButton}
        >
         Thêm Chi Nhánh
        </Button>
      </div>

      {/* Search Section */}
      <Paper className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <TextField
            placeholder="Tìm kiếm theo tên, địa chỉ..."
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
              onClick={() => setKeyword('')}
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
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : !paginatedBranches || paginatedBranches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center">
                      <Typography variant="h6" color="text.secondary">
                        Không có chi nhánh nào. Hãy thêm chi nhánh đầu tiên để bắt đầu.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedBranches.map((branch, index) => (
                    <React.Fragment key={branch.id || index}>
                      <TableRow hover>
                        {columns.map((column) => (
                          <TableCell key={column.key} align={column.align || 'left'}>
                            {column.render ? column.render(branch[column.key], branch) : branch[column.key]}
                          </TableCell>
                        ))}
                      </TableRow>
                      {/* Expanded row showing benefits */}
                      {expandedRows.has(branch.id) && (
                        <>
                          {rowBenefits[branch.id] === undefined ? (
                            <TableRow>
                              <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                                <CircularProgress size={24} />
                              </TableCell>
                            </TableRow>
                          ) : rowBenefits[branch.id] && rowBenefits[branch.id].length > 0 ? (
                            <>
                              {/* Header row for benefits */}
                              <TableRow sx={{ backgroundColor: 'grey.100' }}>
                                <TableCell colSpan={columns.length} sx={{ fontWeight: 600, py: 1.5, borderBottom: '1px solid', borderBottomColor: 'divider', pl: 4 }}>
                                  Danh sách Lợi Ích
                                </TableCell>
                              </TableRow>
                              {/* Benefit rows */}
                              {rowBenefits[branch.id].map((benefit, idx) => (
                                <TableRow 
                                  key={benefit.id} 
                                  hover
                                  sx={{
                                    backgroundColor: benefit.status ? 'success.50' : 'transparent',
                                    '&:hover': {
                                      backgroundColor: benefit.status ? 'success.100' : 'grey.50'
                                    }
                                  }}
                                >
                                  <TableCell sx={{ pl: 4 }}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <BenefitIcon fontSize="small" color={benefit.status ? 'success' : 'inherit'} />
                                      <Typography variant="body2" fontWeight={500}>
                                        {benefit.name}
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                      {benefit.description || 'Không có mô tả'}
                                    </Typography>
                                  </TableCell>
                                  <TableCell></TableCell>
                                  <TableCell>
                                    <Box display="flex" justifyContent="flex-end" gap={1} alignItems="center">
                                      <Chip
                                        label={benefit.status ? 'Hoạt động' : 'Không hoạt động'}
                                        color={benefit.status ? 'success' : 'default'}
                                        size="small"
                                        sx={{ fontWeight: 500 }}
                                      />
                                      <Tooltip title="Gỡ lợi ích khỏi chi nhánh">
                                        <IconButton
                                          size="small"
                                          color="error"
                                          onClick={() => handleRemoveBenefit(branch.id, benefit.id, benefit.name)}
                                          disabled={actionLoading}
                                          sx={{ ml: 1 }}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </>
                          ) : (
                            <TableRow>
                              <TableCell colSpan={columns.length} align="center" sx={{ py: 3, borderBottom: '1px solid', borderBottomColor: 'divider' }}>
                                <Typography variant="body2" color="text.secondary">
                                  Chi nhánh này chưa có lợi ích nào được gán.
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      )}
                    </React.Fragment>
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
            onPageChange={(e, newPage) => handlePageChange(e, newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => handleRowsPerPageChange(e)}
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
        maxWidth="md" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '8px',
            overflow: 'hidden',
            maxWidth: '800px'
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
            <span>
              {dialogMode === 'create' ? 'Thêm Chi Nhánh mới' : 'Chỉnh sửa Chi Nhánh'}
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
            id="branch-form"
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = {
                branchName: formData.get('branchName'),
                address: formData.get('address'),
                phone: formData.get('phone'),
                districtId: districtId
              };
              await handleFormSubmit(data);
            }}
          >
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {/* Branch Name */}
              <Grid item xs={12}>
                <TextField
                  name="branchName"
                  label="Tên Chi Nhánh"
                  required
                  fullWidth
                  placeholder="Ví dụ: Chi nhánh Quận 1, Chi nhánh Thủ Đức"
                  defaultValue={selectedBranch?.branchName || ''}
                  disabled={actionLoading}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { fontSize: '14px' }
                  }}
                />
              </Grid>

              {/* Province */}
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel sx={{ fontSize: '14px' }}>Tỉnh/Thành Phố</InputLabel>
                  <Select
                    value={provinceId}
                    onChange={(e) => setProvinceId(e.target.value)}
                    label="Tỉnh/Thành Phố"
                    disabled={actionLoading || locationLoading}
                    sx={{ fontSize: '14px' }}
                    MenuProps={{
                      PaperProps: {
                        style: { maxHeight: 250 }
                      }
                    }}
                  >
                    <MenuItem value="">Chọn tỉnh/thành phố</MenuItem>
                    {getProvinceOptions().map(option => (
                      <MenuItem key={option.value} value={option.value} sx={{ fontSize: '14px' }}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* District */}
              <Grid item xs={12}>
                <FormControl fullWidth required disabled={!provinceId}>
                  <InputLabel sx={{ fontSize: '14px' }}>Quận/Huyện</InputLabel>
                  <Select
                    value={districtId}
                    onChange={(e) => setDistrictId(e.target.value)}
                    label="Quận/Huyện"
                    disabled={actionLoading || locationLoading || !provinceId}
                    sx={{ fontSize: '14px' }}
                    MenuProps={{
                      PaperProps: {
                        style: { maxHeight: 250 }
                      }
                    }}
                  >
                    <MenuItem value="" sx={{ fontSize: '14px' }}>Chọn quận/huyện</MenuItem>
                    {getDistrictOptions().map(option => (
                      <MenuItem key={option.value} value={option.value} sx={{ fontSize: '14px' }}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Address */}
              <Grid item xs={12}>
                <TextField
                  name="address"
                  label="Địa Chỉ"
                  required
                  fullWidth
                  placeholder="Địa chỉ đầy đủ của chi nhánh"
                  defaultValue={selectedBranch?.address || ''}
                  disabled={actionLoading}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { fontSize: '14px' }
                  }}
                />
              </Grid>

              {/* Phone */}
              <Grid item xs={12}>
                <TextField
                  name="phone"
                  label="Số Điện Thoại"
                  required
                  fullWidth
                  placeholder="Ví dụ: 0123456789"
                  defaultValue={selectedBranch?.phone || ''}
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
                onClick={() => {
                  setOpenDialog(false);
                  setProvinceId('');
                  setDistrictId('');
                }}
                disabled={actionLoading}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={actionLoading}
              >
                {actionLoading ? 'Đang xử lý...' : dialogMode === 'create' ? 'Tạo Chi Nhánh' : 'Cập nhật Chi Nhánh'}
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

      {/* Assign Benefits Dialog */}
      <Dialog 
        open={openAssignDialog} 
        onClose={() => !loadingBenefits && setOpenAssignDialog(false)} 
        maxWidth="md" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '8px',
            overflow: 'hidden',
            maxWidth: '700px'
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
            padding: '16px 24px'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BenefitIcon />
            <span>
              Gán Lợi Ích cho "{selectedBranchForAssign?.branchName}"
            </span>
          </Box>
          <Button
            onClick={() => setOpenAssignDialog(false)}
            disabled={loadingBenefits}
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
          sx={{ 
            padding: '24px !important',
            paddingTop: '32px !important'
          }}
        >
          {loadingBenefits ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {/* List of available benefits */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Chọn lợi ích
                </Typography>
                <FormControl fullWidth>
                  <Autocomplete
                    multiple
                    options={availableBenefits}
                    getOptionLabel={(option) => option.name}
                    value={availableBenefits.filter(b => selectedBenefits.includes(b.id))}
                    onChange={(event, newValue) => {
                      setSelectedBenefits(newValue.map(b => b.id));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Tìm kiếm và chọn lợi ích..."
                        variant="outlined"
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Checkbox checked={selectedBenefits.includes(option.id)} />
                        <ListItemText
                          primary={option.name}
                          secondary={option.description || 'Không có mô tả'}
                        />
                      </Box>
                    )}
                    disabled={loadingBenefits}
                  />
                </FormControl>
              </Grid>

              {/* Display assigned benefits count */}
              <Grid item xs={12}>
                <Divider />
                <Box mt={2}>
                  <Typography variant="body2" color="text.secondary">
                    Đã chọn: <strong>{selectedBenefits.length}</strong> lợi ích
                  </Typography>
                </Box>
              </Grid>

              {/* List of currently assigned benefits */}
              {assignedBenefits.length > 0 && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom color="primary">
                    Lợi ích hiện tại:
                  </Typography>
                  <List dense>
                    {assignedBenefits.map((benefit) => (
                      <ListItem 
                        key={benefit.id}
                        secondaryAction={
                          <Tooltip title="Gỡ lợi ích">
                            <IconButton
                              edge="end"
                              size="small"
                              color="error"
                              onClick={() => handleRemoveBenefit(selectedBranchForAssign.id, benefit.id, benefit.name)}
                              disabled={actionLoading}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        }
                      >
                        <BenefitIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                        <ListItemText
                          primary={benefit.name}
                          secondary={benefit.description || 'Không có mô tả'}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              )}
            </Grid>
          )}

          {/* Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => setOpenAssignDialog(false)}
              disabled={loadingBenefits || actionLoading}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmitAssignment}
              disabled={loadingBenefits || actionLoading}
              startIcon={<AssignIcon />}
            >
              {actionLoading ? 'Đang xử lý...' : 'Gán Lợi Ích'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BranchManagement;

