import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Typography,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const RoleTable = ({
  roles = [],
  loading = false,
  page = 0,
  rowsPerPage = 10,
  totalCount = 0,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete
}) => {
  const getRoleColor = (roleName) => {
    switch (roleName.toLowerCase()) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      case 'teacher': return 'success';
      case 'staff': return 'info';
      case 'parent': return 'primary';
      case 'student': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên Role</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Normalized Name</TableCell>
              <TableCell>ID</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id} hover>
                  <TableCell>
                    <Chip 
                      label={role.name} 
                      color={getRoleColor(role.name)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{role.description || '-'}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {role.normalizedName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                      {role.id.substring(0, 8)}...
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      size="small" 
                      onClick={() => onEdit?.(role)}
                      color="primary"
                      disabled={loading}
                      title="Chỉnh sửa role"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => onDelete?.(role)}
                      color="error"
                      disabled={loading}
                      title="Xóa role"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        labelRowsPerPage="Số dòng mỗi trang:"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} của ${count !== -1 ? count : `nhiều hơn ${to}`}`
        }
      />
    </Paper>
  );
};

export default RoleTable;