import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const StaffDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to user management page immediately
    navigate('/staff/users', { replace: true });
  }, [navigate]);

  return null; // This component will redirect immediately
};

export default StaffDashboard;
