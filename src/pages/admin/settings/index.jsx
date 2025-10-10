import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Switch,
  FormControlLabel,
  TextField,
  Divider,
  Alert
} from '@mui/material';
import {
  Save as SaveIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  SystemUpdate as SystemIcon,
  Palette as PaletteIcon
} from '@mui/icons-material';

const Settings = () => {
  const [settings, setSettings] = useState({
    // System Settings
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false,
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    
    // Appearance Settings
    theme: 'light',
    language: 'vi',
    
    // General Settings
    siteName: 'BRIGHWAY - After School Management',
    siteDescription: 'Hệ thống quản lý sau giờ học',
    contactEmail: 'admin@base.edu.vn',
    contactPhone: '+84 123 456 789'
  });

  const [saveStatus, setSaveStatus] = useState(null);

  const handleSettingChange = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // Simulate save
    setSaveStatus('success');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const SettingCard = ({ title, icon: Icon, children }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Icon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">{title}</Typography>
        </Box>
        {children}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Cài đặt hệ thống
        </Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
        >
          Lưu cài đặt
        </Button>
      </Box>

      {/* Save Status */}
      {saveStatus && (
        <Alert 
          severity={saveStatus} 
          sx={{ mb: 3 }}
          onClose={() => setSaveStatus(null)}
        >
          {saveStatus === 'success' ? 'Cài đặt đã được lưu thành công!' : 'Có lỗi xảy ra khi lưu cài đặt!'}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* System Settings */}
        <Grid item xs={12} md={6}>
          <SettingCard title="Cài đặt hệ thống" icon={SystemIcon}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.maintenanceMode}
                  onChange={handleSettingChange('maintenanceMode')}
                />
              }
              label="Chế độ bảo trì"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.allowRegistration}
                  onChange={handleSettingChange('allowRegistration')}
                />
              }
              label="Cho phép đăng ký tài khoản mới"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.requireEmailVerification}
                  onChange={handleSettingChange('requireEmailVerification')}
                />
              }
              label="Yêu cầu xác thực email"
            />
          </SettingCard>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <SettingCard title="Cài đặt thông báo" icon={NotificationsIcon}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailNotifications}
                  onChange={handleSettingChange('emailNotifications')}
                />
              }
              label="Thông báo qua email"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.pushNotifications}
                  onChange={handleSettingChange('pushNotifications')}
                />
              }
              label="Thông báo push"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.smsNotifications}
                  onChange={handleSettingChange('smsNotifications')}
                />
              }
              label="Thông báo SMS"
            />
          </SettingCard>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <SettingCard title="Cài đặt bảo mật" icon={SecurityIcon}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.twoFactorAuth}
                  onChange={handleSettingChange('twoFactorAuth')}
                />
              }
              label="Xác thực 2 yếu tố"
            />
            <TextField
              fullWidth
              label="Thời gian hết hạn phiên (phút)"
              type="number"
              value={settings.sessionTimeout}
              onChange={handleSettingChange('sessionTimeout')}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Số lần đăng nhập sai tối đa"
              type="number"
              value={settings.maxLoginAttempts}
              onChange={handleSettingChange('maxLoginAttempts')}
              margin="normal"
            />
          </SettingCard>
        </Grid>

        {/* Appearance Settings */}
        <Grid item xs={12} md={6}>
          <SettingCard title="Giao diện" icon={PaletteIcon}>
            <TextField
              fullWidth
              select
              label="Chủ đề"
              value={settings.theme}
              onChange={handleSettingChange('theme')}
              margin="normal"
            >
              <option value="light">Sáng</option>
              <option value="dark">Tối</option>
              <option value="auto">Tự động</option>
            </TextField>
            <TextField
              fullWidth
              select
              label="Ngôn ngữ"
              value={settings.language}
              onChange={handleSettingChange('language')}
              margin="normal"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </TextField>
          </SettingCard>
        </Grid>

        {/* General Settings */}
        <Grid item xs={12}>
          <SettingCard title="Thông tin chung" icon={SystemIcon}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tên trang web"
                  value={settings.siteName}
                  onChange={handleSettingChange('siteName')}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Mô tả trang web"
                  value={settings.siteDescription}
                  onChange={handleSettingChange('siteDescription')}
                  margin="normal"
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email liên hệ"
                  type="email"
                  value={settings.contactEmail}
                  onChange={handleSettingChange('contactEmail')}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Số điện thoại liên hệ"
                  value={settings.contactPhone}
                  onChange={handleSettingChange('contactPhone')}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </SettingCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;
