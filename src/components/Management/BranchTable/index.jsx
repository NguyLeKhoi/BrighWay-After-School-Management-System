import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress
} from '@mui/material';

const BranchTable = ({
  branches,
  columns,
  isPageLoading,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange
}) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.key} align={column.align || 'left'}>
                {column.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {isPageLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center">
                <CircularProgress />
              </TableCell>
            </TableRow>
          ) : !branches || branches.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center">
                <Typography variant="h6" color="text.secondary">
                  Không có chi nhánh nào. Hãy thêm chi nhánh đầu tiên để bắt đầu.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            branches.map((branch, index) => (
              <TableRow key={branch.id || index} hover>
                {columns.map((column) => (
                  <TableCell key={column.key} align={column.align || 'left'}>
                    {column.render ? column.render(branch[column.key], branch) : branch[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Số dòng mỗi trang:"
      />
    </TableContainer>
  );
};

export default BranchTable;

