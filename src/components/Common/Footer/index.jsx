import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link as MuiLink
} from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(135deg, var(--color-gray-900) 0%, var(--color-gray-800) 100%)',
        color: 'var(--bg-primary)',
        marginTop: 'auto'
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          padding: { xs: '0 15px', sm: '0 20px' }
        }}
      >
        <Grid
          container
          spacing={5}
          sx={{
            padding: { xs: '40px 0 20px', sm: '50px 0 30px' },
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(250px, 1fr))' }
          }}
        >
          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: '20px', sm: 'var(--font-size-2xl)' },
                  fontWeight: 'var(--font-weight-bold)',
                  fontFamily: 'var(--font-family)',
                  marginBottom: 'var(--spacing-4)',
                  color: 'var(--bg-primary)'
                }}
              >
                BRIGHWAY
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  marginBottom: 'var(--spacing-5)',
                  lineHeight: 'var(--line-height-relaxed)',
                  fontFamily: 'var(--font-family)',
                  color: 'var(--color-gray-300)'
                }}
              >
              Dịch vụ giữ trẻ sau giờ học với các hoạt động ngoài giờ đa dạng, phong phú. 
              Chúng tôi cam kết mang đến môi trường an toàn, vui vẻ và bổ ích cho trẻ em.
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '16px', sm: 'var(--font-size-lg)' },
                  fontWeight: 'var(--font-weight-semibold)',
                  fontFamily: 'var(--font-family)',
                  marginBottom: 'var(--spacing-5)',
                  color: 'var(--bg-primary)'
                }}
              >
                Liên Kết Nhanh
              </Typography>
              <Box
                component="ul"
                sx={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  '& li': {
                    marginBottom: '10px'
                  }
                }}
              >
                <li>
                  <MuiLink
                    component={Link}
                    to="/"
                    sx={{
                      color: 'var(--color-gray-300)',
                      textDecoration: 'none',
                      transition: 'var(--transition-all)',
                      fontSize: 'var(--font-size-sm)',
                      fontFamily: 'var(--font-family)',
                      '&:hover': {
                        color: 'var(--color-primary-light)'
                      }
                    }}
                  >
                    Trang Chủ
                  </MuiLink>
                </li>
                <li>
                  <MuiLink
                    component={Link}
                    to="/packages"
                    sx={{
                      color: 'var(--color-gray-300)',
                      textDecoration: 'none',
                      transition: 'var(--transition-all)',
                      fontSize: 'var(--font-size-sm)',
                      fontFamily: 'var(--font-family)',
                      '&:hover': {
                        color: 'var(--color-primary-light)'
                      }
                    }}
                  >
                    Gói Dịch Vụ
                  </MuiLink>
                </li>
                <li>
                  <MuiLink
                    component={Link}
                    to="/facilities"
                    sx={{
                      color: 'var(--color-gray-300)',
                      textDecoration: 'none',
                      transition: 'var(--transition-all)',
                      fontSize: 'var(--font-size-sm)',
                      fontFamily: 'var(--font-family)',
                      '&:hover': {
                        color: 'var(--color-primary-light)'
                      }
                    }}
                  >
                    Cơ Sở Vật Chất
                  </MuiLink>
                </li>
                <li>
                  <MuiLink
                    component={Link}
                    to="/contact"
                    sx={{
                      color: 'var(--color-gray-300)',
                      textDecoration: 'none',
                      transition: 'var(--transition-all)',
                      fontSize: 'var(--font-size-sm)',
                      fontFamily: 'var(--font-family)',
                      '&:hover': {
                        color: 'var(--color-primary-light)'
                      }
                    }}
                  >
                    Liên Hệ
                  </MuiLink>
                </li>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '16px', sm: 'var(--font-size-lg)' },
                  fontWeight: 'var(--font-weight-semibold)',
                  fontFamily: 'var(--font-family)',
                  marginBottom: 'var(--spacing-5)',
                  color: 'var(--bg-primary)'
                }}
              >
                Dịch Vụ
              </Typography>
              <Box
                component="ul"
                sx={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  '& li': {
                    marginBottom: '10px'
                  }
                }}
              >
                <li>
                  <MuiLink
                    component={Link}
                    to="/packages"
                    sx={{
                      color: 'var(--color-gray-300)',
                      textDecoration: 'none',
                      transition: 'var(--transition-all)',
                      fontSize: 'var(--font-size-sm)',
                      fontFamily: 'var(--font-family)',
                      '&:hover': {
                        color: 'var(--color-primary-light)'
                      }
                    }}
                  >
                    Gói Dịch Vụ Giữ Trẻ
                  </MuiLink>
                </li>
                <li>
                  <MuiLink
                    component={Link}
                    to="/facilities"
                    sx={{
                      color: 'var(--color-gray-300)',
                      textDecoration: 'none',
                      transition: 'var(--transition-all)',
                      fontSize: 'var(--font-size-sm)',
                      fontFamily: 'var(--font-family)',
                      '&:hover': {
                        color: 'var(--color-primary-light)'
                      }
                    }}
                  >
                    Cơ Sở Vật Chất
                  </MuiLink>
                </li>
                <li>
                  <MuiLink
                    component={Link}
                    to="/contact"
                    sx={{
                      color: 'var(--color-gray-300)',
                      textDecoration: 'none',
                      transition: 'var(--transition-all)',
                      fontSize: 'var(--font-size-sm)',
                      fontFamily: 'var(--font-family)',
                      '&:hover': {
                        color: 'var(--color-primary-light)'
                      }
                    }}
                  >
                    Đăng Ký Dịch Vụ
                  </MuiLink>
                </li>
                <li>
                  <MuiLink
                    component={Link}
                    to="/login"
                    sx={{
                      color: 'var(--color-gray-300)',
                      textDecoration: 'none',
                      transition: 'var(--transition-all)',
                      fontSize: 'var(--font-size-sm)',
                      fontFamily: 'var(--font-family)',
                      '&:hover': {
                        color: 'var(--color-primary-light)'
                      }
                    }}
                  >
                    Đăng Nhập
                  </MuiLink>
                </li>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '16px', sm: 'var(--font-size-lg)' },
                  fontWeight: 'var(--font-weight-semibold)',
                  fontFamily: 'var(--font-family)',
                  marginBottom: 'var(--spacing-5)',
                  color: 'var(--bg-primary)'
                }}
              >
                Thông Tin Liên Hệ
              </Typography>
              <Box
                sx={{
                  '& p': {
                    marginBottom: 'var(--spacing-2)',
                    color: 'var(--color-gray-300)',
                    fontSize: 'var(--font-size-sm)',
                    fontFamily: 'var(--font-family)'
                  }
                }}
              >
                <Typography component="p">Email: info@brighway.com</Typography>
                <Typography component="p">Điện thoại: 1900 1234</Typography>
                <Typography component="p">Địa chỉ: Thành phố Hồ Chí Minh, Việt Nam</Typography>
                <Typography component="p">Giờ làm việc: Thứ 2 - Thứ 6: 7:00 - 18:00</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        <Box
          sx={{
            borderTop: '1px solid var(--color-gray-700)',
            padding: '20px 0'
          }}
        >
          <Box
            sx={{
              textAlign: 'center'
            }}
          >
            <Typography
              component="p"
              sx={{
                margin: 0,
                color: 'var(--color-gray-500)',
                fontSize: 'var(--font-size-sm)',
                fontFamily: 'var(--font-family)'
              }}
            >
              &copy; 2024 BRIGHWAY. Tất cả quyền được bảo lưu.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
