import React from 'react';
import { motion } from 'framer-motion';
import { Paper, TextField, InputAdornment, Button } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import styles from './ManagementSearchSection.module.css';

const ManagementSearchSection = ({
  keyword,
  onKeywordChange,
  onSearch,
  onClear,
  placeholder = 'Tìm kiếm...',
  showClearButton = true,
  children
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: 0.1 }}
  >
    <Paper 
      className={styles.searchSection} 
      elevation={0}
      sx={{
        background: 'var(--bg-primary)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border-light)'
      }}
    >
      <div className={styles.searchContainer}>
        <TextField
          placeholder={placeholder}
          value={keyword}
          onChange={onKeywordChange}
          className={styles.searchField}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 'var(--radius-lg)',
              '&:hover fieldset': {
                borderColor: 'var(--color-primary)'
              },
              '&.Mui-focused fieldset': {
                borderColor: 'var(--color-primary)'
              }
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              onSearch();
            }
          }}
        />
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            variant="contained" 
            onClick={onSearch} 
            className={styles.searchButton}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              fontWeight: 600,
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%)',
                boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            Tìm kiếm
          </Button>
        </motion.div>
        {showClearButton && keyword && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="outlined" 
              onClick={onClear} 
              className={styles.clearButton}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Xóa tìm kiếm
            </Button>
          </motion.div>
        )}
        {children}
      </div>
    </Paper>
  </motion.div>
);

export default ManagementSearchSection;

