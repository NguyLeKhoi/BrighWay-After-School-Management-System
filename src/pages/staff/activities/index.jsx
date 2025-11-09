import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Chip, Alert } from '@mui/material';
import {
  Event as EventIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import DataTable from '../../../components/Common/DataTable';
import activityService from '../../../services/activity.service';
import { useLoading } from '../../../hooks/useLoading';
import Loading from '../../../components/Common/Loading';
import { toast } from 'react-toastify';

const StaffActivities = () => {
  const [activities, setActivities] = useState([]);
  const { isLoading, showLoading, hideLoading } = useLoading();
  const [error, setError] = useState(null);

  const columns = [
    {
      key: 'title',
      header: 'Tiêu đề',
      render: (value) => (
        <Box display="flex" alignItems="center" gap={1}>
          <EventIcon fontSize="small" color="primary" />
          <Typography variant="subtitle2" fontWeight="medium">
            {value || 'N/A'}
          </Typography>
        </Box>
      )
    },
    {
      key: 'description',
      header: 'Mô tả',
      render: (value) => (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {value || 'N/A'}
        </Typography>
      )
    },
    {
      key: 'activityTypeName',
      header: 'Loại hoạt động',
      render: (value) => (
        <Chip 
          label={value || 'N/A'} 
          color="primary" 
          size="small"
          variant="outlined"
        />
      )
    },
    {
      key: 'createdBy',
      header: 'Người tạo',
      render: (value) => (
        <Box display="flex" alignItems="center" gap={0.5}>
          <PersonIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {value || 'N/A'}
          </Typography>
        </Box>
      )
    },
    {
      key: 'startDate',
      header: 'Ngày bắt đầu',
      render: (value) => (
        <Box display="flex" alignItems="center" gap={0.5}>
          <CalendarIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {value ? new Date(value).toLocaleDateString('vi-VN') : 'N/A'}
          </Typography>
        </Box>
      )
    },
    {
      key: 'endDate',
      header: 'Ngày kết thúc',
      render: (value) => (
        <Box display="flex" alignItems="center" gap={0.5}>
          <CalendarIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {value ? new Date(value).toLocaleDateString('vi-VN') : 'N/A'}
          </Typography>
        </Box>
      )
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (value) => (
        <Chip 
          label={value ? 'Hoạt động' : 'Không hoạt động'} 
          color={value ? 'success' : 'default'} 
          size="small" 
        />
      )
    },
    {
      key: 'createdTime',
      header: 'Ngày tạo',
      render: (value) => (
        <Typography variant="body2" color="text.secondary">
          {value ? new Date(value).toLocaleDateString('vi-VN') : 'N/A'}
        </Typography>
      )
    }
  ];

  useEffect(() => {
    const load = async () => {
      setError(null);
      showLoading();
      try {
        const data = await activityService.getAllActivities();
        setActivities(Array.isArray(data) ? data : []);
      } catch (e) {
        const errorMessage = e?.message || 'Không tải được danh sách hoạt động';
        setError(errorMessage);
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 4000,
        });
      } finally {
        hideLoading();
      }
    };
    load();
  }, []);

  return (
    <>
      {isLoading && <Loading />}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Danh sách Hoạt Động
        </Typography>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <DataTable
          data={activities}
          columns={columns}
          loading={isLoading}
          page={0}
          rowsPerPage={activities?.length || 10}
          totalCount={activities?.length || 0}
          onPageChange={() => {}}
          onRowsPerPageChange={() => {}}
          emptyMessage="Không có dữ liệu hoạt động."
        />
      </Box>
    </>
  );
};

export default StaffActivities;

