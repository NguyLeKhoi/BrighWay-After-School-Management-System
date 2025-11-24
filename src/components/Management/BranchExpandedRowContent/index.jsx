import React from 'react';
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  CardGiftcard as BenefitIcon,
  School as SchoolIcon,
  Class as ClassIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import styles from '../../../pages/admin/branchManagement/BranchManagement.module.css';

const BranchExpandedRowContent = ({
  branch,
  rowBenefits,
  rowSchools,
  rowStudentLevels,
  actionLoading,
  onRemoveBenefit,
  onRemoveSchool
}) => {
  return (
    <Box sx={{ p: 2 }}>
      {/* Benefits Section */}
      {rowBenefits[branch.id] === undefined ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={2}>
          <CircularProgress size={24} />
        </Box>
      ) : rowBenefits[branch.id] && rowBenefits[branch.id].length > 0 ? (
        <Box className={styles.benefitWrapper} sx={{ mb: 3 }}>
          <Box className={styles.benefitMeta}>
            <Typography variant="subtitle1" fontWeight={600}>
              Danh sách Lợi Ích
            </Typography>
            <Chip
              label={`${rowBenefits[branch.id].length} lợi ích`}
              color="primary"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 500 }}
            />
          </Box>

          <TableContainer component={Paper} variant="outlined" className={styles.benefitTable}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: 'grey.100' }}>
                <TableRow>
                  <TableCell sx={{ width: 56, fontWeight: 600 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tên lợi ích</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Mô tả</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 140 }}>Trạng thái</TableCell>
                  <TableCell sx={{ width: 100 }} align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rowBenefits[branch.id].map((benefit, idx) => {
                  const isActive =
                    typeof benefit.status === 'boolean'
                      ? benefit.status
                      : typeof benefit.isActive === 'boolean'
                      ? benefit.isActive
                      : false;

                  return (
                    <TableRow
                      key={benefit.id}
                      hover
                      sx={{
                        backgroundColor: isActive ? 'success.50' : 'transparent',
                        '&:hover': {
                          backgroundColor: isActive ? 'success.100' : 'grey.50'
                        }
                      }}
                    >
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <BenefitIcon fontSize="small" color={isActive ? 'success' : 'action'} />
                          <Typography variant="body2" fontWeight={600}>
                            {benefit.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {benefit.description || 'Không có mô tả'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={isActive ? 'Hoạt động' : 'Không hoạt động'}
                          color={isActive ? 'success' : 'default'}
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Gỡ lợi ích khỏi chi nhánh">
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => onRemoveBenefit(branch.id, benefit.id, benefit.name)}
                              disabled={actionLoading}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ) : (
        <Box sx={{ py: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Chi nhánh này chưa có lợi ích nào được gán.
          </Typography>
        </Box>
      )}

      {/* Schools Section */}
      <Divider sx={{ my: 3 }} />
      {rowSchools[branch.id] === undefined ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={2}>
          <CircularProgress size={24} />
        </Box>
      ) : rowSchools[branch.id] && rowSchools[branch.id].length > 0 ? (
        <Box className={styles.benefitWrapper}>
          <Box className={styles.benefitMeta}>
            <Typography variant="subtitle1" fontWeight={600}>
              Danh sách Trường
            </Typography>
            <Chip
              label={`${rowSchools[branch.id].length} trường`}
              color="success"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 500 }}
            />
          </Box>

          <TableContainer component={Paper} variant="outlined" className={styles.benefitTable}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: 'grey.100' }}>
                <TableRow>
                  <TableCell sx={{ width: 56, fontWeight: 600 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tên trường</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Địa chỉ</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Số điện thoại</TableCell>
                  <TableCell sx={{ width: 100 }} align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rowSchools[branch.id].map((school, idx) => {
                  const schoolName = school.name || school.schoolName || 'Không rõ tên';
                  const schoolAddress = school.address || 'Không có địa chỉ';
                  const schoolPhone = school.phoneNumber || school.phone || 'N/A';

                  return (
                    <TableRow
                      key={school.id}
                      hover
                      sx={{
                        backgroundColor: 'success.50',
                        '&:hover': {
                          backgroundColor: 'success.100'
                        }
                      }}
                    >
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <SchoolIcon fontSize="small" color="success" />
                          <Typography variant="body2" fontWeight={600}>
                            {schoolName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {schoolAddress}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{schoolPhone}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Gỡ trường khỏi chi nhánh">
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => onRemoveSchool(branch.id, school.id, schoolName)}
                              disabled={actionLoading}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ) : (
        <Box sx={{ py: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Chi nhánh này chưa có trường nào được gán.
          </Typography>
        </Box>
      )}

      {/* Student Levels Section */}
      <Divider sx={{ my: 3 }} />
      {rowStudentLevels[branch.id] === undefined ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={2}>
          <CircularProgress size={24} />
        </Box>
      ) : rowStudentLevels[branch.id] && rowStudentLevels[branch.id].length > 0 ? (
        <Box className={styles.benefitWrapper}>
          <Box className={styles.benefitMeta}>
            <Typography variant="subtitle1" fontWeight={600}>
              Danh sách Cấp Độ Học Sinh
            </Typography>
            <Chip
              label={`${rowStudentLevels[branch.id].length} cấp độ`}
              color="warning"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 500 }}
            />
          </Box>

          <TableContainer component={Paper} variant="outlined" className={styles.benefitTable}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: 'grey.100' }}>
                <TableRow>
                  <TableCell sx={{ width: 56, fontWeight: 600 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tên cấp độ</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Mô tả</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rowStudentLevels[branch.id].map((studentLevel, idx) => {
                  const levelName = studentLevel.name || studentLevel.levelName || 'Không rõ tên';
                  const levelDescription = studentLevel.description || studentLevel.desc || 'Không có mô tả';

                  return (
                    <TableRow
                      key={studentLevel.id || idx}
                      hover
                      sx={{
                        backgroundColor: 'warning.50',
                        '&:hover': {
                          backgroundColor: 'warning.100'
                        }
                      }}
                    >
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <ClassIcon fontSize="small" color="warning" />
                          <Typography variant="body2" fontWeight={600}>
                            {levelName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {levelDescription}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ) : (
        <Box sx={{ py: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Chi nhánh này chưa có cấp độ học sinh nào được gán.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default BranchExpandedRowContent;

