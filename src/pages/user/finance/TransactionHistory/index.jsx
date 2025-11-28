import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Paper } from '@mui/material';
import { History } from '@mui/icons-material';
import styles from '../Finance.module.css';

const TransactionHistory = () => {
  return (
    <motion.div 
      className={styles.financePage}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.container}>
        <h1 className={styles.title}>Lịch sử giao dịch</h1>

        <Paper
          elevation={0}
          sx={{
            padding: 4,
            textAlign: 'center',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px dashed var(--border-light)',
            borderRadius: 'var(--radius-xl)'
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-primary-100) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem'
            }}
          >
            <History sx={{ color: 'var(--color-primary)', fontSize: 28 }} />
          </Box>
          <History sx={{ fontSize: 64, color: 'var(--text-tertiary)', marginBottom: 2, opacity: 0.5 }} />
          <Typography
            variant="h6"
            sx={{
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-family)',
              fontWeight: 'var(--font-weight-medium)',
              marginBottom: 1
            }}
          >
            Chưa có dữ liệu
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'var(--text-tertiary)',
              fontFamily: 'var(--font-family)'
            }}
          >
            Lịch sử giao dịch (thanh toán, mua hàng, chuyển khoản) sẽ hiển thị ở đây.
          </Typography>
        </Paper>
      </div>
    </motion.div>
  );
};

export default TransactionHistory;

