import * as yup from 'yup';

export const addDocumentSchema = yup.object({
  type: yup
    .string()
    .trim()
    .required('Vui lòng chọn loại tài liệu'),
  issuedBy: yup
    .string()
    .trim()
    .max(200, 'Nơi cấp không được vượt quá 200 ký tự')
    .nullable()
    .notRequired()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  issuedDate: yup
    .date()
    .typeError('Ngày cấp không hợp lệ')
    .nullable()
    .notRequired()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  expirationDate: yup
    .date()
    .typeError('Ngày hết hạn không hợp lệ')
    .nullable()
    .notRequired()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  file: yup
    .mixed()
    .required('Vui lòng chọn file tài liệu')
    .test('fileSize', 'File không được vượt quá 10MB', (value) => {
      if (!value) return true;
      return value.size <= 10 * 1024 * 1024; // 10MB
    })
    .test('fileType', 'Chỉ chấp nhận file ảnh (JPG, PNG) hoặc PDF', (value) => {
      if (!value) return true;
      const validTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/pdf'
      ];
      // Also check file extension as fallback (some browsers may not set MIME type correctly)
      const fileName = value.name?.toLowerCase() || '';
      const validExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
      const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
      return validTypes.includes(value.type) || hasValidExtension;
    })
});

