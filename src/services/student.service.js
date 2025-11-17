import axiosInstance from '../config/axios.config';

const STUDENT_BASE_PATH = '/Student';
const DEFAULT_PAGE_SIZE = 50;

const buildQueryString = (params = {}) => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    queryParams.append(key, value.toString());
  });

  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
};

const getStudentsPaged = async (params = {}) => {
  try {
    const queryString = buildQueryString(params);
    const response = await axiosInstance.get(`${STUDENT_BASE_PATH}/paged${queryString}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const getAllStudents = async () => {
  try {
    let pageIndex = 1;
    let hasMore = true;
    const aggregatedStudents = [];

    while (hasMore) {
      const result = await getStudentsPaged({
        pageIndex,
        pageSize: DEFAULT_PAGE_SIZE
      });

      const items = result?.items ?? [];
      aggregatedStudents.push(...items);

      const totalCount = result?.totalCount ?? items.length;
      hasMore =
        aggregatedStudents.length < totalCount &&
        items.length === DEFAULT_PAGE_SIZE;
      pageIndex += 1;

      if (items.length === 0) {
        hasMore = false;
      }
    }

    return aggregatedStudents;
  } catch (error) {
    throw error;
  }
};

const getCurrentUserStudents = async (params = {}) => {
  const { pageIndex = 1, pageSize = 10 } = params;
  const query = buildQueryString({ pageIndex, pageSize });

  try {
    const response = await axiosInstance.get(`${STUDENT_BASE_PATH}/paged/current-user${query}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const getStudentById = async (studentId) => {
  try {
    const response = await axiosInstance.get(`${STUDENT_BASE_PATH}/${studentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const createStudent = async (studentData) => {
  try {
    const response = await axiosInstance.post(STUDENT_BASE_PATH, studentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const updateStudent = async (studentId, studentData) => {
  try {
    const response = await axiosInstance.put(`${STUDENT_BASE_PATH}/${studentId}`, studentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const studentService = {
  getAllStudents,
  getStudentsPaged,
  getCurrentUserStudents,
  getStudentById,
  createStudent,
  updateStudent
};

export default studentService;

