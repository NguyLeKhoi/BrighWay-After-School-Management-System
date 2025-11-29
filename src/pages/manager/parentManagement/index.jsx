import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import DataTable from '../../../components/Common/DataTable';
import Form from '../../../components/Common/Form';
import ManagementPageHeader from '../../../components/Management/PageHeader';
import ManagementSearchSection from '../../../components/Management/SearchSection';
import ManagementFormDialog from '../../../components/Management/FormDialog';
import ContentLoading from '../../../components/Common/ContentLoading';
import { useApp } from '../../../contexts/AppContext';
import { useAuth } from '../../../contexts/AuthContext';
import useBaseCRUD from '../../../hooks/useBaseCRUD';
import { createStaffAndParentColumns } from '../../../definitions/manager/staff/tableColumns';
import userService from '../../../services/user.service';
import { toast } from 'react-toastify';
import styles from '../staffAndParentManagement/staffAndParentManagement.module.css';

const ParentManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isInitialMount = useRef(true);
  
  // Parent CRUD - memoize loadFunction to prevent unnecessary re-renders
  const loadParentFunction = useCallback(async (params) => {
    return await userService.getUsersPagedByRole({
      pageIndex: params.pageIndex,
      pageSize: params.pageSize,
      Role: 'User',
      Keyword: params.Keyword || params.searchTerm || ''
    });
  }, []);

  const parentCrud = useBaseCRUD({
    loadFunction: loadParentFunction,
    loadOnMount: true
  });

  // Reload data when navigate back to this page (e.g., from create pages)
  useEffect(() => {
    if (location.pathname === '/manager/parents') {
      // Skip first mount to avoid double loading
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }
      
      // Only reload if we're actually navigating back (not just re-rendering)
      // Use a ref to track if we've already reloaded for this pathname
      const timeoutId = setTimeout(() => {
        parentCrud.loadData(false);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
  
  // Common state
  const [error, setError] = useState(null);
  
  
  // Global state
  const { showGlobalError } = useApp();
  
  const columns = useMemo(() => createStaffAndParentColumns(), []);
  
  // Create handler
  const handleCreateParent = () => {
    // Show mode selection dialog for parent
    setShowParentModeDialog(true);
  };

  const handleNavigateToCreateParent = (parentMode) => {
    navigate(`/manager/parents/create?mode=${parentMode}`);
  };
  
  // Manager chỉ có quyền get và create, không có update và delete
  
  // Parent creation mode state
  const [parentCreationMode, setParentCreationMode] = useState('ocr'); // 'ocr' or 'manual'
  const [showParentModeDialog, setShowParentModeDialog] = useState(false);
  
  return (
    <div className={styles.container}>
      {parentCrud.isPageLoading && <ContentLoading isLoading={parentCrud.isPageLoading} text={parentCrud.loadingText} />}
      
      {/* Header */}
      <ManagementPageHeader
        title="Quản lý Phụ Huynh"
        createButtonText="Tạo Phụ Huynh"
        onCreateClick={handleCreateParent}
      />

      {/* Error Alert */}
      {(error || parentCrud.error) && (
        <Alert 
          severity="error" 
          className={styles.errorAlert} 
          onClose={() => {
            setError(null);
          }}
        >
          {error || parentCrud.error}
        </Alert>
      )}

      {/* Content */}
      <Box sx={{ mt: 2 }}>
        <ManagementSearchSection
          keyword={parentCrud.keyword}
          onKeywordChange={parentCrud.handleKeywordChange}
          onSearch={parentCrud.handleKeywordSearch}
          onClear={parentCrud.handleClearSearch}
          placeholder="Tìm kiếm phụ huynh theo tên, email..."
        />

        <div className={styles.tableContainer}>
          <DataTable
            data={parentCrud.data}
            columns={columns}
            loading={parentCrud.isPageLoading}
            page={parentCrud.page}
            rowsPerPage={parentCrud.rowsPerPage}
            totalCount={parentCrud.totalCount}
            onPageChange={parentCrud.handlePageChange}
            onRowsPerPageChange={parentCrud.handleRowsPerPageChange}
            showActions={false}
            emptyMessage="Không có phụ huynh nào. Hãy tạo tài khoản phụ huynh đầu tiên để bắt đầu."
          />
        </div>
      </Box>

      {/* Parent Mode Selection Dialog */}
      <Dialog
        open={showParentModeDialog}
        onClose={() => setShowParentModeDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Chọn phương thức tạo tài khoản Phụ huynh
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Vui lòng chọn một trong hai phương thức sau:
          </Typography>
          <ToggleButtonGroup
            value={parentCreationMode}
            exclusive
            onChange={(e, value) => value && setParentCreationMode(value)}
            fullWidth
            orientation="vertical"
            sx={{ gap: 2 }}
          >
            <ToggleButton
              value="ocr"
              sx={{
                p: 3,
                textAlign: 'left',
                justifyContent: 'flex-start',
                '&.Mui-selected': {
                  backgroundColor: 'primary.50',
                  borderColor: 'primary.main',
                  borderWidth: 2
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <PhotoCameraIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Sử dụng OCR (Chụp CCCD)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tự động trích xuất thông tin từ ảnh CCCD
                  </Typography>
                </Box>
              </Box>
            </ToggleButton>
            <ToggleButton
              value="manual"
              sx={{
                p: 3,
                textAlign: 'left',
                justifyContent: 'flex-start',
                '&.Mui-selected': {
                  backgroundColor: 'primary.50',
                  borderColor: 'primary.main',
                  borderWidth: 2
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <EditIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Nhập thủ công
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Nhập thông tin từng bước bằng form
                  </Typography>
                </Box>
              </Box>
            </ToggleButton>
          </ToggleButtonGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowParentModeDialog(false)}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setShowParentModeDialog(false);
              handleNavigateToCreateParent(parentCreationMode);
            }}
          >
            Tiếp tục
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ParentManagement;

