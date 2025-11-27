import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Alert } from '@mui/material';
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
import useBaseCRUD from '../../../hooks/useBaseCRUD';
import { toast } from 'react-toastify';
import { getErrorMessage } from '../../../utils/errorHandler';
import styles from './UserManagement.module.css';

// Table columns definition
const createUserColumns = () => [
  {
    id: 'name',
    label: 'Tên',
    minWidth: 150,
    align: 'left'
  },
  {
    id: 'email',
    label: 'Email',
    minWidth: 200,
    align: 'left'
  },
  {
    id: 'createdAt',
    label: 'Ngày tạo',
    minWidth: 120,
    align: 'left',
    format: (value) => {
      if (!value) return '—';
      const date = new Date(value);
      return date.toLocaleDateString('vi-VN');
    }
  },
  {
    id: 'actions',
    label: 'Thao tác',
    minWidth: 120,
    align: 'center',
    sortable: false
  }
];

// Form fields definition
const createUserFormFields = (dialogMode, actionLoading) => {
  const baseFields = [
    {
      name: 'name',
      label: 'Tên',
      type: 'text',
      required: true,
      placeholder: 'Nhập tên người dùng'
    }
  ];

  if (dialogMode === 'update') {
    baseFields.push({
      name: 'isActive',
      label: 'Trạng thái',
      type: 'checkbox',
      required: false
    });
  }

  return baseFields;
};

const UserManagement = () => {
  const location = useLocation();
  const isInitialMount = useRef(true);

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
    handleRowsPerPageChange,
    loadData
  } = useBaseCRUD({
    loadFunction: async (params) => {
      const response = await userService.getUsersPagedByRole({
        pageIndex: params.page || params.pageIndex || 1,
        pageSize: params.pageSize || params.rowsPerPage || 10,
        Role: 'User', // Only show User role
        Keyword: params.Keyword || params.searchTerm || ''
      });
      return response;
    },
    updateFunction: userService.updateUser,
    deleteFunction: userService.deleteUser,
    defaultFilters: { roleFilter: 'User' },
    loadOnMount: true
  });

  // Override handleEdit to fetch expanded details if needed
  const handleEdit = async (user) => {
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
  };

  // Custom form submit handler
  const handleFormSubmit = async (formData) => {
    // Only allow updating name and isActive
    const updateData = {
      name: formData.name || selectedUser?.name || '',
      isActive: formData.isActive !== undefined ? formData.isActive : (selectedUser?.isActive !== undefined ? selectedUser.isActive : true)
    };
    await baseHandleFormSubmit(updateData);
  };

  const columns = useMemo(() => createUserColumns(), []);

  const formFields = useMemo(
    () => createUserFormFields(dialogMode, actionLoading),
    [dialogMode, actionLoading]
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
        createButtonText={null} // No create button for users
        onCreateClick={null}
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
          emptyMessage="Không có người dùng nào."
        />
      </div>

      {/* Form Dialog */}
      <ManagementFormDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        mode={dialogMode}
        title="Người Dùng"
        icon={PersonIcon}
        loading={actionLoading}
        maxWidth="sm"
      >
        <Form
          schema={updateUserSchema}
          defaultValues={{
            name: selectedUser?.name || '',
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

