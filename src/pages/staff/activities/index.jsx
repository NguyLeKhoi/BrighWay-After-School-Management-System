import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import DataTable from '../../../components/Common/DataTable';
import activityService from '../../../services/activity.service';
import { useLoading } from '../../../hooks/useLoading';
import Loading from '../../../components/Common/Loading';
import { createStaffActivityColumns } from '../../../constants/staff/activities/tableColumns';
import { toast } from 'react-toastify';

const StaffActivities = () => {
  const [activities, setActivities] = useState([]);
  const { isLoading, showLoading, hideLoading } = useLoading();
  const [error, setError] = useState(null);

  const columns = useMemo(() => createStaffActivityColumns(), []);

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

