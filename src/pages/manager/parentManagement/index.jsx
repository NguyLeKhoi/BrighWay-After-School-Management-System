import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  FamilyRestroom as FamilyIcon,
  PhotoCamera as PhotoCameraIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import DataTable from '../../../components/Common/DataTable';
import Form from '../../../components/Common/Form';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import ManagementPageHeader from '../../../components/Management/PageHeader';
import ManagementSearchSection from '../../../components/Management/SearchSection';
import ManagementFormDialog from '../../../components/Management/FormDialog';
import ContentLoading from '../../../components/Common/ContentLoading';
import { updateManagerUserSchema } from '../../../utils/validationSchemas/userSchemas';
import userService from '../../../services/user.service';
import branchService from '../../../services/branch.service';
import { useApp } from '../../../contexts/AppContext';
import { useAuth } from '../../../contexts/AuthContext';
import useBaseCRUD from '../../../hooks/useBaseCRUD';
import { createStaffAndParentColumns } from '../../../constants/manager/staff/tableColumns';
import { createManagerUserFormFields } from '../../../constants/manager/staff/formFields';
import { toast } from 'react-toastify';
import styles from '../staffAndParentManagement/staffAndParentManagement.module.css';

const ParentManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isInitialMount = useRef(true);
  
  // Parent CRUD - memoize loadFunction to prevent unnecessary re-renders
  const loadParentFunction = useCallback(async (params) => {
    return await userService.getUsersPagedByRole({
      pageIndex: params.page || params.pageIndex || 1,
      pageSize: params.pageSize || params.rowsPerPage || 10,
      Role: 'User',
      Keyword: params.Keyword || params.searchTerm || ''
    });
  }, []);

  const parentCrud = useBaseCRUD({
    loadFunction: loadParentFunction,
    loadOnMount: true
  });

  // Reload data when navigate back to this page (e.g., from create pages)
  useEffect(() => {
    if (location.pathname === '/manager/parents') {
      // Skip first mount to avoid double loading
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }
      
      // Only reload if we're actually navigating back (not just re-rendering)
      // Use a ref to track if we've already reloaded for this pathname
      const timeoutId = setTimeout(() => {
        parentCrud.loadData(false);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
  
  // Common state
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Confirm dialog states
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    onConfirm: null
  });
  
  // Global state
  const { showGlobalError } = useApp();
  const { user } = useAuth();
  
  // Branch options state
  const [branchOptions, setBranchOptions] = useState([]);
  const [branchLoading, setBranchLoading] = useState(false);
  
  // Fetch branch options
  useEffect(() => {
    const fetchBranches = async () => {
      setBranchLoading(true);
      try {
        const branches = await branchService.getAllBranches();
        const options = branches.map(branch => ({
          value: branch.id,
          label: branch.branchName || branch.name || 'N/A'
        }));
        setBranchOptions(options);
      } catch (err) {
        console.error('Error fetching branches:', err);
        setBranchOptions([]);
      } finally {
        setBranchLoading(false);
      }
    };
    
    fetchBranches();
  }, []);
  
  const columns = useMemo(() => createStaffAndParentColumns(), []);
  const formFields = useMemo(
    () => createManagerUserFormFields(actionLoading, branchOptions),
    [actionLoading, branchOptions]
  );
  
  // Create handler
  const handleCreateParent = () => {
    // Show mode selection dialog for parent
    setShowParentModeDialog(true);
  };

  const handleNavigateToCreateParent = (parentMode) => {
    navigate(`/manager/parents/create?mode=${parentMode}`);
  };
  
  // Edit handler
  const handleEditUser = async (user) => {
    setActionLoading(true);
    
    try {
      const expandedUser = await userService.getUserById(user.id, true);
      setSelectedUser(expandedUser);
      setOpenDialog(true);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi lấy thông tin người dùng';
      setError(errorMessage);
      showGlobalError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };
  
  // Delete handler
  const handleDeleteUser = (user) => {
    const userName = user.name || user.fullName || user.email || 'người dùng này';
    setConfirmDialog({
      open: true,
      title: 'Xác nhận xóa người dùng',
      description: `Bạn có chắc chắn muốn xóa người dùng "${userName}"? Hành động này không thể hoàn tác.`,
      onConfirm: () => performDeleteUser(user.id)
    });
  };
  
  // Perform delete
  const performDeleteUser = async (userId) => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
    setActionLoading(true);
    
    try {
      await userService.deleteUserByManager(userId);
      
      toast.success('Xóa người dùng thành công!');
      
      // Reload data
      if (parentCrud.loadData) {
        parentCrud.loadData(false);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi xóa người dùng';
      setError(errorMessage);
      showGlobalError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };
  
  // Form submit handler
  const handleFormSubmit = async (data) => {
    setActionLoading(true);
    
    try {
      // Map fields according to API endpoint: PUT /api/User/{id}
      // Required fields: name, isActive, branchId
      // Optional: profilePictureUrl, password
      const updateData = {
        name: data.name || data.fullName || selectedUser?.name || selectedUser?.fullName || '',
        isActive: data.isActive !== undefined ? data.isActive : (selectedUser?.isActive !== undefined ? selectedUser.isActive : true),
        branchId: data.branchId || selectedUser?.branchId || selectedUser?.branch?.id || null
      };
      
      // Add profilePictureUrl if provided
      if (data.profilePictureUrl) {
        updateData.profilePictureUrl = data.profilePictureUrl;
      }
      
      // Add password if provided
      if (data.password && data.password.trim()) {
        updateData.password = data.password;
      }
      
      await userService.updateUserByManager(selectedUser.id, updateData);
      
      toast.success(`Cập nhật người dùng "${data.name || data.fullName}" thành công!`);
      
      // Close dialog first before reloading to prevent any race conditions
      setOpenDialog(false);
      
      // Reload data after a short delay to ensure dialog is closed
      setTimeout(() => {
        if (parentCrud.loadData) {
          parentCrud.loadData(false).catch(err => {
            // Silently handle loadData errors to prevent redirect
            console.error('Error reloading data after update:', err);
          });
        }
      }, 100);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi cập nhật người dùng';
      setError(errorMessage);
      showGlobalError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };
  
  // Parent creation mode state
  const [parentCreationMode, setParentCreationMode] = useState('ocr'); // 'ocr' or 'manual'
  const [showParentModeDialog, setShowParentModeDialog] = useState(false);
  
  return (
    <div className={styles.container}>
      {parentCrud.isPageLoading && <ContentLoading isLoading={parentCrud.isPageLoading} text={parentCrud.loadingText} />}
      
      {/* Header */}
      <ManagementPageHeader
        title="Quản lý Phụ Huynh"
        createButtonText="Tạo Phụ Huynh"
        onCreateClick={handleCreateParent}
      />

      {/* Error Alert */}
      {(error || parentCrud.error) && (
        <Alert 
          severity="error" 
          className={styles.errorAlert} 
          onClose={() => {
            setError(null);
          }}
        >
          {error || parentCrud.error}
        </Alert>
      )}

      {/* Content */}
      <Box sx={{ mt: 2 }}>
        <ManagementSearchSection
          keyword={parentCrud.keyword}
          onKeywordChange={parentCrud.handleKeywordChange}
          onSearch={parentCrud.handleKeywordSearch}
          onClear={parentCrud.handleClearSearch}
          placeholder="Tìm kiếm phụ huynh theo tên, email..."
        />

        <div className={styles.tableContainer}>
          <DataTable
            data={parentCrud.data}
            columns={columns}
            loading={parentCrud.isPageLoading}
            page={parentCrud.page}
            rowsPerPage={parentCrud.rowsPerPage}
            totalCount={parentCrud.totalCount}
            onPageChange={parentCrud.handlePageChange}
            onRowsPerPageChange={parentCrud.handleRowsPerPageChange}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            emptyMessage="Không có phụ huynh nào. Hãy tạo tài khoản phụ huynh đầu tiên để bắt đầu."
          />
        </div>
      </Box>

      {/* Edit Dialog */}
      <ManagementFormDialog
        open={openDialog}
        onClose={() => !actionLoading && setOpenDialog(false)}
        mode="edit"
        title="Phụ Huynh"
        icon={FamilyIcon}
        loading={actionLoading}
        maxWidth="sm"
      >
        <Form
          schema={updateManagerUserSchema}
          defaultValues={{
            name: selectedUser?.name || selectedUser?.fullName || '',
            branchId: selectedUser?.branchId || selectedUser?.branch?.id || '',
            profilePictureUrl: selectedUser?.profilePictureUrl || '',
            isActive: selectedUser?.isActive !== undefined ? selectedUser.isActive : true
          }}
          onSubmit={handleFormSubmit}
          submitText="Cập nhật Thông Tin"
          loading={actionLoading}
          disabled={actionLoading}
          fields={formFields}
        />
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

      {/* Parent Mode Selection Dialog */}
      <Dialog
        open={showParentModeDialog}
        onClose={() => setShowParentModeDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Chọn phương thức tạo tài khoản Phụ huynh
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Vui lòng chọn một trong hai phương thức sau:
          </Typography>
          <ToggleButtonGroup
            value={parentCreationMode}
            exclusive
            onChange={(e, value) => value && setParentCreationMode(value)}
            fullWidth
            orientation="vertical"
            sx={{ gap: 2 }}
          >
            <ToggleButton
              value="ocr"
              sx={{
                p: 3,
                textAlign: 'left',
                justifyContent: 'flex-start',
                '&.Mui-selected': {
                  backgroundColor: 'primary.50',
                  borderColor: 'primary.main',
                  borderWidth: 2
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <PhotoCameraIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Sử dụng OCR (Chụp CCCD)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tự động trích xuất thông tin từ ảnh CCCD
                  </Typography>
                </Box>
              </Box>
            </ToggleButton>
            <ToggleButton
              value="manual"
              sx={{
                p: 3,
                textAlign: 'left',
                justifyContent: 'flex-start',
                '&.Mui-selected': {
                  backgroundColor: 'primary.50',
                  borderColor: 'primary.main',
                  borderWidth: 2
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <EditIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Nhập thủ công
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Nhập thông tin từng bước bằng form
                  </Typography>
                </Box>
              </Box>
            </ToggleButton>
          </ToggleButtonGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowParentModeDialog(false)}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setShowParentModeDialog(false);
              handleNavigateToCreateParent(parentCreationMode);
            }}
          >
            Tiếp tục
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ParentManagement;

