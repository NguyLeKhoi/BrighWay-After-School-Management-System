import { useCallback, useState } from 'react';
import userService from '../services/user.service';
import schoolService from '../services/school.service';
import studentLevelService from '../services/studentLevel.service';

const useStudentDependencies = () => {
  const [parentOptions, setParentOptions] = useState([]);
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [studentLevelOptions, setStudentLevelOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mapOptions = (items = [], labelKey = 'name') =>
    items
      .filter((item) => item && item.id)
      .map((item) => ({
        value: item.id,
        label: item[labelKey] || item.name || item.fullName || 'Không xác định'
      }));

  const fetchDependencies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [parentsResponse, schoolsResponse, studentLevelsResponse] = await Promise.all([
        userService.getUsersPagedByRole({
          pageIndex: 1,
          pageSize: 200,
          Role: 'User'
        }),
        schoolService.getAllSchools(),
        studentLevelService.getAllStudentLevels()
      ]);

      const parentItems = parentsResponse?.items || parentsResponse || [];
      setParentOptions(
        parentItems.map((item) => ({
          value: item.id,
          label: item.name || item.fullName || item.email || 'Không rõ tên'
        }))
      );
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
    parentOptions,
    schoolOptions,
    studentLevelOptions,
    loading,
    error,
    fetchDependencies
  };
};

export default useStudentDependencies;


