import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { Category as ActivityTypeIcon } from '@mui/icons-material';
import DataTable from '../../../components/Common/DataTable';
import Form from '../../../components/Common/Form';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
import ManagementFormDialog from '../../../components/Management/FormDialog';
import ManagementPageHeader from '../../../components/Management/PageHeader';
import activityTypeService from '../../../services/activityType.service';
import { useLoading } from '../../../hooks/useLoading';
import ContentLoading from '../../../components/Common/ContentLoading';
import { createStaffActivityTypeColumns } from '../../../definitions/staff/activityTypes/tableColumns';
import { createActivityTypeFormFields } from '../../../definitions/staff/activityTypes/formFields';
import { activityTypeSchema } from '../../../utils/validationSchemas/activityTypeSchemas';
import { toast } from 'react-toastify';

const StaffActivityTypes = () => {
  const [activityTypes, setActivityTypes] = useState([]);
  const { isLoading, showLoading, hideLoading } = useLoading();
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    onConfirm: null
  });

  const columns = useMemo(() => createStaffActivityTypeColumns(), []);
  const formFields = useMemo(() => createActivityTypeFormFields(actionLoading), [actionLoading]);


  const loadData = async () => {
    setError(null);
    showLoading();
    try {
      const data = await activityTypeService.getAllActivityTypes();
      // Thêm số thứ tự vào mỗi item
      const dataWithStt = Array.isArray(data) 
        ? data.map((item, index) => ({ ...item, stt: index + 1 }))
        : [];
      setActivityTypes(dataWithStt);
    } catch (e) {
      const errorMessage = e?.message || 'Không tải được danh sách loại hoạt động';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 4000
      });
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = () => {
    setSelectedItem(null);
    setDialogMode('create');
    setOpenDialog(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setDialogMode('update');
    setOpenDialog(true);
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    setConfirmDialog({
      open: true,
      title: 'Xóa Loại Hoạt Động',
      description: `Bạn có chắc chắn muốn xóa loại hoạt động "${item.name}"? Hành động này không thể hoàn tác.`,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, open: false }));
        setActionLoading(true);
        try {
          await activityTypeService.deleteActivityType(item.id);
          toast.success('Xóa loại hoạt động thành công!', {
            position: 'top-right',
            autoClose: 3000
          });
          await loadData();
        } catch (e) {
          const errorMessage = e?.message || 'Có lỗi xảy ra khi xóa loại hoạt động';
          toast.error(errorMessage, {
            position: 'top-right',
            autoClose: 4000
          });
        } finally {
          setActionLoading(false);
          setSelectedItem(null);
        }
      }
    });
  };

  const handleFormSubmit = async (data) => {
    setActionLoading(true);
    try {
      if (dialogMode === 'create') {
        await activityTypeService.createActivityType({
          name: data.name,
          description: data.description || ''
        });
        toast.success('Tạo loại hoạt động thành công!', {
          position: 'top-right',
          autoClose: 3000
        });
      } else if (dialogMode === 'update') {
        await activityTypeService.updateActivityType(selectedItem.id, {
          name: data.name,
          description: data.description || ''
        });
        toast.success('Cập nhật loại hoạt động thành công!', {
          position: 'top-right',
          autoClose: 3000
        });
      }
      setOpenDialog(false);
      await loadData();
    } catch (e) {
      const errorMessage = dialogMode === 'create' 
        ? 'Có lỗi xảy ra khi tạo loại hoạt động'
        : 'Có lỗi xảy ra khi cập nhật loại hoạt động';
      toast.error(e?.message || errorMessage, {
        position: 'top-right',
        autoClose: 4000
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <ContentLoading 
        isLoading={isLoading} 
        text="Đang tải danh sách loại hoạt động..." 
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <ManagementPageHeader
          title="Danh sách Loại Hoạt Động"
          createButtonText="Thêm Loại Hoạt Động"
          onCreateClick={handleCreate}
        />

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <DataTable
          data={activityTypes}
          columns={columns}
          loading={isLoading}
          page={0}
          rowsPerPage={(() => {
            const count = activityTypes?.length || 0;
            // Đảm bảo rowsPerPage là một trong các giá trị hợp lệ: 5, 10, 25, 50
            if (count === 0) return 10;
            if (count <= 5) return 5;
            if (count <= 10) return 10;
            if (count <= 25) return 25;
            if (count <= 50) return 50;
            return 50;
          })()}
          totalCount={activityTypes?.length || 0}
          onPageChange={() => {}}
          onRowsPerPageChange={() => {}}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage="Không có dữ liệu loại hoạt động."
          showActions={true}
        />

        {/* Form Dialog */}
        <ManagementFormDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          mode={dialogMode}
          title="Loại Hoạt Động"
          icon={ActivityTypeIcon}
          loading={actionLoading}
          maxWidth="sm"
        >
          <Form
            schema={activityTypeSchema}
            defaultValues={{
              name: selectedItem?.name || '',
              description: selectedItem?.description || ''
            }}
            onSubmit={handleFormSubmit}
            submitText={dialogMode === 'create' ? 'Tạo Loại Hoạt Động' : 'Cập nhật Loại Hoạt Động'}
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
          highlightText={selectedItem?.name}
        />
      </Box>
    </>
  );
};

export default StaffActivityTypes;


