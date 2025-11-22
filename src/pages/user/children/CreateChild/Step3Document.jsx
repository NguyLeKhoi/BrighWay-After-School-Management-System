import React, { useImperativeHandle, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import Form from '../../../../components/Common/Form';
import { userChildStep3Schema } from '../../../../utils/validationSchemas/userChildSchemas';

const DOCUMENT_TYPE_OPTIONS = [
  { value: 'BirthCertificate', label: 'Giấy khai sinh' },
  { value: 'HouseholdBook', label: 'Sổ hộ khẩu' },
  { value: 'GuardianCertificate', label: 'Giấy chứng nhận người giám hộ' },
  { value: 'AuthorizationLetter', label: 'Giấy ủy quyền' },
  { value: 'AdoptionCertificate', label: 'Giấy chứng nhận nhận nuôi' },
  { value: 'DivorceCustodyDecision', label: 'Quyết định quyền nuôi con sau ly hôn' },
  { value: 'StudentCard', label: 'Thẻ học sinh' },
  { value: 'SchoolEnrollmentConfirmation', label: 'Xác nhận nhập học' },
  { value: 'AcademicRecordBook', label: 'Sổ học bạ' },
  { value: 'VnEduScreenshot', label: 'Ảnh chụp màn hình VnEdu' },
  { value: 'TuitionReceipt', label: 'Biên lai học phí' },
  { value: 'CertificateOrLetter', label: 'Giấy chứng nhận/Thư xác nhận' },
  { value: 'Other', label: 'Khác' }
];

const Step3Document = React.forwardRef(
  ({ data, updateData, stepIndex, totalSteps, dependenciesLoading = false }, ref) => {
    const formRef = React.useRef(null);

    const fields = useMemo(
      () => [
        {
          section: 'Tài liệu xác minh',
          sectionDescription: 'Tải lên tài liệu xác minh cho con bạn (tùy chọn nhưng khuyến khích).',
          name: 'documentType',
          label: 'Loại tài liệu',
          type: 'select',
          options: DOCUMENT_TYPE_OPTIONS,
          placeholder: 'Chọn loại tài liệu',
          gridSize: 6,
          disabled: dependenciesLoading
        },
        {
          name: 'issuedBy',
          label: 'Nơi cấp',
          type: 'text',
          placeholder: 'Ví dụ: UBND Quận 1, TP.HCM',
          gridSize: 6,
          disabled: dependenciesLoading
        },
        {
          name: 'issuedDate',
          label: 'Ngày cấp',
          type: 'date',
          gridSize: 6,
          disabled: dependenciesLoading
        },
        {
          name: 'expirationDate',
          label: 'Ngày hết hạn (nếu có)',
          type: 'date',
          gridSize: 6,
          disabled: dependenciesLoading
        },
        {
          name: 'documentFile',
          label: 'File tài liệu',
          type: 'file',
          accept: 'image/*,.pdf,.doc,.docx',
          gridSize: 12,
          disabled: dependenciesLoading,
          helperText: 'Chấp nhận file ảnh (JPG, PNG), PDF hoặc Word (DOC, DOCX)'
        }
      ],
      [dependenciesLoading]
    );

    const defaultValues = useMemo(
      () => ({
        documentType: data.documentType || '',
        issuedBy: data.issuedBy || '',
        issuedDate: data.issuedDate || '',
        expirationDate: data.expirationDate || '',
        documentFile: data.documentFile || null
      }),
      [data]
    );

    const handleSubmit = async (formValues) => {
      updateData(formValues);
      return true;
    };

    useImperativeHandle(ref, () => ({
      submit: async () => {
        if (formRef.current?.submit) {
          return await formRef.current.submit();
        }
        return false;
      }
    }));

    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 0.75, fontWeight: 600, fontSize: '1.1rem' }}>
          Bước {stepIndex + 1}/{totalSteps}: Tài liệu xác minh
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.875rem' }}>
          Tải lên tài liệu xác minh để quá trình duyệt được nhanh chóng hơn. Bạn có thể bỏ qua bước này và bổ sung sau.
        </Typography>

        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Form
            ref={formRef}
            schema={userChildStep3Schema}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            fields={fields}
            hideSubmitButton
            disabled={dependenciesLoading}
          />
        </Box>
      </Box>
    );
  }
);

Step3Document.displayName = 'CreateChildStep3Document';

export default Step3Document;

