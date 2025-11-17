export const STUDENT_DEFAULT_VALUES = {
  name: '',
  dateOfBirth: '',
  userId: '',
  branchId: '',
  schoolId: '',
  studentLevelId: '',
  image: '',
  note: ''
};

const toISODateString = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
};

export const transformStudentPayload = (values) => ({
  name: values.name?.trim(),
  dateOfBirth: toISODateString(values.dateOfBirth),
  image: values.image?.trim() || null,
  note: values.note?.trim() || null,
  userId: values.userId || null,
  branchId: values.branchId || null,
  schoolId: values.schoolId || null,
  studentLevelId: values.studentLevelId || null
});


