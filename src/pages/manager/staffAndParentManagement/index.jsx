import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Alert
} from '@mui/material';
import {
  Person as PersonIcon,
  Groups as GroupsIcon
} from '@mui/icons-material';
import DataTable from '../../../components/Common/DataTable';
import Form from '../../../components/Common/Form';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import StaffAccountForm from '../../../components/AccountForms/StaffAccountForm';
import ManagementPageHeader from '../../../components/Management/PageHeader';
import ManagementSearchSection from '../../../components/Management/SearchSection';
import ManagementFormDialog from '../../../components/Management/FormDialog';
import ContentLoading from '../../../components/Common/ContentLoading';
import { createUserSchema, updateManagerUserSchema } from '../../../utils/validationSchemas/userSchemas';
import userService from '../../../services/user.service';
import branchService from '../../../services/branch.service';
import { useApp } from '../../../contexts/AppContext';
import { useAuth } from '../../../contexts/AuthContext';
import useBaseCRUD from '../../../hooks/useBaseCRUD';
import { createStaffAndParentColumns } from '../../../constants/manager/staff/tableColumns';
import { createManagerUserFormFields } from '../../../constants/manager/staff/formFields';
import { toast } from 'react-toastify';
import { getErrorMessage } from '../../../utils/errorHandler';
import styles from './staffAndParentManagement.module.css';

const StaffAndParentManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isInitialMount = React.useRef(true);
  
  // Staff CRUD - memoize loadFunction to prevent unnecessary re-renders
  const loadStaffFunction = useCallback(async (params) => {
      return await userService.getUsersPagedByRole({
        pageIndex: params.page || params.pageIndex || 1,
        pageSize: params.pageSize || params.rowsPerPage || 10,
        Role: 'Staff',
        Keyword: params.Keyword || params.searchTerm || ''
      });
  }, []);
  
  const staffCrud = useBaseCRUD({
    loadFunction: loadStaffFunction,
    loadOnMount: true
  });

  // Reload data when navigate back to this page (e.g., from create pages)
  useEffect(() => {
    if (location.pathname === '/manager/staff') {
      // Skip first mount to avoid double loading
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }
      
      // Only reload if we're actually navigating back (not just re-rendering)
      // Use a ref to track if we've already reloaded for this pathname
      const timeoutId = setTimeout(() => {
        staffCrud.loadData(false);
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
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  const handleCreateStaff = () => {
    setIsSubmitting(false);
      setOpenCreateDialog(true);
  };
  
  // Edit handler
  const handleEditUser = async (user) => {
    setActionLoading(true);
    
    try {
      const isUser = user.roles && user.roles.includes('User');
      
      if (isUser) {
        const expandedUser = await userService.getUserById(user.id, true);
        setSelectedUser(expandedUser);
      } else {
        setSelectedUser(user);
      }
      setOpenDialog(true);
    } catch (err) {
      const errorMessage = getErrorMessage(err) || 'Có lỗi xảy ra khi lấy thông tin người dùng';
      setError(errorMessage);
      showGlobalError(errorMessage);
      toast.error(errorMessage, {
        autoClose: 5000,
        style: { whiteSpace: 'pre-line' }
      });
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
      if (staffCrud.loadData) {
        staffCrud.loadData(false);
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err) || 'Có lỗi xảy ra khi xóa người dùng';
      setError(errorMessage);
      showGlobalError(errorMessage);
      toast.error(errorMessage, {
        autoClose: 5000,
        style: { whiteSpace: 'pre-line' }
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  // Form submit handler
  const handleFormSubmit = async (data) => {
    setActionLoading(true);
    
    try {
      // Allow updating name, branchId, and isActive
      const updateData = {
        name: data.name || data.fullName || selectedUser?.name || selectedUser?.fullName || '',
        branchId: data.branchId || selectedUser?.branchId || selectedUser?.branch?.id || null,
        isActive: data.isActive !== undefined ? data.isActive : (selectedUser?.isActive !== undefined ? selectedUser.isActive : true)
      };
      
      await userService.updateUserByManager(selectedUser.id, updateData);
      
      toast.success(`Cập nhật người dùng "${data.name || data.fullName}" thành công!`);
      
      // Reload data
      if (staffCrud.loadData) {
        staffCrud.loadData(false);
      }
      setOpenDialog(false);
    } catch (err) {
      const errorMessage = getErrorMessage(err) || 'Có lỗi xảy ra khi cập nhật người dùng';
      setError(errorMessage);
      showGlobalError(errorMessage);
      toast.error(errorMessage, {
        autoClose: 5000,
        style: { whiteSpace: 'pre-line' }
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  // Staff submit handler
  const handleStaffSubmit = async (data) => {
    try {
      await userService.createStaff(data);
      toast.success('Tạo tài khoản Staff thành công!');
      if (staffCrud.loadData) {
        staffCrud.loadData(false);
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err) || 'Có lỗi xảy ra khi tạo tài khoản';
      setError(errorMessage);
      showGlobalError(errorMessage);
      toast.error(errorMessage, {
        autoClose: 5000,
        style: { whiteSpace: 'pre-line' }
      });
      throw err;
    }
  };
  
  return (
    <div className={styles.container}>
      {staffCrud.isPageLoading && <ContentLoading isLoading={staffCrud.isPageLoading} text={staffCrud.loadingText} />}
      
      {/* Header */}
      <ManagementPageHeader
        title="Quản lý Nhân Viên"
        createButtonText="Tạo Nhân Viên"
        onCreateClick={handleCreateStaff}
      />

      {/* Error Alert */}
      {(error || staffCrud.error) && (
        <Alert 
          severity="error" 
          className={styles.errorAlert} 
          onClose={() => {
            setError(null);
          }}
        >
          {error || staffCrud.error}
        </Alert>
      )}

      {/* Content */}
      <Box sx={{ mt: 2 }}>
            <ManagementSearchSection
          keyword={staffCrud.keyword}
          onKeywordChange={staffCrud.handleKeywordChange}
          onSearch={staffCrud.handleKeywordSearch}
          onClear={staffCrud.handleClearSearch}
              placeholder="Tìm kiếm nhân viên theo tên, email..."
            />

            <div className={styles.tableContainer}>
              <DataTable
            data={staffCrud.data}
                columns={columns}
            loading={staffCrud.isPageLoading}
            page={staffCrud.page}
            rowsPerPage={staffCrud.rowsPerPage}
            totalCount={staffCrud.totalCount}
            onPageChange={staffCrud.handlePageChange}
            onRowsPerPageChange={staffCrud.handleRowsPerPageChange}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                emptyMessage="Không có nhân viên nào. Hãy tạo tài khoản nhân viên đầu tiên để bắt đầu."
              />
            </div>
      </Box>

      {/* Edit Dialog */}
      <ManagementFormDialog
        open={openDialog}
        onClose={() => !actionLoading && setOpenDialog(false)}
        mode="edit"
        title="Người Dùng"
        icon={PersonIcon}
        loading={actionLoading}
        maxWidth="sm"
      >
        <Form
          schema={updateManagerUserSchema}
          defaultValues={{
            name: selectedUser?.name || selectedUser?.fullName || '',
            branchId: selectedUser?.branchId || selectedUser?.branch?.id || '',
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

      {/* Create Account Dialog */}
      <ManagementFormDialog
        open={openCreateDialog}
        onClose={() => {
          if (!isSubmitting) {
            setOpenCreateDialog(false);
            setIsSubmitting(false);
          }
        }}
        mode="create"
        title="Tài Khoản Nhân Viên"
        icon={GroupsIcon}
        loading={isSubmitting}
        maxWidth="md"
      >
          <StaffAccountForm
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
            onStaffSubmit={handleStaffSubmit}
            onSuccess={() => {
              setOpenCreateDialog(false);
            }}
          />
      </ManagementFormDialog>
    </div>
  );
};

export default StaffAndParentManagement;
