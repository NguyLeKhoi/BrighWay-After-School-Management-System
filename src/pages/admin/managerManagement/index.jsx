import React, { useState, useEffect, useMemo } from 'react';
import {
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import DataTable from '../../../components/Common/DataTable';
import Form from '../../../components/Common/Form';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import ManagementPageHeader from '../../../components/Management/PageHeader';
import ManagementSearchSection from '../../../components/Management/SearchSection';
import ManagementFormDialog from '../../../components/Management/FormDialog';
import ContentLoading from '../../../components/Common/ContentLoading';
import { createManagerSchema, updateUserSchema } from '../../../utils/validationSchemas/userSchemas';
import userService from '../../../services/user.service';
import useFacilityBranchData from '../../../hooks/useFacilityBranchData';
import useBaseCRUD from '../../../hooks/useBaseCRUD';
import { createManagerColumns } from '../../../constants/manager/tableColumns';
import { createManagerFormFields } from '../../../constants/manager/formFields';
import { toast } from 'react-toastify';
import styles from './staffAndManagerManagement.module.css';

const ManagerManagement = () => {
  // Branch selection state
  const [userRoleType, setUserRoleType] = useState(null); // 'staff' or 'manager'
  
  // Fetch branch data (lazy loading - only fetch when dialog opens)
  const { branches, getBranchOptions, isLoading: branchLoading, fetchAllData } = useFacilityBranchData();

  // Use Admin CRUD hook
  const {
    data: users,
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
    selectedItem: selectedUser,
    confirmDialog,
    setConfirmDialog,
    handleCreate: baseHandleCreate,
    handleEdit: baseHandleEdit,
    handleDelete,
    handleFormSubmit: baseHandleFormSubmit,
    handleKeywordSearch,
    handleKeywordChange,
    handleClearSearch,
    handlePageChange,
    handleRowsPerPageChange
  } = useBaseCRUD({
    loadFunction: async (params) => {
      const response = await userService.getUsersPagedByRole({
        pageIndex: params.page || params.pageIndex || 1,
        pageSize: params.pageSize || params.rowsPerPage || 10,
        Role: 'Manager',
        Keyword: params.Keyword || params.searchTerm || ''
      });
      return response;
    },
    createFunction: async (data) => {
      if (userRoleType === 'manager') {
        return await userService.createManager(data);
      } else {
        return await userService.createStaff(data);
      }
    },
    updateFunction: userService.updateUser,
    deleteFunction: userService.deleteUser,
    defaultFilters: {},
    loadOnMount: true
  });

  // Override handleCreate to ensure branches are loaded
  const handleCreate = async () => {
    if (branches.length === 0) {
      await fetchAllData();
    }
    setUserRoleType('manager');
    baseHandleCreate();
  };

  // Override handleEdit to fetch expanded details if needed
  const handleEdit = async (user) => {
    const isUser = user.roles && user.roles.includes('User');
    
    if (isUser) {
      try {
        const expandedUser = await userService.getUserById(user.id, true);
        baseHandleEdit(expandedUser);
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi lấy thông tin người dùng';
        toast.error(errorMessage);
        // Still open dialog with basic user info
        baseHandleEdit(user);
      }
    } else {
      baseHandleEdit(user);
    }
  };

  // Custom form submit handler
  const handleFormSubmit = async (formData) => {
    if (dialogMode === 'create') {
      const submitData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        branchId: formData.branchId || ''
      };
      await baseHandleFormSubmit(submitData);
    } else {
      await baseHandleFormSubmit(formData);
    }
  };

  const columns = useMemo(() => createManagerColumns(), []);

  const branchSelectOptions = useMemo(() => getBranchOptions(), [getBranchOptions]);
  const formFields = useMemo(
    () =>
      createManagerFormFields({
        dialogMode,
        actionLoading,
        branchOptions: branchSelectOptions,
        branchLoading
      }),
    [dialogMode, actionLoading, branchSelectOptions, branchLoading]
  );

  return (
    <div className={styles.container}>
      {isPageLoading && <ContentLoading isLoading={isPageLoading} text={loadingText} />}
      
      {/* Header */}
      <ManagementPageHeader
        title="Quản lý Manager"
        createButtonText="Tạo Manager"
        onCreateClick={handleCreate}
      />

      {/* Search Section */}
      <ManagementSearchSection
        keyword={keyword}
        onKeywordChange={handleKeywordChange}
        onSearch={handleKeywordSearch}
        onClear={handleClearSearch}
        placeholder="Tìm kiếm theo tên, email..."
      />

      {/* Error Alert */}
      {error && (
        <Alert severity="error" className={styles.errorAlert} onClose={() => {}}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <div className={styles.tableContainer}>
        <DataTable
          data={users}
          columns={columns}
          loading={isPageLoading}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage="Không có người dùng nào. Hãy tạo tài khoản đầu tiên để bắt đầu."
        />
      </div>

      {/* Form Dialog */}
      <ManagementFormDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        mode={dialogMode}
        title="Manager"
        icon={PersonIcon}
        loading={actionLoading}
        maxWidth="sm"
      >
        <Form
          schema={dialogMode === 'create' ? createManagerSchema : updateUserSchema}
          defaultValues={{
            name: selectedUser?.name || '',
            email: selectedUser?.email || '',
            password: '',
            branchId: selectedUser?.branchId || '',
            isActive: selectedUser?.isActive !== undefined ? selectedUser.isActive : true
          }}
          onSubmit={handleFormSubmit}
          submitText={dialogMode === 'create' ? 'Tạo Manager' : 'Cập nhật Thông Tin'}
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
    </div>
  );
};

export default ManagerManagement;
