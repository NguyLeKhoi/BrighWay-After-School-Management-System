import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Alert, Box, TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { Person as PersonIcon } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import DataTable from '../../../components/Common/DataTable';
import Form from '../../../components/Common/Form';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import ManagementPageHeader from '../../../components/Management/PageHeader';
import ManagementSearchSection from '../../../components/Management/SearchSection';
import ManagementFormDialog from '../../../components/Management/FormDialog';
import ContentLoading from '../../../components/Common/ContentLoading';
import { updateUserSchema } from '../../../utils/validationSchemas/userSchemas';
import userService from '../../../services/user.service';
import useFacilityBranchData from '../../../hooks/useFacilityBranchData';
import useBaseCRUD from '../../../hooks/useBaseCRUD';
import { createManagerColumns } from '../../../constants/manager/tableColumns';
import { createManagerFormFields } from '../../../constants/manager/formFields';
import { toast } from 'react-toastify';
import { getErrorMessage } from '../../../utils/errorHandler';
import styles from '../managerManagement/staffAndManagerManagement.module.css';

const UserManagement = () => {
  const location = useLocation();
  const isInitialMount = useRef(true);
  
  // Fetch branch data (still needed for form fields)
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
    handleEdit: baseHandleEdit,
    handleDelete,
    handleFormSubmit: baseHandleFormSubmit,
    handleKeywordSearch,
    handleKeywordChange,
    handleClearSearch,
    handlePageChange,
    handleRowsPerPageChange,
    filters,
    updateFilter,
    loadData
  } = useBaseCRUD({
    loadFunction: async (params) => {
      const response = await userService.getUsersPagedByRole({
        pageIndex: params.page || params.pageIndex || 1,
        pageSize: params.pageSize || params.rowsPerPage || 10,
        Role: params.roleFilter || null,
        Keyword: params.Keyword || params.searchTerm || '',
        BranchId: params.branchFilter || ''
      });
      return response;
    },
    updateFunction: userService.updateUser,
    deleteFunction: userService.deleteUser,
    defaultFilters: { branchFilter: '', roleFilter: 'User' },
    loadOnMount: true
  });

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Override handleEdit to fetch expanded details if needed
  const handleEdit = async (user) => {
    const isUser = user.roles && user.roles.includes('User');
    
    if (isUser) {
      try {
        const expandedUser = await userService.getUserById(user.id, true);
        baseHandleEdit(expandedUser);
      } catch (err) {
        const errorMessage = getErrorMessage(err) || 'Có lỗi xảy ra khi lấy thông tin người dùng';
        toast.error(errorMessage, {
          autoClose: 5000,
          style: { whiteSpace: 'pre-line' }
        });
        // Still open dialog with basic user info
        baseHandleEdit(user);
      }
    } else {
      baseHandleEdit(user);
    }
  };

  // Custom form submit handler
  const handleFormSubmit = async (formData) => {
    // Allow updating name, branchId, and isActive
    const updateData = {
      name: formData.name || selectedUser?.name || '',
      branchId: formData.branchId || selectedUser?.branchId || selectedUser?.branch?.id || null,
      isActive: formData.isActive !== undefined ? formData.isActive : (selectedUser?.isActive !== undefined ? selectedUser.isActive : true)
    };
    await baseHandleFormSubmit(updateData);
  };

  // Create columns without branch and role columns
  const columns = useMemo(() => {
    const allColumns = createManagerColumns();
    // Filter out the branchName and roles columns
    return allColumns.filter(col => col.key !== 'branchName' && col.key !== 'roles');
  }, []);

  const branchSelectOptions = useMemo(() => getBranchOptions(), [getBranchOptions]);

  // No need for client-side filtering since we're only showing User role
  const filteredUsers = useMemo(() => users, [users]);
  const filteredTotalCount = totalCount;
  
  const formFields = useMemo(
    () =>
      createManagerFormFields({
        dialogMode: 'edit',
        actionLoading,
        branchOptions: branchSelectOptions,
        branchLoading
      }),
    [actionLoading, branchSelectOptions, branchLoading]
  );

  // Reload data when navigate back to this page
  useEffect(() => {
    if (location.pathname === '/admin/users') {
      // Skip first mount to avoid double loading
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }
      loadData(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div className={styles.container}>
      {isPageLoading && <ContentLoading isLoading={isPageLoading} text={loadingText} />}
      
      {/* Header */}
      <ManagementPageHeader
        title="Quản lý Người Dùng"
        createButtonText={null}
        onCreateClick={null}
      />

      {/* Search Section */}
      <ManagementSearchSection
        keyword={keyword}
        onKeywordChange={handleKeywordChange}
        onSearch={handleKeywordSearch}
        onClear={() => {
          handleClearSearch();
          updateFilter('branchFilter', '');
          updateFilter('roleFilter', 'User');
        }}
        placeholder="Tìm kiếm theo tên, email..."
      >
      </ManagementSearchSection>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" className={styles.errorAlert} onClose={() => {}}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <div className={styles.tableContainer}>
        <DataTable
          data={filteredUsers}
          columns={columns}
          loading={isPageLoading}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={filteredTotalCount}
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
        mode="edit"
        title="Người Dùng"
        icon={PersonIcon}
        loading={actionLoading}
        maxWidth="sm"
      >
        <Form
          schema={updateUserSchema}
          defaultValues={{
            name: selectedUser?.name || '',
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
    </div>
  );
};

export default UserManagement;

