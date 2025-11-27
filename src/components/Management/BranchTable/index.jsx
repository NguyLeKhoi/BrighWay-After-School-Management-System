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
import BranchExpandedRowContent from '../BranchExpandedRowContent';

const BranchTable = ({
  branches,
  columns,
  expandedRows,
  rowBenefits,
  rowSchools,
  rowStudentLevels,
  isPageLoading,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  actionLoading,
  onRemoveBenefit,
  onRemoveSchool,
  onRemoveStudentLevel
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
              <React.Fragment key={branch.id || index}>
                <TableRow hover>
                  {columns.map((column) => (
                    <TableCell key={column.key} align={column.align || 'left'}>
                      {column.render ? column.render(branch[column.key], branch) : branch[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
                {expandedRows.has(branch.id) && (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      sx={{
                        backgroundColor: 'grey.50',
                        p: 0,
                        borderBottom: 'none'
                      }}
                    >
                      <BranchExpandedRowContent
                        branch={branch}
                        rowBenefits={rowBenefits}
                        rowSchools={rowSchools}
                        rowStudentLevels={rowStudentLevels}
                        actionLoading={actionLoading}
                        onRemoveBenefit={onRemoveBenefit}
                        onRemoveSchool={onRemoveSchool}
                        onRemoveStudentLevel={onRemoveStudentLevel}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
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

