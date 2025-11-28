import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  AccessTime as BranchSlotIcon,
  Person as StaffIcon,
  PersonAdd as AssignStaffIcon
} from '@mui/icons-material';
import DataTable from '../../../components/Common/DataTable';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import ManagementPageHeader from '../../../components/Management/PageHeader';
import ManagementSearchSection from '../../../components/Management/SearchSection';
import ManagementFormDialog from '../../../components/Management/FormDialog';
import ContentLoading from '../../../components/Common/ContentLoading';
import Form from '../../../components/Common/Form';
import branchSlotService from '../../../services/branchSlot.service';
import useBranchSlotDependencies from '../../../hooks/useBranchSlotDependencies';
import useBaseCRUD from '../../../hooks/useBaseCRUD';
import { createBranchSlotColumns } from '../../../definitions/branchSlot/tableColumns';
import { createBranchSlotFormFields } from '../../../definitions/branchSlot/formFields';
import { branchSlotSchema } from '../../../utils/validationSchemas/branchSlotSchemas';
import { assignStaffSchema } from '../../../utils/validationSchemas/assignStaffSchemas';
import { toast } from 'react-toastify';
import styles from './BranchSlotManagement.module.css';

/**
 * Week Date Mapping:
 * 0 = Chủ nhật (Sunday)
 * 1 = Thứ 2 (Monday)
 * 2 = Thứ 3 (Tuesday)
 * 3 = Thứ 4 (Wednesday)
 * 4 = Thứ 5 (Thursday)
 * 5 = Thứ 6 (Friday)
 * 6 = Thứ 7 (Saturday)
 */
const WEEK_DAYS = [
  { value: 0, label: 'Chủ nhật' },
  { value: 1, label: 'Thứ 2' },
  { value: 2, label: 'Thứ 3' },
  { value: 3, label: 'Thứ 4' },
  { value: 4, label: 'Thứ 5' },
  { value: 5, label: 'Thứ 6' },
  { value: 6, label: 'Thứ 7' }
];

const ManagerBranchSlotManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isInitialMount = useRef(true);
  const {
    timeframeOptions,
    slotTypeOptions,
    roomOptions,
    staffOptions,
    loading: dependenciesLoading,
    error: dependenciesError,
    fetchDependencies
  } = useBranchSlotDependencies();

  const {
    data: branchSlots,
    totalCount,
    page,
    rowsPerPage,
    keyword,
    filters,
    error,
    actionLoading,
    isPageLoading,
    loadingText,
    openDialog: dialogOpen,
    setOpenDialog: setDialogOpen,
    dialogMode,
    selectedItem: selectedBranchSlot,
    confirmDialog,
    setConfirmDialog,
    handleCreate: handleCreateBase,
    handleEdit: handleEditBase,
    handleDelete,
    handleFormSubmit: handleFormSubmitBase,
    handleKeywordSearch,
    handleKeywordChange,
    handleClearSearch,
    handlePageChange,
    handleRowsPerPageChange,
    updateFilter,
    loadData
  } = useBaseCRUD({
    loadFunction: async (params) => {
      return branchSlotService.getMyBranchSlotsPaged({
        page: params.page,
        pageSize: params.pageSize,
        searchTerm: params.searchTerm || params.Keyword || '',
        status: params.status === '' ? null : params.status,
        weekDate: params.weekDate === '' ? null : params.weekDate,
        timeframeId: params.timeframeId === '' ? null : params.timeframeId,
        slotTypeId: params.slotTypeId === '' ? null : params.slotTypeId
      });
    },
    createFunction: branchSlotService.createMyBranchSlot,
    updateFunction: branchSlotService.updateBranchSlot,
    deleteFunction: branchSlotService.deleteBranchSlot,
    defaultFilters: { status: '', weekDate: '', timeframeId: '', slotTypeId: '' },
    loadOnMount: true
  });

  const branchSlotColumns = useMemo(() => createBranchSlotColumns(styles), []);

  // Assign staff dialog state
  const [assignStaffDialog, setAssignStaffDialog] = useState({
    open: false,
    branchSlot: null,
    rooms: []
  });
  const [assignStaffLoading, setAssignStaffLoading] = useState(false);
  const [slotRooms, setSlotRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const timeframeSelectOptions = useMemo(
    () => [
      { value: '', label: 'Chọn khung giờ' },
      ...timeframeOptions.map((tf) => ({
        value: tf.id,
        label: `${tf.name} (${tf.startTime} - ${tf.endTime})`
      }))
    ],
    [timeframeOptions]
  );

  const slotTypeSelectOptions = useMemo(
    () => [
      { value: '', label: 'Chọn loại ca giữ trẻ' },
      ...slotTypeOptions.map((st) => ({
        value: st.id,
        label: st.name
      }))
    ],
    [slotTypeOptions]
  );

  const weekDateSelectOptions = useMemo(
    () => [
      { value: '', label: 'Chọn ngày trong tuần' },
      ...WEEK_DAYS.map((day) => ({
        value: day.value,
        label: day.label
      }))
    ],
    []
  );

  const staffSelectOptions = useMemo(
    () => [
      { value: '', label: 'Chọn nhân viên' },
      ...staffOptions.map((staff) => ({
        value: staff.id,
        label: `${staff.name}${staff.email ? ` (${staff.email})` : ''}`
      }))
    ],
    [staffOptions]
  );

  const roomSelectOptions = useMemo(
    () => {
      const options = [{ value: '', label: 'Không chọn phòng (tùy chọn)' }];
      if (slotRooms.length > 0) {
        options.push(...slotRooms.map((room) => ({
          value: room.id,
          label: room.roomName || room.name || 'N/A'
        })));
      } else if (roomOptions.length > 0) {
        options.push(...roomOptions.map((room) => ({
          value: room.id,
          label: room.name || 'N/A'
        })));
      }
      return options;
    },
    [slotRooms, roomOptions]
  );

  const branchSlotFormFields = useMemo(
    () =>
      createBranchSlotFormFields({
        actionLoading,
        dependenciesLoading,
        timeframeSelectOptions,
        slotTypeSelectOptions,
        weekDateOptions: weekDateSelectOptions
      }),
    [actionLoading, dependenciesLoading, timeframeSelectOptions, slotTypeSelectOptions, weekDateSelectOptions]
  );

  const branchSlotDefaultValues = useMemo(
    () => ({
      timeframeId: selectedBranchSlot?.timeframeId || selectedBranchSlot?.timeframe?.id || '',
      slotTypeId: selectedBranchSlot?.slotTypeId || selectedBranchSlot?.slotType?.id || '',
      weekDate: selectedBranchSlot?.weekDate ?? '',
      status: selectedBranchSlot?.status || 'Available'
    }),
    [selectedBranchSlot]
  );

  // Fetch dependencies on mount for filters
  useEffect(() => {
    if (timeframeOptions.length === 0 || slotTypeOptions.length === 0) {
      fetchDependencies();
    }
  }, [timeframeOptions.length, slotTypeOptions.length, fetchDependencies]);

  useEffect(() => {
    if (dialogOpen && (dialogMode === 'create' || dialogMode === 'edit')) {
      if (timeframeOptions.length === 0 || slotTypeOptions.length === 0) {
        fetchDependencies();
      }
    }
  }, [dialogOpen, dialogMode, timeframeOptions.length, slotTypeOptions.length, fetchDependencies]);

  // Fetch dependencies when assign staff dialog opens
  useEffect(() => {
    if (assignStaffDialog.open) {
      if (staffOptions.length === 0 || roomOptions.length === 0) {
        fetchDependencies();
      }
    }
  }, [assignStaffDialog.open, staffOptions.length, roomOptions.length, fetchDependencies]);

  // Reload data when navigate back to this page (e.g., from create/update pages)
  useEffect(() => {
    if (location.pathname === '/manager/branch-slots') {
      // Skip first mount to avoid double loading
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }
      loadData(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleCreate = useCallback(() => {
    // Navigate to create page with stepper
    navigate('/manager/branch-slots/create');
  }, [navigate]);

  const handleEdit = useCallback(
    async (item) => {
      // Navigate to update page with stepper
      navigate(`/manager/branch-slots/update/${item.id}`);
    },
    [navigate]
  );

  const handleFormSubmit = useCallback(
    async (data) => {
      const submitData = {
        timeframeId: data.timeframeId,
        slotTypeId: data.slotTypeId,
        weekDate: Number(data.weekDate),
        status: data.status
      };
      
      // Just create/update branch slot, no staff assignment here
      await handleFormSubmitBase(submitData);
    },
    [handleFormSubmitBase]
  );

  const handleAssignStaff = useCallback(async (branchSlot) => {
    setAssignStaffDialog({ open: true, branchSlot, rooms: [] });
    setSlotRooms([]);
    setLoadingRooms(true);
    
    try {
      // Fetch rooms assigned to this branch slot
      const roomsData = await branchSlotService.getRoomsByBranchSlot(branchSlot.id);
      const rooms = roomsData?.items || roomsData || [];
      setSlotRooms(rooms);
      setAssignStaffDialog(prev => ({ ...prev, rooms }));
    } catch (err) {
      console.error('Error fetching rooms:', err);
      // Continue anyway, user can still assign staff without room
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  const handleAssignStaffSubmit = useCallback(async (data) => {
    if (!assignStaffDialog.branchSlot) return;

    setAssignStaffLoading(true);
    try {
      const submitData = {
        branchSlotId: assignStaffDialog.branchSlot.id,
        userId: data.userId,
        roomId: data.roomId || null,
        name: data.name || null
      };

      await branchSlotService.assignStaff(submitData);
      
      toast.success('Gán nhân viên thành công!', {
        position: "top-right",
        autoClose: 3000,
      });

      setAssignStaffDialog({ open: false, branchSlot: null, rooms: [] });
      await loadData(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi gán nhân viên';
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setAssignStaffLoading(false);
    }
  }, [assignStaffDialog.branchSlot, loadData]);

  const assignStaffFormFields = useMemo(
    () => [
      {
        section: 'Thông tin gán nhân viên',
        sectionDescription: 'Chọn nhân viên và phòng (nếu có) để gán vào ca giữ trẻ này.',
        name: 'userId',
        label: 'Nhân viên',
        type: 'select',
        required: true,
        options: staffSelectOptions,
        gridSize: 12,
        disabled: assignStaffLoading || dependenciesLoading || staffSelectOptions.length === 0
      },
      {
        name: 'roomId',
        label: 'Phòng (tùy chọn)',
        type: 'select',
        options: roomSelectOptions,
        gridSize: 8,
        disabled: assignStaffLoading || loadingRooms || roomSelectOptions.length === 0,
        helperText: 'Chọn phòng nếu nhân viên sẽ làm việc tại phòng cụ thể'
      },
      {
        name: 'name',
        label: 'Tên vai trò (tùy chọn)',
        type: 'text',
        placeholder: 'Ví dụ: Nhân viên chăm sóc chính, Nhân viên hỗ trợ...',
        gridSize: 4,
        disabled: assignStaffLoading
      }
    ],
    [assignStaffLoading, dependenciesLoading, loadingRooms, staffSelectOptions, roomSelectOptions]
  );

  const assignStaffDefaultValues = useMemo(
    () => ({
      userId: '',
      roomId: '',
      name: ''
    }),
    []
  );

  const renderStaffDetails = useCallback((staff = [], branchSlot) => {
    return (
      <Box className={styles.staffWrapper}>
        <Box className={styles.staffMeta}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Nhân viên được gán
          </Typography>
          <Box display="flex" gap={1} alignItems="center">
            {staff.length > 0 && (
              <Chip
                label={`${staff.length} nhân viên`}
                color="primary"
                variant="outlined"
                size="small"
                sx={{ fontWeight: 500 }}
              />
            )}
          </Box>
        </Box>

        {staff.length > 0 ? (
          <TableContainer component={Paper} variant="outlined" className={styles.staffTable}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: 'grey.100' }}>
                <TableRow>
                  <TableCell sx={{ width: 56, fontWeight: 600 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tên nhân viên</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Phòng</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {staff.map((staffMember, idx) => (
                  <TableRow
                    key={staffMember.staffId || idx}
                    hover
                    sx={{ '&:hover': { backgroundColor: 'grey.50' } }}
                  >
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <StaffIcon fontSize="small" color="primary" />
                        <Typography fontWeight={600}>
                          {staffMember.staffName || 'Không rõ tên'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {staffMember.roomName || 'Chưa gán phòng'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Chưa có nhân viên được gán cho ca giữ trẻ này.
          </Typography>
        )}
      </Box>
    );
  }, []);

  const renderTimeframeFilter = (value, onChange) => (
    <FormControl className={styles.statusFilter} size="small" variant="outlined">
      <InputLabel id="timeframe-filter-label" shrink>
        Khung giờ
      </InputLabel>
      <Select 
        labelId="timeframe-filter-label"
        value={value} 
        onChange={onChange} 
        label="Khung giờ"
        disabled={dependenciesLoading || timeframeSelectOptions.length === 0}
        displayEmpty
        notched
      >
        <MenuItem value="">Tất cả</MenuItem>
        {timeframeSelectOptions.filter(opt => opt.value !== '').map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  const renderSlotTypeFilter = (value, onChange) => (
    <FormControl className={styles.statusFilter} size="small" variant="outlined">
      <InputLabel id="slottype-filter-label" shrink>
        Loại ca giữ trẻ
      </InputLabel>
      <Select 
        labelId="slottype-filter-label"
        value={value} 
        onChange={onChange} 
        label="Loại ca giữ trẻ"
        disabled={dependenciesLoading || slotTypeSelectOptions.length === 0}
        displayEmpty
        notched
      >
        <MenuItem value="">Tất cả</MenuItem>
        {slotTypeSelectOptions.filter(opt => opt.value !== '').map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  return (
    <div className={styles.container}>
      {isPageLoading && <ContentLoading isLoading={isPageLoading} text={loadingText} />}

      <ManagementPageHeader
        title="Quản lý Ca Giữ Trẻ"
        createButtonText="Thêm Ca Giữ Trẻ Mới"
        onCreateClick={handleCreate}
      />

      {dependenciesError && (
        <Alert severity="warning" className={styles.errorAlert}>
          {dependenciesError}
        </Alert>
      )}

      <ManagementSearchSection
        keyword={keyword}
        onKeywordChange={handleKeywordChange}
        onSearch={handleKeywordSearch}
        onClear={() => {
          handleClearSearch();
          updateFilter('timeframeId', '');
          updateFilter('slotTypeId', '');
        }}
        placeholder="Tìm kiếm theo khung giờ hoặc loại ca giữ trẻ..."
      >
        {renderTimeframeFilter(filters.timeframeId || '', (e) => updateFilter('timeframeId', e.target.value))}
        {renderSlotTypeFilter(filters.slotTypeId || '', (e) => updateFilter('slotTypeId', e.target.value))}
      </ManagementSearchSection>

      {error && (
        <Alert severity="error" className={styles.errorAlert}>
          {error}
        </Alert>
      )}

      <div className={styles.tableContainer}>
        <DataTable
          data={branchSlots}
          columns={branchSlotColumns}
          loading={isPageLoading}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          expandableConfig={{
            isRowExpandable: (item) => true, // Always expandable to show assign button
            renderExpandedContent: (item) => renderStaffDetails(item?.staff || [], item)
          }}
          emptyMessage="Không có ca giữ trẻ nào. Hãy thêm ca giữ trẻ đầu tiên để bắt đầu."
        />
      </div>

      <ManagementFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        mode={dialogMode}
        title="Ca Giữ Trẻ"
        icon={BranchSlotIcon}
        loading={actionLoading || dependenciesLoading}
        maxWidth="md"
      >
        <Form
          key={`branchSlot-${dialogMode}-${selectedBranchSlot?.id || 'new'}`}
          schema={branchSlotSchema}
          defaultValues={branchSlotDefaultValues}
          onSubmit={handleFormSubmit}
          submitText={dialogMode === 'create' ? 'Tạo Ca Giữ Trẻ' : 'Cập nhật Ca Giữ Trẻ'}
          loading={actionLoading || dependenciesLoading}
          disabled={actionLoading || dependenciesLoading}
          fields={branchSlotFormFields}
        />
      </ManagementFormDialog>

      <ManagementFormDialog
        open={assignStaffDialog.open}
        onClose={() => setAssignStaffDialog({ open: false, branchSlot: null, rooms: [] })}
        mode="create"
        title="Gán Nhân Viên"
        icon={AssignStaffIcon}
        loading={assignStaffLoading || loadingRooms || dependenciesLoading}
        maxWidth="sm"
      >
        <Form
          key={`assign-staff-${assignStaffDialog.branchSlot?.id || 'new'}`}
          schema={assignStaffSchema}
          defaultValues={assignStaffDefaultValues}
          onSubmit={handleAssignStaffSubmit}
          submitText="Gán Nhân Viên"
          loading={assignStaffLoading || loadingRooms || dependenciesLoading}
          disabled={assignStaffLoading || loadingRooms || dependenciesLoading}
          fields={assignStaffFormFields}
        />
      </ManagementFormDialog>

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
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

export default ManagerBranchSlotManagement;

