import React, { useImperativeHandle, useMemo, useEffect } from 'react';
import { Alert, Box, Typography } from '@mui/material';
import Form from '../../../../components/Common/Form';
import { userChildStep2Schema } from '../../../../utils/validationSchemas/userChildSchemas';
import useBranchStudentLevels from '../../../../hooks/useBranchStudentLevels';
import useBranchSchools from '../../../../hooks/useBranchSchools';

const Step2Associations = React.forwardRef(
  (
    {
      data,
      updateData,
      stepIndex,
      totalSteps,
      branchOptions = [],
      schoolOptions = [],
      studentLevelOptions = [],
      dependenciesLoading = false,
      userBranchId = null,
      userBranchName = ''
    },
    ref
  ) => {
    const formRef = React.useRef(null);
    
    // Lấy schools và studentLevels theo branchId
    const finalBranchId = userBranchId || data.branchId || null;
    console.log('Step2Associations - finalBranchId:', finalBranchId, 'userBranchId:', userBranchId, 'data.branchId:', data.branchId);
    const { schools: branchSchools, loading: loadingBranchSchools, error: schoolsError } = useBranchSchools(finalBranchId);
    const { studentLevels: branchStudentLevels, loading: loadingBranchLevels, error: levelsError } = useBranchStudentLevels(finalBranchId);
    
    console.log('Step2Associations - branchSchools:', branchSchools, 'branchStudentLevels:', branchStudentLevels);
    console.log('Step2Associations - loadingBranchSchools:', loadingBranchSchools, 'loadingBranchLevels:', loadingBranchLevels);
    
    // Map schools từ branch thành options format
    const branchSchoolOptions = useMemo(() => {
      return branchSchools.map(school => ({
        value: school.id || school.schoolId,
        label: school.name || school.schoolName || 'Không xác định'
      }));
    }, [branchSchools]);
    
    // Map studentLevels từ branch thành options format
    const branchStudentLevelOptions = useMemo(() => {
      return branchStudentLevels.map(level => ({
        value: level.id || level.studentLevelId,
        label: level.name || level.levelName || 'Không xác định'
      }));
    }, [branchStudentLevels]);
    
    // Chỉ sử dụng schools và studentLevels từ branch nếu có branchId
    // Không fallback về tất cả schools/studentLevels
    const availableSchoolOptions = finalBranchId 
      ? branchSchoolOptions 
      : [];
    
    const availableStudentLevelOptions = finalBranchId 
      ? branchStudentLevelOptions 
      : [];

    const fields = useMemo(
      () => {
        const baseFields = [];
        
        // Nếu có userBranchId, ẩn trường branchId (không hiển thị trong UI)
        // Nếu không có userBranchId, hiển thị dropdown để chọn
        if (!userBranchId) {
          baseFields.push({
            section: 'Thông tin liên kết',
            sectionDescription: 'Chọn chi nhánh, trường học và cấp độ cho con bạn.',
            name: 'branchId',
            label: 'Chi nhánh',
            type: 'select',
            required: true,
            options: branchOptions,
            disabled: dependenciesLoading || branchOptions.length === 0,
            helperText: branchOptions.length === 0 ? 'Chưa có chi nhánh khả dụng' : undefined,
            gridSize: 12
          });
        }
        
        return [
          ...baseFields,
          {
            name: 'schoolId',
            label: 'Trường học',
            type: 'select',
            required: true,
            options: availableSchoolOptions,
            disabled: dependenciesLoading || loadingBranchSchools || !finalBranchId || availableSchoolOptions.length === 0,
            helperText: !finalBranchId
              ? 'Vui lòng chọn chi nhánh trước'
              : loadingBranchSchools 
                ? 'Đang tải danh sách trường học...' 
                : availableSchoolOptions.length === 0 
                  ? 'Chi nhánh này chưa có trường học được gán' 
                  : undefined,
            gridSize: userBranchId ? 6 : 6
          },
          {
            name: 'studentLevelId',
            label: 'Cấp độ học sinh',
            type: 'select',
            required: true,
            options: availableStudentLevelOptions,
            disabled: dependenciesLoading || loadingBranchLevels || !finalBranchId || availableStudentLevelOptions.length === 0,
            helperText: !finalBranchId
              ? 'Vui lòng chọn chi nhánh trước'
              : loadingBranchLevels 
                ? 'Đang tải danh sách cấp độ...' 
                : availableStudentLevelOptions.length === 0 
                  ? 'Chi nhánh này chưa có cấp độ học sinh được gán' 
                  : undefined,
            gridSize: userBranchId ? 6 : 6
          }
        ];
      },
      [dependenciesLoading, branchOptions, availableSchoolOptions, availableStudentLevelOptions, userBranchId, userBranchName, loadingBranchLevels, loadingBranchSchools, finalBranchId]
    );

    const defaultValues = useMemo(
      () => {
        // Luôn ưu tiên userBranchId nếu có
        const finalBranchId = userBranchId || data.branchId || '';
        return {
          branchId: finalBranchId,
          schoolId: data.schoolId || '',
          studentLevelId: data.studentLevelId || ''
        };
      },
      [data, userBranchId]
    );
    
    // Auto update branchId khi userBranchId thay đổi hoặc khi component mount
    useEffect(() => {
      if (userBranchId) {
        // Update data với branchId từ user, đảm bảo luôn dùng userBranchId
        updateData({ branchId: userBranchId });
        
        // Nếu form đã được mount, cập nhật giá trị trực tiếp
        if (formRef.current?.setValue) {
          formRef.current.setValue('branchId', userBranchId, { shouldValidate: false });
        } else {
          // Nếu form chưa mount, đợi một chút rồi update
          const timer = setTimeout(() => {
            if (formRef.current?.setValue) {
              formRef.current.setValue('branchId', userBranchId, { shouldValidate: false });
            }
          }, 200);
          return () => clearTimeout(timer);
        }
      }
    }, [userBranchId, updateData]);

    // Khi branchId thay đổi (user chọn branch), clear schoolId và studentLevelId
    useEffect(() => {
      if (data.branchId && !userBranchId && data.branchId !== userBranchId) {
        // Nếu user chọn branch mới, clear các lựa chọn trước đó
        if (formRef.current?.setValue) {
          formRef.current.setValue('schoolId', '', { shouldValidate: false });
          formRef.current.setValue('studentLevelId', '', { shouldValidate: false });
        }
        updateData({ schoolId: '', studentLevelId: '' });
      }
    }, [data.branchId, userBranchId, updateData]);

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
          Bước {stepIndex + 1}/{totalSteps}: {userBranchId ? 'Trường học & Cấp độ' : 'Chi nhánh & Trường học'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.875rem' }}>
          {userBranchId 
            ? 'Chi nhánh của bạn đã được tự động chọn. Vui lòng chọn trường học và cấp độ tương ứng cho con bạn.'
            : 'Chọn chi nhánh, trường học và cấp độ tương ứng cho con bạn.'}
        </Typography>

        {schoolsError && (
          <Alert severity="error" sx={{ mb: 1 }}>
            Lỗi tải danh sách trường học: {schoolsError}
          </Alert>
        )}
        {levelsError && (
          <Alert severity="error" sx={{ mb: 1 }}>
            Lỗi tải danh sách cấp độ: {levelsError}
          </Alert>
        )}
        {(availableSchoolOptions.length === 0 || availableStudentLevelOptions.length === 0) && !loadingBranchSchools && !loadingBranchLevels && !schoolsError && !levelsError && (
          <Alert severity="info" sx={{ mb: 1 }}>
            {userBranchId 
              ? 'Vui lòng đảm bảo chi nhánh của bạn đã được gán trường học và cấp độ trước khi đăng ký.'
              : 'Vui lòng đảm bảo đã thiết lập đầy đủ chi nhánh, trường học và cấp độ trước khi đăng ký.'}
          </Alert>
        )}

        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Form
            ref={formRef}
            schema={userChildStep2Schema}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            fields={fields}
            showReset={false}
            hideSubmitButton
            disabled={dependenciesLoading || loadingBranchLevels || loadingBranchSchools}
          />
        </Box>
      </Box>
    );
  }
);

Step2Associations.displayName = 'CreateChildStep2Associations';

export default Step2Associations;
