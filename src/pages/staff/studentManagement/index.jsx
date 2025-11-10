import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Paper,
  Alert
} from '@mui/material';
import {
  School as SchoolIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import DataTable from '../../../components/Common/DataTable';
import studentService from '../../../services/student.service';
import { useApp } from '../../../contexts/AppContext';
import { useLoading } from '../../../hooks/useLoading';
import Loading from '../../../components/Common/Loading';
import { createStaffStudentColumns } from '../../../constants/staff/studentManagement/tableColumns';
import { toast } from 'react-toastify';
import styles from './studentManagement.module.css';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [keyword, setKeyword] = useState('');

  // Global state
  const { showGlobalError } = useApp();
  const { isLoading, showLoading, hideLoading } = useLoading();

  const columns = useMemo(() => createStaffStudentColumns(), []);

  // Load students
  const loadStudents = async () => {
    showLoading();
    setError(null);
    try {
      const response = await studentService.getAllStudents();
      
      // Filter by keyword if provided
      let filteredStudents = response;
      if (keyword.trim()) {
        const searchLower = keyword.toLowerCase().trim();
        filteredStudents = response.filter(student => 
          student.name?.toLowerCase().includes(searchLower) ||
          student.userName?.toLowerCase().includes(searchLower) ||
          student.branchName?.toLowerCase().includes(searchLower) ||
          student.schoolName?.toLowerCase().includes(searchLower) ||
          student.studentLevelName?.toLowerCase().includes(searchLower)
        );
      }
      
      setStudents(filteredStudents);
      setTotalCount(filteredStudents.length);
    } catch (err) {
      const errorMessage = err.message || 'Có lỗi xảy ra khi tải danh sách học sinh';
      setError(errorMessage);
      showGlobalError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      hideLoading();
    }
  };

  // Load students when component mounts
  useEffect(() => {
    loadStudents();
  }, []);

  // Handle search
  const handleKeywordChange = (e) => {
    setKeyword(e.target.value);
  };

  const handleSearch = () => {
    setPage(0);
    loadStudents();
  };

  // Pagination
  const paginatedStudents = students.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      {isLoading && <Loading />}
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <Typography variant="h4" className={styles.title}>
            Quản Lý Học Sinh
          </Typography>
        </div>

        {/* Search Section */}
        <Paper className={styles.searchSection}>
          <div className={styles.searchContainer}>
            <TextField
              placeholder="Tìm kiếm theo tên, phụ huynh, chi nhánh, trường học..."
              value={keyword}
              onChange={handleKeywordChange}
              className={styles.searchField}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              className={styles.searchButton}
              startIcon={<SearchIcon />}
            >
              Tìm kiếm
            </Button>
          </div>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" className={styles.errorAlert} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Info Card */}
        <Paper className={styles.infoCard}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <SchoolIcon color="primary" />
            <Typography variant="h6">
              Tổng số học sinh: {totalCount}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Danh sách tất cả học sinh trong hệ thống. Bạn có thể tìm kiếm theo tên, phụ huynh, chi nhánh hoặc trường học.
          </Typography>
        </Paper>

        {/* Table */}
        <div className={styles.tableContainer}>
          <DataTable
            data={paginatedStudents}
            columns={columns}
            loading={isLoading}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={totalCount}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            emptyMessage="Không có học sinh nào. Hãy thêm học sinh đầu tiên để bắt đầu."
          />
        </div>
      </div>
    </>
  );
};

export default StudentManagement;

