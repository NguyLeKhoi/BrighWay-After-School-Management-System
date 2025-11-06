import React from 'react';
import {
  Paper,
  TextField,
  InputAdornment,
  Button
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import styles from './ManagerSearchSection.module.css';

/**
 * Reusable Manager Search Section Component
 * @param {string} keyword - Search keyword value
 * @param {Function} onKeywordChange - Handler for keyword change
 * @param {Function} onSearch - Handler for search button click
 * @param {Function} onClear - Handler for clear button click
 * @param {string} placeholder - Search input placeholder
 * @param {boolean} showClearButton - Whether to show clear button
 * @param {React.ReactNode} children - Optional additional filters
 */
const ManagerSearchSection = ({
  keyword,
  onKeywordChange,
  onSearch,
  onClear,
  placeholder = 'Tìm kiếm...',
  showClearButton = true,
  children
}) => {
  return (
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
            ),
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              onSearch();
            }
          }}
        />
        <Button
          variant="contained"
          onClick={onSearch}
          className={styles.searchButton}
        >
          Tìm kiếm
        </Button>
        {showClearButton && keyword && (
          <Button
            variant="outlined"
            onClick={onClear}
            className={styles.clearButton}
          >
            Xóa tìm kiếm
          </Button>
        )}
        {children}
      </div>
    </Paper>
  );
};

export default ManagerSearchSection;

