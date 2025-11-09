import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Checkbox,
  ListItemText,
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
  Tooltip,
  TextField,
  Button
} from '@mui/material';
import {
  Business as BusinessIcon,
  CardGiftcard as BenefitIcon,
  Assignment as AssignIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import ManagementPageHeader from '../../../components/Management/PageHeader';
import ManagementSearchSection from '../../../components/Management/SearchSection';
import ManagementFormDialog from '../../../components/Management/FormDialog';
import ContentLoading from '../../../components/Common/ContentLoading';
import branchService from '../../../services/branch.service';
import benefitService from '../../../services/benefit.service';
import useLocationData from '../../../hooks/useLocationData';
import useBaseCRUD from '../../../hooks/useBaseCRUD';
import { toast } from 'react-toastify';
import styles from './BranchManagement.module.css';

const BranchManagement = () => {
  // Location data
  const {
    provinces,
    districts,
    isLoading: locationLoading,
    handleProvinceChange,
    getProvinceOptions,
    getDistrictOptions,
    fetchProvinces
  } = useLocationData();

  const [provinceId, setProvinceId] = useState('');
  const [districtId, setDistrictId] = useState('');

  // Expanded rows state (keep this special feature)
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [rowBenefits, setRowBenefits] = useState({});

  // Assign benefits dialog states (keep this special feature)
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [selectedBranchForAssign, setSelectedBranchForAssign] = useState(null);
  const [availableBenefits, setAvailableBenefits] = useState([]);
  const [assignedBenefits, setAssignedBenefits] = useState([]);
  const [selectedBenefits, setSelectedBenefits] = useState([]);
  const [loadingBenefits, setLoadingBenefits] = useState(false);

  // Use shared CRUD hook for basic operations
  const {
    data: branches,
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
    selectedItem: selectedBranch,
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
    handleRowsPerPageChange
  } = useBaseCRUD({
    loadFunction: async (params) => {
      const response = await branchService.getBranchesPaged({
        page: params.page,
        pageSize: params.pageSize,
        searchTerm: params.searchTerm || params.Keyword || ''
      });
      return response;
    },
    createFunction: branchService.createBranch,
    updateFunction: branchService.updateBranch,
    deleteFunction: branchService.deleteBranch,
    loadOnMount: true
  });

  // Handle province change
  useEffect(() => {
    if (provinceId) {
      handleProvinceChange(provinceId);
      if (!selectedBranch) {
        setDistrictId('');
      }
    }
  }, [provinceId, handleProvinceChange, selectedBranch]);

  // Load provinces when dialog opens
  useEffect(() => {
    if (openDialog && provinces.length === 0) {
      fetchProvinces();
    }
  }, [openDialog]);

  // Sync districtId when editing
  useEffect(() => {
    if (selectedBranch?.districtId && !districtId && provinces.length > 0) {
      let foundProvinceId = '';
      for (const province of provinces) {
        if (province.districts && province.districts.some(d => d.id === selectedBranch.districtId)) {
          foundProvinceId = province.id;
          break;
        }
      }
      if (foundProvinceId) {
        setProvinceId(foundProvinceId);
        setDistrictId(selectedBranch.districtId);
      }
    }
  }, [selectedBranch, provinces, districtId]);

  // Override handleCreate to ensure provinces are loaded
  const handleCreateWithData = async () => {
    if (provinces.length === 0) {
      await fetchProvinces();
    }
    setProvinceId('');
    setDistrictId('');
    handleCreate();
  };

  // Override handleEdit to ensure provinces are loaded
  const handleEditWithData = async (branch) => {
    if (provinces.length === 0) {
      await fetchProvinces();
    }
    handleEdit(branch);
  };

  // Custom form submit handler (need to include districtId)
  const handleFormSubmit = async (data) => {
    const submitData = {
      ...data,
      districtId: districtId
    };
    await baseHandleFormSubmit(submitData);
    setProvinceId('');
    setDistrictId('');
  };

  // Handle expand/collapse row (keep this special feature)
  const handleToggleExpand = async (branchId) => {
    const newExpanded = new Set(expandedRows);
    const isCurrentlyExpanded = expandedRows.has(branchId);
    
    if (isCurrentlyExpanded) {
      newExpanded.delete(branchId);
    } else {
      newExpanded.add(branchId);
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

  // Handle assign benefits (keep this special feature)
  const handleAssignBenefits = async (branch) => {
    setSelectedBranchForAssign(branch);
    setLoadingBenefits(true);
    setOpenAssignDialog(true);
    
    try {
      const [allBenefits, assigned] = await Promise.all([
        benefitService.getAllBenefits(),
        benefitService.getBenefitsByBranchId(branch.id).catch(() => [])
      ]);
      
      setAvailableBenefits(allBenefits);
      setAssignedBenefits(assigned);
      setSelectedBenefits(assigned.map(b => b.id));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tải danh sách lợi ích');
    } finally {
      setLoadingBenefits(false);
    }
  };

  // Handle submit assignment (keep this special feature)
  const handleSubmitAssignment = async () => {
    if (!selectedBranchForAssign) return;
    
    try {
      await benefitService.assignBenefitsToBranch({
        branchId: selectedBranchForAssign.id,
        benefitIds: selectedBenefits
      });
      
      toast.success(`Gán lợi ích cho "${selectedBranchForAssign.branchName}" thành công!`);
      
      const updated = await benefitService.getBenefitsByBranchId(selectedBranchForAssign.id);
      setAssignedBenefits(updated);
      
      if (expandedRows.has(selectedBranchForAssign.id)) {
        setRowBenefits(prev => ({ ...prev, [selectedBranchForAssign.id]: updated }));
      }
      
      setOpenAssignDialog(false);
      setSelectedBranchForAssign(null);
      setSelectedBenefits([]);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi gán lợi ích');
    }
  };

  // Handle remove benefit (keep this special feature)
  const handleRemoveBenefit = async (branchId, benefitId, benefitName) => {
    setConfirmDialog({
      open: true,
      title: 'Xác nhận gỡ lợi ích',
      description: `Bạn có chắc chắn muốn gỡ lợi ích "${benefitName}" khỏi chi nhánh này không?`,
      onConfirm: async () => {
        try {
          await benefitService.removeBenefitFromBranch(branchId, benefitId);
          toast.success(`Đã gỡ lợi ích "${benefitName}" khỏi chi nhánh thành công!`);
          
          const updated = await benefitService.getBenefitsByBranchId(branchId);
          setRowBenefits(prev => ({ ...prev, [branchId]: updated }));
          
          if (selectedBranchForAssign?.id === branchId) {
            setAssignedBenefits(updated);
          }
          
          setConfirmDialog(prev => ({ ...prev, open: false }));
        } catch (err) {
          toast.error(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi gỡ lợi ích');
          setConfirmDialog(prev => ({ ...prev, open: false }));
        }
      }
    });
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
          <Tooltip title="Sửa">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleEditWithData(item)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(item)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];


  return (
    <div className={styles.container}>
      {isPageLoading && <ContentLoading isLoading={isPageLoading} text={loadingText} />}
      
      {/* Header */}
      <ManagementPageHeader
        title="Quản lý Chi Nhánh"
        createButtonText="Thêm Chi Nhánh"
        onCreateClick={handleCreateWithData}
      />

      {/* Search Section */}
      <ManagementSearchSection
        keyword={keyword}
        onKeywordChange={handleKeywordChange}
        onSearch={handleKeywordSearch}
        onClear={handleClearSearch}
        placeholder="Tìm kiếm theo tên, địa chỉ..."
      />

      {/* Error Alert */}
      {error && (
        <Alert severity="error" className={styles.errorAlert} onClose={() => {}}>
          {error}
        </Alert>
      )}

      {/* Custom Table with Expandable Rows */}
      <div className={styles.tableContainer}>
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
              ) : !branches || branches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center">
                      <Typography variant="h6" color="text.secondary">
                        Không có chi nhánh nào. Hãy thêm chi nhánh đầu tiên để bắt đầu.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  branches.map((branch, index) => (
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
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Số dòng mỗi trang:"
          />
        </div>

      {/* Form Dialog with Location Fields */}
      <ManagementFormDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setProvinceId('');
          setDistrictId('');
        }}
        mode={dialogMode}
        title="Chi Nhánh"
        icon={BusinessIcon}
        loading={actionLoading}
        maxWidth="md"
      >
        <Box component="form" onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const data = {
            branchName: formData.get('branchName'),
            address: formData.get('address'),
            phone: formData.get('phone'),
            districtId: districtId
          };
          await handleFormSubmit(data);
        }}>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Thông tin chi nhánh
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Nhập tên chi nhánh và thông tin liên hệ để hiển thị trong hệ thống.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="branchName"
                label="Tên Chi Nhánh"
                required
                fullWidth
                defaultValue={selectedBranch?.branchName || ''}
                disabled={actionLoading}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 1 }}>
                Địa chỉ chi tiết
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Chọn tỉnh/thành, quận/huyện và nhập địa chỉ cụ thể.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Tỉnh/Thành Phố</InputLabel>
                <Select
                  value={provinceId}
                  onChange={(e) => setProvinceId(e.target.value)}
                  label="Tỉnh/Thành Phố"
                  disabled={actionLoading || locationLoading}
                >
                  <MenuItem value="">Chọn tỉnh/thành phố</MenuItem>
                  {getProvinceOptions().map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required disabled={!provinceId}>
                <InputLabel>Quận/Huyện</InputLabel>
                <Select
                  value={districtId}
                  onChange={(e) => setDistrictId(e.target.value)}
                  label="Quận/Huyện"
                  disabled={actionLoading || locationLoading || !provinceId}
                >
                  <MenuItem value="">Chọn quận/huyện</MenuItem>
                  {getDistrictOptions().map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Địa Chỉ"
                required
                fullWidth
                defaultValue={selectedBranch?.address || ''}
                disabled={actionLoading}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Liên hệ
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Thông tin liên lạc được dùng khi gửi thông báo cho chi nhánh.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="phone"
                label="Số Điện Thoại"
                required
                fullWidth
                defaultValue={selectedBranch?.phone || ''}
                disabled={actionLoading}
              />
            </Grid>
          </Grid>
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

      {/* Assign Benefits Dialog - Keep this special feature */}
      <ManagementFormDialog
        open={openAssignDialog}
        onClose={() => setOpenAssignDialog(false)}
        mode="assign"
        title={`Gán Lợi Ích cho "${selectedBranchForAssign?.branchName}"`}
        icon={BenefitIcon}
        loading={loadingBenefits || actionLoading}
        maxWidth="md"
      >
        <>
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
        </>
      </ManagementFormDialog>
    </div>
  );
};

export default BranchManagement;

