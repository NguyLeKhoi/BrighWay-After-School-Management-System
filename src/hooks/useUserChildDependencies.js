import { useCallback, useState } from 'react';
import branchService from '../services/branch.service';
import schoolService from '../services/school.service';
import studentLevelService from '../services/studentLevel.service';

const useUserChildDependencies = () => {
  const [branchOptions, setBranchOptions] = useState([]);
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [studentLevelOptions, setStudentLevelOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mapOptions = (items = [], labelKey = 'name') =>
    items
      .filter((item) => item && item.id)
      .map((item) => ({
        value: item.id,
        label: item[labelKey] || item.name || item.branchName || 'Không xác định'
      }));

  const fetchDependencies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [branchesResponse, schoolsResponse, studentLevelsResponse] = await Promise.all([
        branchService.getAllBranches(),
        schoolService.getAllSchools(),
        studentLevelService.getAllStudentLevels()
      ]);

      setBranchOptions(mapOptions(branchesResponse, 'branchName'));
      setSchoolOptions(mapOptions(schoolsResponse, 'name'));
      setStudentLevelOptions(mapOptions(studentLevelsResponse, 'name'));
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Không thể tải dữ liệu phụ trợ';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    branchOptions,
    schoolOptions,
    studentLevelOptions,
    loading,
    error,
    fetchDependencies
  };
};

export default useUserChildDependencies;

