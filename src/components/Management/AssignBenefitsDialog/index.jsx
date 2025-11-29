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
  CardGiftcard as BenefitIcon,
  Assignment as AssignIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import ManagementFormDialog from '../FormDialog';

const AssignBenefitsDialog = ({
  open,
  onClose,
  selectedBranch,
  availableBenefits,
  assignedBenefits,
  selectedBenefits,
  setSelectedBenefits,
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
      title={`Gán Lợi Ích cho "${selectedBranch?.branchName}"`}
      icon={BenefitIcon}
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
                Chọn lợi ích để gán thêm
              </Typography>
              <FormControl fullWidth>
                <Autocomplete
                  multiple
                  options={availableBenefits.filter(b => !assignedBenefits.some(ab => ab.id === b.id))}
                  getOptionLabel={(option) => option.name}
                  value={availableBenefits.filter(b => 
                    selectedBenefits.includes(b.id) && !assignedBenefits.some(ab => ab.id === b.id)
                  )}
                  onChange={(event, newValue) => {
                    const newIds = newValue.map(b => b.id);
                    const currentAssignedIds = assignedBenefits.map(b => b.id);
                    setSelectedBenefits([...currentAssignedIds, ...newIds]);
                  }}
                  disableCloseOnSelect
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Tìm kiếm và chọn lợi ích để gán thêm..."
                      variant="outlined"
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Checkbox checked={selectedBenefits.includes(option.id)} />
                      <ListItemText
                        primary={option.name}
                        secondary={option.description || 'Không có mô tả'}
                      />
                    </Box>
                  )}
                  disabled={loading}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Divider />
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary">
                  Lợi ích mới sẽ gán: <strong>{selectedBenefits.filter(id => !assignedBenefits.some(ab => ab.id === id)).length}</strong>
                </Typography>
              </Box>
            </Grid>

            {assignedBenefits.length > 0 && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom color="primary">
                  Lợi ích hiện tại:
                </Typography>
                <List dense>
                  {assignedBenefits.map((benefit) => (
                    <ListItem
                      key={benefit.id}
                      secondaryAction={
                        <Tooltip title="Gỡ lợi ích">
                          <IconButton
                            edge="end"
                            size="small"
                            color="error"
                            onClick={() => onRemoveDirect ? onRemoveDirect(selectedBranch.id, benefit.id, benefit.name) : onRemove(selectedBranch.id, benefit.id, benefit.name)}
                            disabled={actionLoading}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      }
                    >
                      <BenefitIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                      <ListItemText
                        primary={benefit.name}
                        secondary={benefit.description || 'Không có mô tả'}
                      />
                    </ListItem>
                  ))}
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
            onClick={onSubmit}
            disabled={loading || actionLoading}
            startIcon={<AssignIcon />}
          >
            {actionLoading ? 'Đang xử lý...' : 'Gán Lợi Ích'}
          </Button>
        </Box>
      </>
    </ManagementFormDialog>
  );
};

export default AssignBenefitsDialog;

