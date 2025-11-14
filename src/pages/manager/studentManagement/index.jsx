import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ManagementPageHeader from '../../../components/Management/PageHeader';
import ManagementSearchSection from '../../../components/Management/SearchSection';
import DataTable from '../../../components/Common/DataTable';
import useBaseCRUD from '../../../hooks/useBaseCRUD';
import { useApp } from '../../../contexts/AppContext';
import { useAuth } from '../../../contexts/AuthContext';
import studentService from '../../../services/student.service';
import schoolService from '../../../services/school.service';
import studentLevelService from '../../../services/studentLevel.service';
import userService from '../../../services/user.service';
import { createManagerStudentColumns } from '../../../constants/manager/student/tableColumns';
import styles from './StudentManagement.module.css';

const mapOptions = (items = [], labelKey = 'name') =>
  items
    .filter((item) => item && item.id && item[labelKey])
    .map((item) => ({
      value: item.id,
      label: item[labelKey]
    }));

const StudentManagement = () => {
  const { showGlobalError } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const branchIdRef = useRef(user?.branchId || '');
  const [parentOptions, setParentOptions] = useState([]);
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [studentLevelOptions, setStudentLevelOptions] = useState([]);
  const [dependenciesLoading, setDependenciesLoading] = useState(true);
  const [dependenciesError, setDependenciesError] = useState(null);
  const [branchInfo, setBranchInfo] = useState({
    id: user?.branchId || '',
    name: user?.branchName || ''
  });

  const studentCrud = useBaseCRUD({
    loadFunction: async (params) => {
      const pageIndex = params.page || params.pageIndex || 1;
      const pageSize = params.pageSize || params.rowsPerPage || 10;
      const keyword = params.Keyword || params.searchTerm || '';
      const resolvedBranchId =
        params.branchId ||
        branchIdRef.current ||
        user?.branchId ||
        undefined;
      return await studentService.getStudentsPaged({
        pageIndex,
        pageSize,
        name: keyword || undefined,
        branchId: resolvedBranchId,
        schoolId: params.schoolId || undefined,
        levelId: params.studentLevelId || params.levelId || undefined,
        userId: params.userId || undefined
      });
    },
    defaultFilters: {
      branchId: '',
      schoolId: '',
      studentLevelId: '',
      userId: ''
    }
  });

  useEffect(() => {
    const ensureBranch = async () => {
      if (user?.branchId) {
        setBranchInfo((prev) => ({
          id: user.branchId,
          name: user.branchName || prev.name
        }));
        branchIdRef.current = user.branchId;
        studentCrud.setFilters((prev) => ({
          ...prev,
          branchId: user.branchId
        }));
        return;
      }

      if (branchInfo.id) {
        branchIdRef.current = branchInfo.id;
        studentCrud.setFilters((prev) => ({
          ...prev,
          branchId: branchInfo.id
        }));
        return;
      }

      try {
        const currentUser = await userService.getCurrentUser();
        const managerBranchId =
          currentUser?.managerProfile?.branchId ||
          currentUser?.branchId ||
          currentUser?.managerBranchId ||
          '';
        if (managerBranchId) {
          const managerBranchName =
            currentUser?.managerProfile?.branchName ||
            currentUser?.branchName ||
            currentUser?.managerBranchName ||
            branchInfo.name;
          setBranchInfo({
            id: managerBranchId,
            name: managerBranchName
          });
          branchIdRef.current = managerBranchId;
          studentCrud.setFilters((prev) => ({
            ...prev,
            branchId: managerBranchId
          }));
        }
      } catch (error) {
        console.warn('Unable to resolve manager branch info', error);
      }
    };

    ensureBranch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.branchId, user?.branchName, branchInfo.id]);

  const columns = useMemo(() => createManagerStudentColumns(), []);

  const fetchDependencies = async () => {
    setDependenciesLoading(true);
    setDependenciesError(null);
    try {
       const [parentsResponse, schoolsResponse, studentLevelsResponse] =
        await Promise.all([
          userService.getUsersPagedByRole({
            pageIndex: 1,
            pageSize: 200,
            Role: 'User'
          }),
          schoolService.getAllSchools(),
          studentLevelService.getAllStudentLevels()
        ]);

      const parentItems = parentsResponse?.items || parentsResponse || [];
      setParentOptions(
        parentItems.map((item) => ({
          value: item.id,
          label: item.name || item.fullName || item.email || 'Không rõ tên'
        }))
      );
      setSchoolOptions(mapOptions(schoolsResponse, 'name'));
      setStudentLevelOptions(mapOptions(studentLevelsResponse, 'name'));
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || 'Không thể tải dữ liệu phụ trợ';
      setDependenciesError(message);
      showGlobalError(message);
    } finally {
      setDependenciesLoading(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderDependencyState = () => {
    if (dependenciesLoading) {
      return (
        <Box display="flex" alignItems="center" gap={1.5} className={styles.dependenciesHint}>
          <CircularProgress size={18} />
          <Typography variant="body2" color="text.secondary">
            Đang tải dữ liệu phụ trợ...
          </Typography>
        </Box>
      );
    }

    if (dependenciesError) {
      return (
        <Typography variant="body2" color="error" className={styles.dependenciesHint}>
          {dependenciesError}
        </Typography>
      );
    }

    return null;
  };

  return (
    <div className={styles.container}>
      <ManagementPageHeader
        title="Quản lý học sinh"
        createButtonText="Thêm học sinh"
        onCreateClick={() => navigate('/manager/students/create')}
      />

      {(studentCrud.error || dependenciesError) && (
        <Alert
          severity="error"
          className={styles.errorAlert}
          onClose={() => {
            studentCrud.setError(null);
            setDependenciesError(null);
          }}
        >
          {studentCrud.error || dependenciesError}
        </Alert>
      )}

      <ManagementSearchSection
        keyword={studentCrud.keyword}
        onKeywordChange={studentCrud.handleKeywordChange}
        onSearch={studentCrud.handleKeywordSearch}
        onClear={studentCrud.handleClearSearch}
        placeholder="Tìm kiếm theo tên học sinh hoặc phụ huynh..."
      >
        <Box className={styles.filterRow}>
          <FormControl size="small" className={styles.filterControl}>
            <InputLabel id="school-filter-label" shrink>
              Trường học
            </InputLabel>
            <Select
              labelId="school-filter-label"
              value={studentCrud.filters.schoolId || ''}
              label="Trường học"
              notched
              displayEmpty
              renderValue={(selected) => {
                if (!selected) {
                  return <span className={styles.filterPlaceholder}>Tất cả trường học</span>;
                }
                const option = schoolOptions.find((opt) => opt.value === selected);
                return option?.label || 'Trường học không xác định';
              }}
              onChange={(event) => studentCrud.updateFilter('schoolId', event.target.value || '')}
            >
              <MenuItem value="">
                <em>Tất cả trường học</em>
              </MenuItem>
              {schoolOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" className={styles.filterControl}>
            <InputLabel id="student-level-filter-label" shrink>
              Cấp độ
            </InputLabel>
            <Select
              labelId="student-level-filter-label"
              value={studentCrud.filters.studentLevelId || ''}
              label="Cấp độ"
              notched
              displayEmpty
              renderValue={(selected) => {
                if (!selected) {
                  return <span className={styles.filterPlaceholder}>Tất cả cấp độ</span>;
                }
                const option = studentLevelOptions.find((opt) => opt.value === selected);
                return option?.label || 'Cấp độ không xác định';
              }}
              onChange={(event) =>
                studentCrud.updateFilter('studentLevelId', event.target.value || '')
              }
            >
              <MenuItem value="">
                <em>Tất cả cấp độ</em>
              </MenuItem>
              {studentLevelOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {renderDependencyState()}
      </ManagementSearchSection>

      <div className={styles.tableContainer}>
        <DataTable
          data={studentCrud.data}
          columns={columns}
          loading={studentCrud.isPageLoading}
          page={studentCrud.page}
          rowsPerPage={studentCrud.rowsPerPage}
          totalCount={studentCrud.totalCount}
          onPageChange={studentCrud.handlePageChange}
          onRowsPerPageChange={studentCrud.handleRowsPerPageChange}
          onEdit={(item) => navigate(`/manager/students/update/${item.id}`)}
          showActions
          emptyMessage="Chưa có học sinh nào. Hãy thêm học sinh đầu tiên để bắt đầu."
        />
      </div>
    </div>
  );
};

export default StudentManagement;


