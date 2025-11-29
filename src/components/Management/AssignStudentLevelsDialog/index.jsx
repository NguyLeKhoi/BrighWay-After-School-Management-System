import React from 'react';
import {
  Box,
  Typography,
  Grid,
  FormControl,
  Autocomplete,
  TextField,
  Checkbox,
  ListItemText,
  Divider,
  List,
  ListItem,
  Button,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Class as ClassIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import ManagementFormDialog from '../FormDialog';

const AssignStudentLevelsDialog = ({
  open,
  onClose,
  selectedBranch,
  availableStudentLevels,
  assignedStudentLevels,
  selectedStudentLevels,
  setSelectedStudentLevels,
  loading,
  actionLoading,
  onRemoveDirect,
  onSubmit
}) => {
  return (
    <ManagementFormDialog
      open={open}
      onClose={onClose}
      mode="assign"
      title={`Gán Cấp Độ Học Sinh cho "${selectedBranch?.branchName}"`}
      icon={ClassIcon}
      loading={loading || actionLoading}
      maxWidth="md"
    >
      <>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Chọn cấp độ học sinh để gán thêm
              </Typography>
              <FormControl fullWidth>
                <Autocomplete
                  multiple
                  options={availableStudentLevels.filter(sl => {
                    const levelId = sl.id || sl.studentLevelId;
                    return levelId && !assignedStudentLevels.some(asl => {
                      const assignedId = asl.id || asl.studentLevelId;
                      return assignedId && assignedId === levelId;
                    });
                  })}
                  getOptionLabel={(option) => option.name || option.levelName || 'Không rõ tên'}
                  getOptionKey={(option) => option.id || option.studentLevelId}
                  value={availableStudentLevels.filter(sl => {
                    const levelId = sl.id || sl.studentLevelId;
                    return levelId && selectedStudentLevels.includes(levelId) && !assignedStudentLevels.some(asl => {
                      const assignedId = asl.id || asl.studentLevelId;
                      return assignedId && assignedId === levelId;
                    });
                  })}
                  onChange={(event, newValue) => {
                    const newIds = newValue
                      .map(sl => sl.id || sl.studentLevelId)
                      .filter(id => id != null && id !== '');
                    setSelectedStudentLevels(newIds);
                  }}
                  disableCloseOnSelect
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Tìm kiếm và chọn cấp độ học sinh để gán thêm..."
                      variant="outlined"
                    />
                  )}
                  renderOption={(props, option) => {
                    const levelId = option.id || option.studentLevelId;
                    const isSelected = levelId && selectedStudentLevels.includes(levelId);
                    return (
                      <Box component="li" {...props}>
                        <Checkbox checked={isSelected} />
                        <ListItemText
                          primary={option.name || option.levelName || 'Không rõ tên'}
                          secondary={option.description || option.desc || 'Không có mô tả'}
                        />
                      </Box>
                    );
                  }}
                  disabled={loading}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Divider />
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary">
                  Cấp độ học sinh mới sẽ gán: <strong>{selectedStudentLevels.filter(id => !assignedStudentLevels.some(asl => {
                    const assignedId = asl.id || asl.studentLevelId;
                    return assignedId && assignedId === id;
                  })).length}</strong>
                </Typography>
              </Box>
            </Grid>

            {assignedStudentLevels.length > 0 && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom color="warning">
                  Cấp độ học sinh hiện tại:
                </Typography>
                <List dense>
                  {assignedStudentLevels.map((studentLevel) => {
                    const levelName = studentLevel.name || studentLevel.levelName || 'Không rõ tên';
                    return (
                      <ListItem
                        key={studentLevel.id || studentLevel.studentLevelId}
                        secondaryAction={
                          onRemoveDirect && (
                            <Tooltip title="Gỡ cấp độ học sinh">
                              <IconButton
                                edge="end"
                                size="small"
                                color="error"
                                onClick={() => onRemoveDirect(selectedBranch.id, studentLevel.id || studentLevel.studentLevelId, levelName)}
                                disabled={actionLoading}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )
                        }
                      >
                        <ClassIcon fontSize="small" color="warning" sx={{ mr: 1 }} />
                        <ListItemText
                          primary={levelName}
                          secondary={studentLevel.description || studentLevel.desc || 'Không có mô tả'}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Grid>
            )}
          </Grid>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={loading || actionLoading}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={onSubmit}
            disabled={loading || actionLoading}
            startIcon={<ClassIcon />}
          >
            {actionLoading ? 'Đang xử lý...' : 'Gán Cấp Độ'}
          </Button>
        </Box>
      </>
    </ManagementFormDialog>
  );
};

export default AssignStudentLevelsDialog;

