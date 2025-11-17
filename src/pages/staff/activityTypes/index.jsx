import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import DataTable from '../../../components/Common/DataTable';
import activityTypeService from '../../../services/activityType.service';
import { useLoading } from '../../../hooks/useLoading';
import Loading from '../../../components/Common/Loading';
import { createStaffActivityTypeColumns } from '../../../constants/staff/activityTypes/tableColumns';
import { toast } from 'react-toastify';

const StaffActivityTypes = () => {
  const [activityTypes, setActivityTypes] = useState([]);
  const { isLoading, showLoading, hideLoading } = useLoading();
  const [error, setError] = useState(null);

  const columns = useMemo(() => createStaffActivityTypeColumns(), []);

  useEffect(() => {
    const load = async () => {
      setError(null);
      showLoading();
      try {
        const data = await activityTypeService.getAllActivityTypes();
        setActivityTypes(Array.isArray(data) ? data : []);
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
    load();
  }, [showLoading, hideLoading]);

  return (
    <>
      {isLoading && <Loading />}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Danh sách Loại Hoạt Động
        </Typography>

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
          rowsPerPage={activityTypes?.length || 10}
          totalCount={activityTypes?.length || 0}
          onPageChange={() => {}}
          onRowsPerPageChange={() => {}}
          emptyMessage="Không có dữ liệu loại hoạt động."
        />
      </Box>
    </>
  );
};

export default StaffActivityTypes;


