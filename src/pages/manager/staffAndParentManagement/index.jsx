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
import StaffAccountForm from '../../../components/AccountForms/StaffAccountForm';
import ManagementPageHeader from '../../../components/Management/PageHeader';
import ManagementSearchSection from '../../../components/Management/SearchSection';
import ManagementFormDialog from '../../../components/Management/FormDialog';
import ContentLoading from '../../../components/Common/ContentLoading';
import { createUserSchema } from '../../../utils/validationSchemas/userSchemas';
import userService from '../../../services/user.service';
import branchService from '../../../services/branch.service';
import { useApp } from '../../../contexts/AppContext';
import { useAuth } from '../../../contexts/AuthContext';
import useBaseCRUD from '../../../hooks/useBaseCRUD';
import { createStaffAndParentColumns } from '../../../definitions/manager/staff/tableColumns';
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
        pageIndex: params.pageIndex,
        pageSize: params.pageSize,
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
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  // Create handler
  const handleCreateStaff = () => {
    setIsSubmitting(false);
      setOpenCreateDialog(true);
  };
  
  // Manager chỉ có quyền get và create, không có update và delete
  
  // Staff submit handler
  const handleStaffSubmit = async (data) => {
    try {
      await userService.createStaff(data);
      toast.success('Tạo tài khoản Nhân viên thành công!');
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
                showActions={false}
                emptyMessage="Không có nhân viên nào. Hãy tạo tài khoản nhân viên đầu tiên để bắt đầu."
              />
            </div>
      </Box>

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
