import React, { memo, useCallback, useMemo } from 'react';
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
  CircularProgress,
  Box
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  page = 0,
  rowsPerPage = 10,
  totalCount = 0,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  emptyMessage = "Không có dữ liệu",
  showActions = true,
  expandableConfig = null
}) => {
  const [expandedRows, setExpandedRows] = React.useState({});

  const isRowExpandable = expandableConfig?.isRowExpandable;
  const renderExpandedContent = expandableConfig?.renderExpandedContent;

  const toggleRow = useCallback((rowId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId]
    }));
  }, []);

  const handleEdit = useCallback((item) => {
    if (onEdit) {
      onEdit(item);
    }
  }, [onEdit]);

  const handleDelete = useCallback((item) => {
    if (onDelete) {
      onDelete(item);
    }
  }, [onDelete]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', width: '100%' }}>
        <Typography variant="h6" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflowX: 'auto' }}>
      <TableContainer sx={{ minWidth: 650 }}>
        <Table sx={{ tableLayout: 'auto' }}>
          <TableHead>
            <TableRow>
              {expandableConfig && (
                <TableCell padding="checkbox" />
              )}
              {columns.map((column) => (
                <TableCell key={column.key} align={column.align || 'left'}>
                  {column.header}
                </TableCell>
              ))}
              {showActions && (
                <TableCell align="center">Thao tác</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item, index) => {
              const rowId = item.id || index;
              const expandable = Boolean(
                expandableConfig && (!isRowExpandable || isRowExpandable(item))
              );
              const isExpanded = expandedRows[rowId] || false;

              return (
                <React.Fragment key={rowId}>
                  <TableRow hover>
                    {expandable && (
                      <TableCell padding="checkbox">
                        <IconButton
                          size="small"
                          onClick={() => toggleRow(rowId)}
                          aria-label={isExpanded ? 'Thu gọn' : 'Mở rộng'}
                        >
                          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </TableCell>
                    )}
                    {!expandable && expandableConfig && <TableCell padding="checkbox" />}
                    {columns.map((column) => (
                      <TableCell key={column.key} align={column.align || 'left'}>
                        {column.render ? column.render(item[column.key], item) : item[column.key]}
                      </TableCell>
                    ))}
                    {showActions && (
                      <TableCell align="center">
                        <Box display="flex" gap={1} justifyContent="center">
                          {onEdit && (
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEdit(item)}
                              title="Xem chi tiết"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          )}
                          {onDelete && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(item)}
                              title="Xóa"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                  {expandable && isExpanded && renderExpandedContent && (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length + (showActions ? 1 : 0) + 1}
                        sx={{ backgroundColor: 'var(--bg-secondary)', p: 2 }}
                      >
                        {renderExpandedContent(item)}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
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

// Memoize DataTable to prevent unnecessary re-renders when parent re-renders
export default memo(DataTable);
