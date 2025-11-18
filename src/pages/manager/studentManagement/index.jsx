import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Chip,
  Divider,
  Grid
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  School as SchoolIcon,
  VerifiedUser as VerifiedIcon,
  Pending as PendingIcon,
  Description as DocumentIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ManagementPageHeader from '../../../components/Management/PageHeader';
import ManagementSearchSection from '../../../components/Management/SearchSection';
import DataTable from '../../../components/Common/DataTable';
import ConfirmDialog from '../../../components/Common/ConfirmDialog';
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
  const [activeTab, setActiveTab] = useState(0); // 0 = Approved, 1 = Unverified
  const [parentOptions, setParentOptions] = useState([]);
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [studentLevelOptions, setStudentLevelOptions] = useState([]);
  const [dependenciesLoading, setDependenciesLoading] = useState(true);
  const [dependenciesError, setDependenciesError] = useState(null);
  const [branchInfo, setBranchInfo] = useState({
    id: user?.branchId || '',
    name: user?.branchName || ''
  });
  
  // Unverified students state
  const [unverifiedStudents, setUnverifiedStudents] = useState([]);
  const [loadingUnverified, setLoadingUnverified] = useState(false);
  const [approvingStudentId, setApprovingStudentId] = useState(null);
  const [approveConfirmDialog, setApproveConfirmDialog] = useState({
    open: false,
    student: null
  });
  
  // Detail dialog state
  const [detailDialog, setDetailDialog] = useState({
    open: false,
    student: null,
    loading: false
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
        userId: params.userId || undefined,
        isApproved: true // Only load approved students
      });
    },
    defaultFilters: {
      branchId: '',
      schoolId: '',
      studentLevelId: '',
      userId: ''
    },
    loadOnMount: false // Don't auto-load, we'll load when tab is active
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
  
  // Handle approve click
  const handleApproveClick = useCallback((student) => {
    setApproveConfirmDialog({
      open: true,
      student
    });
  }, []);
  
  // Handle view detail
  const handleViewDetail = useCallback(async (student) => {
    setDetailDialog({
      open: true,
      student: null,
      loading: true
    });
    
    try {
      // Fetch full student details
      const fullStudent = await studentService.getStudentById(student.id);
      setDetailDialog({
        open: true,
        student: fullStudent,
        loading: false
      });
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Không thể tải thông tin chi tiết';
      toast.error(errorMessage);
      setDetailDialog({
        open: false,
        student: null,
        loading: false
      });
    }
  }, []);
  
  // Columns for unverified students (with view detail button only)
  const unverifiedColumns = useMemo(() => {
    const baseColumns = createManagerStudentColumns();
    return [
      ...baseColumns,
      {
        key: 'actions',
        header: 'Thao Tác',
        align: 'center',
        render: (_, item) => (
          <Box display="flex" gap={0.5} justifyContent="center">
            <Tooltip title="Xem chi tiết">
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleViewDetail(item)}
              >
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )
      }
    ];
  }, [handleViewDetail]);
  
  // Columns for approved students (with view detail button)
  const approvedColumns = useMemo(() => {
    const baseColumns = createManagerStudentColumns();
    return [
      ...baseColumns,
      {
        key: 'actions',
        header: 'Thao Tác',
        align: 'center',
        render: (_, item) => (
          <Box display="flex" gap={0.5} justifyContent="center">
            <Tooltip title="Xem chi tiết">
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleViewDetail(item)}
              >
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )
      }
    ];
  }, [handleViewDetail]);

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

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 0) {
      // Load approved students
      studentCrud.loadData();
    } else if (activeTab === 1) {
      // Load unverified students
      loadUnverifiedStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Load unverified students
  const loadUnverifiedStudents = useCallback(async () => {
    setLoadingUnverified(true);
    try {
      const response = await studentService.getUnverifiedStudents();
      // Handle both array and object responses
      const students = Array.isArray(response) ? response : (response.items || []);
      setUnverifiedStudents(students);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Không thể tải danh sách học sinh chưa duyệt';
      setDependenciesError(errorMessage);
      showGlobalError(errorMessage);
      setUnverifiedStudents([]);
    } finally {
      setLoadingUnverified(false);
    }
  }, [showGlobalError]);

  // Handle approve confirm
  const handleApproveConfirm = useCallback(async () => {
    if (!approveConfirmDialog.student) return;
    
    const studentId = approveConfirmDialog.student.id;
    setApprovingStudentId(studentId);
    
    try {
      await studentService.approveStudent(studentId);
      toast.success(`Đã duyệt học sinh "${approveConfirmDialog.student.name}" thành công!`);
      
      // Remove from unverified list
      setUnverifiedStudents(prev => prev.filter(s => s.id !== studentId));
      
      // Close detail dialog if open
      setDetailDialog({ open: false, student: null, loading: false });
      
      // Reload approved students
      if (activeTab === 0) {
        studentCrud.loadData(false);
      }
      
      setApproveConfirmDialog({ open: false, student: null });
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi duyệt học sinh';
      toast.error(errorMessage);
      showGlobalError(errorMessage);
    } finally {
      setApprovingStudentId(null);
    }
  }, [approveConfirmDialog, activeTab, studentCrud, showGlobalError]);
  
  // Handle approve from detail dialog
  const handleApproveFromDetail = useCallback(() => {
    if (detailDialog.student) {
      setApproveConfirmDialog({
        open: true,
        student: detailDialog.student
      });
    }
  }, [detailDialog.student]);
  
  // Helper functions for detail dialog
  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };
  
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  
  const getInitials = (name) => {
    if (!name) return 'H';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };
  
  // Document type mapping
  const getDocumentTypeLabel = (type) => {
    const typeMap = {
      'BirthCertificate': 'Giấy khai sinh',
      'HouseholdBook': 'Sổ hộ khẩu',
      'GuardianCertificate': 'Giấy chứng nhận người giám hộ',
      'AuthorizationLetter': 'Giấy ủy quyền',
      'AdoptionCertificate': 'Giấy chứng nhận nhận nuôi',
      'DivorceCustodyDecision': 'Quyết định quyền nuôi con sau ly hôn',
      'StudentCard': 'Thẻ học sinh',
      'SchoolEnrollmentConfirmation': 'Xác nhận nhập học',
      'AcademicRecordBook': 'Sổ học bạ',
      'VnEduScreenshot': 'Ảnh chụp màn hình VnEdu',
      'TuitionReceipt': 'Biên lai học phí',
      'CertificateOrLetter': 'Giấy chứng nhận/Thư xác nhận',
      'Other': 'Khác'
    };
    return typeMap[type] || type || 'Không xác định';
  };

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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <div className={styles.container}>
      <ManagementPageHeader
        title="Quản lý học sinh"
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

      {/* Tabs */}
      <Paper 
        sx={{ 
          mb: 3,
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}
      >
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '15px',
              fontWeight: 500,
              minHeight: 64,
              padding: '12px 24px',
              color: 'text.secondary',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                color: 'primary.main'
              },
              '&.Mui-selected': {
                color: 'primary.main',
                fontWeight: 600
              }
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              backgroundColor: '#1976d2'
            }
          }}
        >
          <Tab label="Học Sinh Đã Duyệt" />
          <Tab label="Học Sinh Chưa Duyệt" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <>
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
              columns={approvedColumns}
          loading={studentCrud.isPageLoading}
          page={studentCrud.page}
          rowsPerPage={studentCrud.rowsPerPage}
          totalCount={studentCrud.totalCount}
          onPageChange={studentCrud.handlePageChange}
          onRowsPerPageChange={studentCrud.handleRowsPerPageChange}
              showActions={false}
              emptyMessage="Chưa có học sinh nào đã được duyệt."
            />
          </div>
        </>
      )}

      {activeTab === 1 && (
        <div className={styles.tableContainer}>
          <DataTable
            data={unverifiedStudents}
            columns={unverifiedColumns}
            loading={loadingUnverified}
            page={0}
            rowsPerPage={unverifiedStudents.length || 10}
            totalCount={unverifiedStudents.length}
            onPageChange={() => {}}
            onRowsPerPageChange={() => {}}
            showActions={false}
            emptyMessage="Không có học sinh nào chưa được duyệt."
        />
      </div>
      )}

      {/* Detail Dialog */}
      <Dialog
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, student: null, loading: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight="bold">
              Chi tiết học sinh
            </Typography>
            <IconButton
              size="small"
              onClick={() => setDetailDialog({ open: false, student: null, loading: false })}
            >
              ×
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {detailDialog.loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
              <CircularProgress />
            </Box>
          ) : detailDialog.student ? (
            <Box>
              {/* Header with Avatar and Name */}
              <Box display="flex" alignItems="center" gap={3} mb={3}>
                <Avatar
                  src={detailDialog.student.image && detailDialog.student.image !== 'string' ? detailDialog.student.image : undefined}
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'primary.main',
                    fontSize: '2rem',
                    fontWeight: 'bold'
                  }}
                >
                  {getInitials(detailDialog.student.name)}
                </Avatar>
                <Box flex={1}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {detailDialog.student.name || 'Chưa có tên'}
                  </Typography>
                  <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
                    <Chip
                      icon={detailDialog.student.status ? <VerifiedIcon /> : <PendingIcon />}
                      label={detailDialog.student.status ? 'Đã duyệt' : 'Chờ duyệt'}
                      color={detailDialog.student.status ? 'success' : 'warning'}
                      size="small"
                    />
                    {detailDialog.student.studentLevelName && (
                      <Chip
                        label={detailDialog.student.studentLevelName}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    )}
                  </Box>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Student Information */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box mb={2}>
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                      <CalendarIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                      Ngày sinh
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(detailDialog.student.dateOfBirth)}
                      {detailDialog.student.dateOfBirth && (
                        <span style={{ color: '#666', marginLeft: '8px' }}>
                          ({calculateAge(detailDialog.student.dateOfBirth)} tuổi)
                        </span>
                      )}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box mb={2}>
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                      <PersonIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                      Phụ huynh
                    </Typography>
                    <Typography variant="body1">
                      {detailDialog.student.userName || detailDialog.student.user?.name || 'Chưa có'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box mb={2}>
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                      <SchoolIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                      Trường học
                    </Typography>
                    <Typography variant="body1">
                      {detailDialog.student.schoolName || detailDialog.student.school?.name || 'Chưa có'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box mb={2}>
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                      <BusinessIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                      Chi nhánh
                    </Typography>
                    <Typography variant="body1">
                      {detailDialog.student.branchName || detailDialog.student.branch?.branchName || 'Chưa có'}
                    </Typography>
                  </Box>
                </Grid>
                
                {detailDialog.student.studentLevelName && (
                  <Grid item xs={12} sm={6}>
                    <Box mb={2}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        Cấp độ học sinh
                      </Typography>
                      <Typography variant="body1">
                        {detailDialog.student.studentLevelName}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                
                <Grid item xs={12} sm={6}>
                  <Box mb={2}>
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                      Ngày tạo
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(detailDialog.student.createdTime)}
                    </Typography>
                  </Box>
                </Grid>
                
                {detailDialog.student.note && detailDialog.student.note !== 'string' && (
                  <Grid item xs={12}>
                    <Box mb={2}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        Ghi chú
                      </Typography>
                      <Typography variant="body1">
                        {detailDialog.student.note}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
              
              {/* Documents Section */}
              {detailDialog.student.documents && detailDialog.student.documents.length > 0 && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Box>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <DocumentIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                      <Typography variant="h6" fontWeight="bold">
                        Tài liệu xác minh ({detailDialog.student.documents.length})
                      </Typography>
                    </Box>
                    <Box display="flex" flexDirection="column" gap={2}>
                      {detailDialog.student.documents.map((doc, index) => (
                        <Paper
                          key={doc.id || index}
                          elevation={0}
                          sx={{
                            p: 2.5,
                            border: '1px solid',
                            borderColor: doc.verified ? 'success.light' : 'divider',
                            borderRadius: 2,
                            bgcolor: doc.verified ? 'success.50' : 'grey.50',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              boxShadow: 2,
                              borderColor: doc.verified ? 'success.main' : 'primary.light'
                            }
                          }}
                        >
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                            <Box flex={1}>
                              <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                                <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                                  {getDocumentTypeLabel(doc.type)}
                                </Typography>
                                <Chip
                                  icon={doc.verified ? <VerifiedIcon /> : <PendingIcon />}
                                  label={doc.verified ? 'Đã xác minh' : 'Chờ xác minh'}
                                  color={doc.verified ? 'success' : 'default'}
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>
                              
                              <Box display="flex" flexDirection="column" gap={1}>
                                {doc.issuedBy && (
                                  <Box display="flex" alignItems="flex-start" gap={1}>
                                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                                      <strong>Nơi cấp:</strong>
                                    </Typography>
                                    <Typography variant="body2" color="text.primary">
                                      {doc.issuedBy}
                                    </Typography>
                                  </Box>
                                )}
                                
                                <Box display="flex" gap={3} flexWrap="wrap">
                                  {doc.issuedDate && (
                                    <Box display="flex" alignItems="flex-start" gap={1}>
                                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                                        <strong>Ngày cấp:</strong>
                                      </Typography>
                                      <Typography variant="body2" color="text.primary">
                                        {formatDate(doc.issuedDate)}
                                      </Typography>
                                    </Box>
                                  )}
                                  {doc.expirationDate && (
                                    <Box display="flex" alignItems="flex-start" gap={1}>
                                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                                        <strong>Ngày hết hạn:</strong>
                                      </Typography>
                                      <Typography variant="body2" color="text.primary">
                                        {formatDate(doc.expirationDate)}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              </Box>
                            </Box>
                            
                            {doc.documentImageUrl && doc.documentImageUrl !== 'string' && (
                              <IconButton
                                size="small"
                                onClick={() => window.open(doc.documentImageUrl, '_blank')}
                                sx={{ 
                                  ml: 1,
                                  color: 'primary.main',
                                  '&:hover': {
                                    bgcolor: 'primary.50'
                                  }
                                }}
                                title="Xem tài liệu"
                              >
                                <OpenInNewIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDetailDialog({ open: false, student: null, loading: false })}
          >
            Đóng
          </Button>
          {detailDialog.student && !detailDialog.student.status && (
            <Button
              variant="contained"
              color="success"
              startIcon={<ApproveIcon />}
              onClick={handleApproveFromDetail}
              disabled={approvingStudentId === detailDialog.student?.id}
            >
              Chấp nhận
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Approve Confirm Dialog */}
      <ConfirmDialog
        open={approveConfirmDialog.open}
        onClose={() => setApproveConfirmDialog({ open: false, student: null })}
        onConfirm={handleApproveConfirm}
        title="Xác nhận duyệt học sinh"
        description={
          approveConfirmDialog.student
            ? `Bạn có chắc chắn muốn duyệt học sinh "${approveConfirmDialog.student.name}"? Học sinh này sẽ được chuyển sang danh sách đã duyệt.`
            : ''
        }
        confirmText="Duyệt"
        cancelText="Hủy"
        confirmColor="success"
      />
    </div>
  );
};

export default StudentManagement;


