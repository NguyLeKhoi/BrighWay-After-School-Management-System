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
import styles from './Settings.module.css';

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
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Cài đặt hệ thống
        </h1>
        <p className={styles.subtitle}>
          Quản lý cấu hình và tùy chỉnh hệ thống
        </p>
      </div>

      {/* Save Status */}
      {saveStatus && (
        <div className={`${styles.alert} ${styles[saveStatus]}`}>
          {saveStatus === 'success' ? 'Cài đặt đã được lưu thành công!' : 'Có lỗi xảy ra khi lưu cài đặt!'}
        </div>
      )}

      <div className={styles.settingsGrid}>
        {/* System Settings */}
        <div className={styles.settingCard}>
          <div className={styles.settingHeader}>
            <div className={`${styles.settingIcon} ${styles.general}`}>
              <SystemIcon />
            </div>
            <h3 className={styles.settingTitle}>
              Cài đặt hệ thống
            </h3>
          </div>
          <p className={styles.settingDescription}>
            Quản lý các cài đặt cơ bản của hệ thống
          </p>
            <div className={styles.switchContainer}>
              <label className={styles.switchLabel}>
                Chế độ bảo trì
              </label>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  className={styles.switchInput}
                  checked={settings.maintenanceMode}
                  onChange={handleSettingChange('maintenanceMode')}
                />
                <span className={styles.switchSlider}></span>
              </label>
            </div>
            
            <div className={styles.switchContainer}>
              <label className={styles.switchLabel}>
                Cho phép đăng ký tài khoản mới
              </label>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  className={styles.switchInput}
                  checked={settings.allowRegistration}
                  onChange={handleSettingChange('allowRegistration')}
                />
                <span className={styles.switchSlider}></span>
              </label>
            </div>
            
            <div className={styles.switchContainer}>
              <label className={styles.switchLabel}>
                Yêu cầu xác thực email
              </label>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  className={styles.switchInput}
                  checked={settings.requireEmailVerification}
                  onChange={handleSettingChange('requireEmailVerification')}
                />
                <span className={styles.switchSlider}></span>
              </label>
            </div>
        </div>

        {/* Notification Settings */}
        <div className={styles.settingCard}>
          <div className={styles.settingHeader}>
            <div className={`${styles.settingIcon} ${styles.notifications}`}>
              <NotificationsIcon />
            </div>
            <h3 className={styles.settingTitle}>
              Cài đặt thông báo
            </h3>
          </div>
          <p className={styles.settingDescription}>
            Quản lý các thông báo và email
          </p>
            <div className={styles.switchContainer}>
              <label className={styles.switchLabel}>
                Thông báo qua email
              </label>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  className={styles.switchInput}
                  checked={settings.emailNotifications}
                  onChange={handleSettingChange('emailNotifications')}
                />
                <span className={styles.switchSlider}></span>
              </label>
            </div>
            
            <div className={styles.switchContainer}>
              <label className={styles.switchLabel}>
                Thông báo push
              </label>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  className={styles.switchInput}
                  checked={settings.pushNotifications}
                  onChange={handleSettingChange('pushNotifications')}
                />
                <span className={styles.switchSlider}></span>
              </label>
            </div>
            
            <div className={styles.switchContainer}>
              <label className={styles.switchLabel}>
                Thông báo SMS
              </label>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  className={styles.switchInput}
                  checked={settings.smsNotifications}
                  onChange={handleSettingChange('smsNotifications')}
                />
                <span className={styles.switchSlider}></span>
              </label>
            </div>
        </div>

        {/* Security Settings */}
        <div className={styles.settingCard}>
          <div className={styles.settingHeader}>
            <div className={`${styles.settingIcon} ${styles.security}`}>
              <SecurityIcon />
            </div>
            <h3 className={styles.settingTitle}>
              Cài đặt bảo mật
            </h3>
          </div>
          <p className={styles.settingDescription}>
            Quản lý các cài đặt bảo mật và xác thực
          </p>
            <div className={styles.switchContainer}>
              <label className={styles.switchLabel}>
                Xác thực 2 yếu tố
              </label>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  className={styles.switchInput}
                  checked={settings.twoFactorAuth}
                  onChange={handleSettingChange('twoFactorAuth')}
                />
                <span className={styles.switchSlider}></span>
              </label>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Thời gian hết hạn phiên (phút)
              </label>
              <input
                type="number"
                className={styles.formInput}
                value={settings.sessionTimeout}
                onChange={handleSettingChange('sessionTimeout')}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Số lần đăng nhập sai tối đa
              </label>
              <input
                type="number"
                className={styles.formInput}
                value={settings.maxLoginAttempts}
                onChange={handleSettingChange('maxLoginAttempts')}
              />
            </div>
        </div>

        {/* Appearance Settings */}
        <div className={styles.settingCard}>
          <div className={styles.settingHeader}>
            <div className={`${styles.settingIcon} ${styles.appearance}`}>
              <PaletteIcon />
            </div>
            <h3 className={styles.settingTitle}>
              Giao diện
            </h3>
          </div>
          <p className={styles.settingDescription}>
            Tùy chỉnh giao diện và chủ đề
          </p>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Chủ đề
              </label>
              <select
                className={styles.formSelect}
                value={settings.theme}
                onChange={handleSettingChange('theme')}
              >
                <option value="light">Sáng</option>
                <option value="dark">Tối</option>
                <option value="auto">Tự động</option>
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Ngôn ngữ
              </label>
              <select
                className={styles.formSelect}
                value={settings.language}
                onChange={handleSettingChange('language')}
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>
        </div>

        {/* General Settings */}
        <div className={styles.settingCard}>
          <div className={styles.settingHeader}>
            <div className={`${styles.settingIcon} ${styles.general}`}>
              <SystemIcon />
            </div>
            <h3 className={styles.settingTitle}>
              Thông tin chung
            </h3>
          </div>
          <p className={styles.settingDescription}>
            Cấu hình thông tin cơ bản của hệ thống
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Tên trang web
              </label>
              <input
                type="text"
                className={styles.formInput}
                value={settings.siteName}
                onChange={handleSettingChange('siteName')}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Email liên hệ
              </label>
              <input
                type="email"
                className={styles.formInput}
                value={settings.contactEmail}
                onChange={handleSettingChange('contactEmail')}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Số điện thoại liên hệ
              </label>
              <input
                type="text"
                className={styles.formInput}
                value={settings.contactPhone}
                onChange={handleSettingChange('contactPhone')}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Mô tả trang web
              </label>
              <textarea
                className={styles.formTextarea}
                value={settings.siteDescription}
                onChange={handleSettingChange('siteDescription')}
                rows={3}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.buttonGroup}>
        <button className={styles.primaryButton} onClick={handleSave}>
          <SaveIcon fontSize="small" style={{ marginRight: '8px' }} />
          Lưu cài đặt
        </button>
        <button className={styles.secondaryButton}>
          Hủy
        </button>
      </div>
    </div>
  );
};

export default Settings;
