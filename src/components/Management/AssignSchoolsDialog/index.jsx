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
  School as SchoolIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import ManagementFormDialog from '../FormDialog';

const AssignSchoolsDialog = ({
  open,
  onClose,
  selectedBranch,
  availableSchools,
  assignedSchools,
  selectedSchools,
  setSelectedSchools,
  loading,
  actionLoading,
  onRemove,
  onRemoveDirect,
  onSubmit
}) => {
  return (
    <ManagementFormDialog
      open={open}
      onClose={onClose}
      mode="assign"
      title={`Gán Trường cho "${selectedBranch?.branchName}"`}
      icon={SchoolIcon}
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
                Chọn trường để gán thêm
              </Typography>
              <FormControl fullWidth>
                <Autocomplete
                  multiple
                  options={availableSchools.filter(s => {
                    const schoolId = s.id || s.schoolId;
                    return schoolId && !assignedSchools.some(as => {
                      const assignedId = as.id || as.schoolId;
                      return assignedId && assignedId === schoolId;
                    });
                  })}
                  getOptionLabel={(option) => option.name || option.schoolName || 'Không rõ tên'}
                  getOptionKey={(option) => option.id || option.schoolId}
                  value={availableSchools.filter(s => {
                    const schoolId = s.id || s.schoolId;
                    return schoolId && selectedSchools.includes(schoolId) && !assignedSchools.some(as => {
                      const assignedId = as.id || as.schoolId;
                      return assignedId && assignedId === schoolId;
                    });
                  })}
                  onChange={(event, newValue) => {
                    const newIds = newValue
                      .map(s => s.id || s.schoolId)
                      .filter(id => id != null && id !== '');
                    setSelectedSchools(newIds);
                  }}
                  disableCloseOnSelect
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Tìm kiếm và chọn trường để gán thêm..."
                      variant="outlined"
                    />
                  )}
                  renderOption={(props, option) => {
                    const schoolId = option.id || option.schoolId;
                    const isSelected = schoolId && selectedSchools.includes(schoolId);
                    return (
                      <Box component="li" {...props}>
                        <Checkbox checked={isSelected} />
                        <ListItemText
                          primary={option.name || option.schoolName || 'Không rõ tên'}
                          secondary={option.address || 'Không có địa chỉ'}
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
                  Trường mới sẽ gán: <strong>{selectedSchools.filter(id => !assignedSchools.some(as => {
                    const assignedId = as.id || as.schoolId;
                    return assignedId && assignedId === id;
                  })).length}</strong>
                </Typography>
              </Box>
            </Grid>

            {assignedSchools.length > 0 && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom color="success">
                  Trường hiện tại:
                </Typography>
                <List dense>
                  {assignedSchools.map((school) => {
                    const schoolName = school.name || school.schoolName || 'Không rõ tên';
                    return (
                      <ListItem
                        key={school.id || school.schoolId}
                        secondaryAction={
                          <Tooltip title="Gỡ trường">
                            <IconButton
                              edge="end"
                              size="small"
                              color="error"
                              onClick={() => onRemoveDirect ? onRemoveDirect(selectedBranch.id, school.id || school.schoolId, schoolName) : onRemove(selectedBranch.id, school.id || school.schoolId, schoolName)}
                              disabled={actionLoading}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        }
                      >
                        <SchoolIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                        <ListItemText
                          primary={schoolName}
                          secondary={school.address || 'Không có địa chỉ'}
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
            color="success"
            onClick={onSubmit}
            disabled={loading || actionLoading}
            startIcon={<SchoolIcon />}
          >
            {actionLoading ? 'Đang xử lý...' : 'Gán Trường'}
          </Button>
        </Box>
      </>
    </ManagementFormDialog>
  );
};

export default AssignSchoolsDialog;

