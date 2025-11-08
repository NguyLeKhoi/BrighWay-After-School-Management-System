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
  Grid
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  AssignmentInd as RoleIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import DataTable from '../../../components/Common/DataTable';
import Form from '../../../components/Common/Form';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import AdminPageHeader from '../../../components/Admin/AdminPageHeader';
import AdminSearchSection from '../../../components/Admin/AdminSearchSection';
import AdminFormDialog from '../../../components/Admin/AdminFormDialog';
import ContentLoading from '../../../components/Common/ContentLoading';
import { createManagerSchema, updateUserSchema } from '../../../utils/validationSchemas/userSchemas';
import userService from '../../../services/user.service';
import useFacilityBranchData from '../../../hooks/useFacilityBranchData';
import useBaseCRUD from '../../../hooks/useBaseCRUD';
import { toast } from 'react-toastify';
import styles from './staffAndManagerManagement.module.css';

const ManagerManagement = () => {
  // Branch selection state
  const [selectedBranchId, setSelectedBranchId] = useState('');
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

  // Define table columns
  const columns = [
    {
      key: 'name',
      header: 'Họ và Tên',
      render: (value, item) => (
        <Box display="flex" alignItems="center" gap={1}>
          <PersonIcon fontSize="small" color="primary" />
          <Typography variant="subtitle2" fontWeight="medium">
            {value}
          </Typography>
        </Box>
      )
    },
    {
      key: 'email',
      header: 'Email',
      render: (value) => (
        <Box display="flex" alignItems="center" gap={1}>
          <EmailIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {value}
          </Typography>
        </Box>
      )
    },
    {
      key: 'branchName',
      header: 'Chi Nhánh',
      render: (value, item) => (
        <Box display="flex" alignItems="center" gap={1}>
          <BusinessIcon fontSize="small" color={value ? "primary" : "disabled"} />
          <Typography variant="body2" color={value ? "text.primary" : "text.secondary"}>
            {value || item.branchName || 'Chưa có chi nhánh'}
          </Typography>
        </Box>
      )
    },
    {
      key: 'roles',
      header: 'Vai Trò',
      render: (value, item) => {
        // Get roleName or roles from item
        let roleNames = [];
        
        if (item.roleName) {
          roleNames = [item.roleName];
        } else if (Array.isArray(item.roles) && item.roles.length > 0) {
          roleNames = item.roles;
        } else if (value && Array.isArray(value)) {
          roleNames = value;
        } else if (value) {
          roleNames = [value];
        } else {
          roleNames = ['Unknown'];
        }
        
        const getRoleDisplayName = (roleString) => {
          switch (roleString) {
            case 'Admin': return 'Admin';
            case 'Staff': return 'Staff';
            case 'Manager': return 'Manager';
            case 'User': return 'User';
            default: return roleString || 'Unknown';
          }
        };
        
        const getRoleColor = (roleString) => {
          switch (roleString) {
            case 'Admin': return 'error';
            case 'Manager': return 'warning';
            case 'Staff': return 'info';
            case 'User': return 'primary';
            default: return 'default';
          }
        };
        
        return (
          <Box display="flex" flexWrap="wrap" gap={0.5}>
            {roleNames.map((role, index) => (
              <Chip 
                key={index}
                label={getRoleDisplayName(role)} 
                color={getRoleColor(role)} 
                size="small"
                variant="outlined"
                icon={<RoleIcon fontSize="small" />}
              />
            ))}
          </Box>
        );
      }
    },
    {
      key: 'createdAt',
      header: 'Ngày Tạo',
      render: (value) => (
        <Typography variant="body2" color="text.secondary">
          {new Date(value).toLocaleDateString('vi-VN')}
        </Typography>
      )
    }
  ];

  // Get form fields
  const getFormFields = () => {
    if (dialogMode === 'create') {
      return [
        { 
          name: 'name', 
          label: 'Họ và Tên', 
          type: 'text', 
          required: true, 
          placeholder: 'Ví dụ: Nguyễn Văn A',
          disabled: actionLoading,
          gridSize: 6
        },
        { 
          name: 'branchId', 
          label: 'Chi Nhánh', 
          type: 'select', 
          required: false, 
          options: getBranchOptions(),
          disabled: actionLoading || branchLoading,
          gridSize: 6
        },
        { 
          name: 'email', 
          label: 'Email', 
          type: 'email', 
          required: true, 
          placeholder: 'Ví dụ: email@example.com',
          disabled: actionLoading,
          gridSize: 12
        },
        { 
          name: 'password', 
          label: 'Mật Khẩu', 
          type: 'password', 
          required: true, 
          placeholder: 'Nhập mật khẩu cho người dùng',
          disabled: actionLoading,
          gridSize: 12
        }
      ];
    } else {
      return [
        { 
          name: 'name', 
          label: 'Họ và Tên', 
          type: 'text', 
          required: true, 
          placeholder: 'Ví dụ: Nguyễn Văn A',
          disabled: actionLoading,
          gridSize: 6
        },
        { 
          name: 'email', 
          label: 'Email', 
          type: 'email', 
          required: true, 
          placeholder: 'Ví dụ: email@example.com',
          disabled: actionLoading,
          gridSize: 6
        },
        { 
          name: 'password', 
          label: 'Mật Khẩu Mới', 
          type: 'password', 
          required: false,
          placeholder: 'Để trống nếu không muốn thay đổi mật khẩu',
          disabled: actionLoading,
          gridSize: 6,
          helperText: 'Để trống nếu không muốn thay đổi mật khẩu'
        },
        { 
          name: 'isActive', 
          label: 'Trạng Thái', 
          type: 'switch', 
          switchLabel: 'Hoạt động',
          required: true, 
          disabled: actionLoading,
          gridSize: 6
        }
      ];
    }
  };

  return (
    <div className={styles.container}>
      {isPageLoading && <ContentLoading isLoading={isPageLoading} text={loadingText} />}
      
      {/* Header */}
      <AdminPageHeader
        title="Quản lý Manager"
        createButtonText="Tạo Manager"
        onCreateClick={handleCreate}
      />

      {/* Search Section */}
      <AdminSearchSection
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
      <AdminFormDialog
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
          fields={getFormFields()}
        />
      </AdminFormDialog>

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
