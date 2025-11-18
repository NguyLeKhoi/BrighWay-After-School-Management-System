import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Avatar, Chip, CircularProgress, Alert, Typography, Button, Paper, IconButton } from '@mui/material';
import {
  Person as PersonIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  LocalHospital as MedicalIcon,
  CheckCircle as VerifiedIcon,
  Pending as PendingIcon,
  Add as AddIcon,
  Description as DocumentIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import studentService from '../../../../services/student.service';
import { useApp } from '../../../../contexts/AppContext';
import ManagementFormDialog from '../../../../components/Management/FormDialog';
import Form from '../../../../components/Common/Form';
import { addDocumentSchema } from '../../../../utils/validationSchemas/documentSchemas';
import styles from './ChildProfile.module.css';

const getInitials = (name = '') => {
  if (!name) return 'ST';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatDate = (value) => {
  if (!value) return 'Chưa có';
  try {
    return new Date(value).toLocaleDateString('vi-VN');
  } catch (error) {
    return 'Chưa có';
  }
};

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  try {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  } catch (error) {
    return null;
  }
};

const ChildProfile = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const { showGlobalError } = useApp();
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAddDocumentDialog, setOpenAddDocumentDialog] = useState(false);

  useEffect(() => {
    const fetchChild = async () => {
      if (!childId) {
        navigate('/family/children');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await studentService.getMyChildById(childId);
        setChild(data);
      } catch (err) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Không thể tải thông tin học sinh';
        setError(errorMessage);
        showGlobalError(errorMessage);
        console.error('Error fetching child:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChild();
  }, [childId, navigate, showGlobalError]);

  const handleBack = () => {
    navigate('/family/children');
  };

  const handleAddDocumentSuccess = () => {
    // Reload child data to get updated documents
    const fetchChild = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await studentService.getMyChildById(childId);
        setChild(data);
      } catch (err) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Không thể tải thông tin học sinh';
        setError(errorMessage);
        showGlobalError(errorMessage);
        console.error('Error fetching child:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChild();
  };

  const [actionLoading, setActionLoading] = useState(false);

  const DOCUMENT_TYPE_OPTIONS = [
    { value: 'BirthCertificate', label: 'Giấy khai sinh' },
    { value: 'HouseholdBook', label: 'Sổ hộ khẩu' },
    { value: 'GuardianCertificate', label: 'Giấy chứng nhận người giám hộ' },
    { value: 'AuthorizationLetter', label: 'Giấy ủy quyền' },
    { value: 'AdoptionCertificate', label: 'Giấy chứng nhận nhận nuôi' },
    { value: 'DivorceCustodyDecision', label: 'Quyết định quyền nuôi con sau ly hôn' },
    { value: 'StudentCard', label: 'Thẻ học sinh' },
    { value: 'SchoolEnrollmentConfirmation', label: 'Xác nhận nhập học' },
    { value: 'AcademicRecordBook', label: 'Sổ học bạ' },
    { value: 'VnEduScreenshot', label: 'Ảnh chụp màn hình VnEdu' },
    { value: 'TuitionReceipt', label: 'Biên lai học phí' },
    { value: 'CertificateOrLetter', label: 'Giấy chứng nhận/Thư xác nhận' },
    { value: 'Other', label: 'Khác' }
  ];

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

  const documentFields = [
    {
      section: 'Thông tin tài liệu',
      sectionDescription: 'Điền thông tin và tải lên file tài liệu xác minh cho con bạn.',
      name: 'type',
      label: 'Loại tài liệu',
      type: 'select',
      required: true,
      options: DOCUMENT_TYPE_OPTIONS,
      placeholder: 'Chọn loại tài liệu',
      gridSize: 6
    },
    {
      name: 'issuedBy',
      label: 'Nơi cấp',
      type: 'text',
      placeholder: 'Ví dụ: UBND Quận 1, TP.HCM',
      gridSize: 6
    },
    {
      name: 'issuedDate',
      label: 'Ngày cấp',
      type: 'date',
      gridSize: 6
    },
    {
      name: 'expirationDate',
      label: 'Ngày hết hạn (nếu có)',
      type: 'date',
      gridSize: 6
    },
    {
      name: 'file',
      label: 'File tài liệu',
      type: 'file',
      accept: 'image/*,.pdf',
      required: true,
      gridSize: 12,
      helperText: 'Chấp nhận file ảnh (JPG, PNG) hoặc PDF'
    }
  ];

  const handleDocumentSubmit = async (formValues) => {
    if (!childId) {
      toast.error('Không tìm thấy thông tin học sinh');
      return;
    }

    setActionLoading(true);
    try {
      // Helper function to format date to ISO string for backend
      const formatDateForAPI = (dateValue) => {
        if (!dateValue) return null;
        
        // If already ISO string, return as is
        if (typeof dateValue === 'string' && dateValue.includes('T')) {
          return dateValue;
        }
        
        // If in YYYY-MM-DD format (from date input), convert to ISO
        if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
          return new Date(dateValue + 'T00:00:00').toISOString();
        }
        
        // If Date object, convert to ISO
        if (dateValue instanceof Date) {
          return dateValue.toISOString();
        }
        
        // Try to parse as Date
        try {
          const date = new Date(dateValue);
          if (!isNaN(date.getTime())) {
            return date.toISOString();
          }
        } catch {
          return null;
        }
        
        return null;
      };

      // Create FormData for multipart/form-data
      const formData = new FormData();
      
      formData.append('Type', formValues.type);
      if (formValues.issuedBy) {
        formData.append('IssuedBy', formValues.issuedBy);
      }
      if (formValues.issuedDate) {
        const formattedDate = formatDateForAPI(formValues.issuedDate);
        if (formattedDate) {
          formData.append('IssuedDate', formattedDate);
        }
      }
      if (formValues.expirationDate) {
        const formattedDate = formatDateForAPI(formValues.expirationDate);
        if (formattedDate) {
          formData.append('ExpirationDate', formattedDate);
        }
      }
      if (formValues.file) {
        formData.append('File', formValues.file);
      }

      await studentService.addDocument(childId, formData);
      toast.success('Thêm tài liệu thành công!', {
        position: 'top-right',
        autoClose: 3000
      });
      
      handleAddDocumentSuccess();
      setOpenAddDocumentDialog(false);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Không thể thêm tài liệu';
      toast.error(message, { position: 'top-right', autoClose: 4000 });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.profilePage}>
        <div className={styles.container}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
            <CircularProgress />
          </Box>
        </div>
      </div>
    );
  }

  if (error || !child) {
    return (
      <div className={styles.profilePage}>
        <div className={styles.container}>
          <div className={styles.header}>
            <button className={styles.backButton} onClick={handleBack}>
              ← Quay lại
            </button>
          </div>
          <Alert severity="error" sx={{ mt: 2 }}>
            {error || 'Không tìm thấy thông tin học sinh'}
          </Alert>
        </div>
      </div>
    );
  }

  const age = calculateAge(child.dateOfBirth);
  const studentLevelName = child.studentLevelName || child.studentLevel?.name || 'Chưa xác định';
  const schoolName = child.schoolName || child.school?.name || 'Chưa có';
  const branchName = child.branchName || child.branch?.branchName || 'Chưa có';
  const userName = child.userName || child.user?.name || 'Chưa có';

  return (
    <div className={styles.profilePage}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <button className={styles.backButton} onClick={handleBack}>
            ← Quay lại
          </button>
          <h1 className={styles.title}>Thông tin học sinh</h1>
          <Box />
        </div>

        {/* Profile Content */}
        <div className={styles.profileContent}>
          {/* Basic Information Card */}
          <div className={styles.profileCard}>
            <Box display="flex" alignItems="center" gap={3} mb={3}>
              <Avatar
                src={child.image && child.image !== 'string' ? child.image : undefined}
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: 'primary.main',
                  fontSize: '2.5rem',
                  fontWeight: 'bold'
                }}
              >
                {getInitials(child.name)}
              </Avatar>
              <Box flex={1}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {child.name || 'Chưa có tên'}
                </Typography>
                <Box display="flex" gap={1} alignItems="center" flexWrap="wrap" mt={1}>
                  <Chip
                    icon={child.status ? <VerifiedIcon /> : <PendingIcon />}
                    label={child.status ? 'Đã duyệt' : 'Chờ duyệt'}
                    color={child.status ? 'success' : 'warning'}
                    size="small"
                  />
                  {studentLevelName && studentLevelName !== 'Chưa xác định' && (
                    <Chip
                      label={studentLevelName}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  )}
                </Box>
              </Box>
            </Box>

            <div className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <CalendarIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle' }} />
                    Ngày sinh
                  </label>
                  <div className={styles.fieldValue}>
                    {child.dateOfBirth ? formatDate(child.dateOfBirth) : 'Chưa có'}
                    {age && <span style={{ color: '#666', marginLeft: '8px' }}>({age} tuổi)</span>}
                    </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <PersonIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle' }} />
                    Phụ huynh
                  </label>
                  <div className={styles.fieldValue}>
                    {userName}
                    </div>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <SchoolIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle' }} />
                    Trường học
                  </label>
                  <div className={styles.fieldValue}>
                    {schoolName}
                    </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <BusinessIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle' }} />
                    Chi nhánh
                  </label>
                  <div className={styles.fieldValue}>
                    {branchName}
                    </div>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <SchoolIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle' }} />
                    Cấp độ học sinh
                  </label>
                  <div className={styles.fieldValue}>
                    {studentLevelName}
                    </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <CalendarIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle' }} />
                    Ngày tham gia
                  </label>
                  <div className={styles.fieldValue}>
                    {child.createdTime ? formatDate(child.createdTime) : 'Chưa có'}
                    </div>
                </div>
              </div>

              {child.note && child.note !== 'string' && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Ghi chú</label>
                  <div className={styles.fieldValue} style={{ minHeight: '60px', whiteSpace: 'pre-wrap' }}>
                    {child.note}
                </div>
                    </div>
                  )}
                </div>
              </div>

          {/* Documents Card */}
          <div className={styles.profileCard}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Thông tin chi tiết
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setOpenAddDocumentDialog(true)}
                sx={{ textTransform: 'none' }}
              >
                Thêm tài liệu
              </Button>
            </Box>
            <div className={styles.form}>
              {child.documents && child.documents.length > 0 ? (
                <Box>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <DocumentIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Tài liệu xác minh ({child.documents.length})
                    </Typography>
                  </Box>
                  <Box display="flex" flexDirection="column" gap={2}>
                    {child.documents.map((doc, index) => (
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
              ) : (
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <MedicalIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle' }} />
                    Tài liệu xác minh
                  </label>
                  <div className={styles.fieldValue} style={{ color: '#666' }}>
                    Chưa có tài liệu xác minh
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Add Document Dialog */}
          <ManagementFormDialog
            open={openAddDocumentDialog}
            onClose={() => !actionLoading && setOpenAddDocumentDialog(false)}
            mode="create"
            title="Tài Liệu Xác Minh"
            icon={AddIcon}
            loading={actionLoading}
            maxWidth="md"
          >
            <Form
              schema={addDocumentSchema}
              defaultValues={{
                type: '',
                issuedBy: '',
                issuedDate: '',
                expirationDate: '',
                file: null
              }}
              onSubmit={handleDocumentSubmit}
              submitText="Thêm Tài Liệu"
              loading={actionLoading}
              disabled={actionLoading}
              fields={documentFields}
            />
          </ManagementFormDialog>
        </div>
      </div>
    </div>
  );
};

export default ChildProfile;
