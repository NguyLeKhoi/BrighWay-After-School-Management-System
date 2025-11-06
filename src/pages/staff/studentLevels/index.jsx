import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Chip } from '@mui/material';
import DataTable from '../../../components/Common/DataTable';
import studentLevelService from '../../../services/studentLevel.service';
import { useLoading } from '../../../hooks/useLoading';
import Loading from '../../../components/Common/Loading';

const StaffStudentLevels = () => {
  const [levels, setLevels] = useState([]);
  const { isLoading, showLoading, hideLoading } = useLoading();
  const [error, setError] = useState(null);

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Tên cấp độ' },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (value) => (
        <Chip label={value ? 'Hoạt động' : 'Không hoạt động'} color={value ? 'success' : 'default'} size="small" />
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
        const data = await studentLevelService.getAllStudentLevels();
        setLevels(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e?.message || 'Không tải được danh sách cấp độ');
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
          Danh sách Cấp độ Học sinh
        </Typography>

        {error && (
          <Paper sx={{ p: 2, color: 'error.main', bgcolor: '#fdecea', border: '1px solid #f5c2c7' }}>
            {error}
          </Paper>
        )}

        <DataTable
          data={levels}
          columns={columns}
          loading={isLoading}
          page={0}
          rowsPerPage={levels?.length || 10}
          totalCount={levels?.length || 0}
          onPageChange={() => {}}
          onRowsPerPageChange={() => {}}
          emptyMessage="Không có dữ liệu cấp độ học sinh."
        />
      </Box>
    </>
  );
};

export default StaffStudentLevels;


