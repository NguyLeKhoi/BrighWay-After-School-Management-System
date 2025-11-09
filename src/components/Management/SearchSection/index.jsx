import React from 'react';
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
  <Paper className={styles.searchSection}>
    <div className={styles.searchContainer}>
      <TextField
        placeholder={placeholder}
        value={keyword}
        onChange={onKeywordChange}
        className={styles.searchField}
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
      <Button variant="contained" onClick={onSearch} className={styles.searchButton}>
        Tìm kiếm
      </Button>
      {showClearButton && keyword && (
        <Button variant="outlined" onClick={onClear} className={styles.clearButton}>
          Xóa tìm kiếm
        </Button>
      )}
      {children}
    </div>
  </Paper>
);

export default ManagementSearchSection;

