/**
 * Environment variables utility
 * Centralized access to environment variables with validation
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5160/api',
  TIMEOUT: 10000,
};

// JWT Claims Configuration
export const JWT_CLAIMS = {
  USER_ID: import.meta.env.VITE_JWT_CLAIM_USER_ID || 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
  EMAIL: import.meta.env.VITE_JWT_CLAIM_EMAIL || 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
  ROLE: import.meta.env.VITE_JWT_CLAIM_ROLE || 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
};

// Application Configuration
export const APP_CONFIG = {
  NAME: 'BrighWay After-School Management System',
  VERSION: '1.0.0',
  ENVIRONMENT: import.meta.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: import.meta.env.NODE_ENV === 'development',
  IS_PRODUCTION: import.meta.env.NODE_ENV === 'production',
};

// Validation function
export const validateEnv = () => {
  const requiredVars = [
    'VITE_API_BASE_URL',
    'VITE_JWT_CLAIM_USER_ID',
    'VITE_JWT_CLAIM_EMAIL',
    'VITE_JWT_CLAIM_ROLE',
  ];

  const missingVars = requiredVars.filter(
    (varName) => !import.meta.env[varName]
  );

  if (missingVars.length > 0) {
    console.warn('Missing environment variables:', missingVars);
  }

  return missingVars.length === 0;
};

// Debug function for development
export const logEnvConfig = () => {
  if (APP_CONFIG.IS_DEVELOPMENT) {
    console.log('Environment Configuration:', {
      API_BASE_URL: API_CONFIG.BASE_URL,
      JWT_CLAIMS: JWT_CLAIMS,
      APP_CONFIG: APP_CONFIG,
    });
  }
};

// Default export
export default {
  API_CONFIG,
  JWT_CLAIMS,
  APP_CONFIG,
  validateEnv,
  logEnvConfig,
};
