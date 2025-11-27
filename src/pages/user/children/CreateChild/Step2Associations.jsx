import React, { useImperativeHandle, useMemo, useEffect } from 'react';
import { Alert, Box, Typography } from '@mui/material';
import Form from '../../../../components/Common/Form';
import { userChildStep2Schema } from '../../../../utils/validationSchemas/userChildSchemas';
import useBranchStudentLevels from '../../../../hooks/useBranchStudentLevels';
import useBranchSchools from '../../../../hooks/useBranchSchools';
import { useWatch } from 'react-hook-form';

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
      dependenciesLoading = false
    },
    ref
  ) => {
    const formRef = React.useRef(null);
    
    // Watch branchId directly from form using useWatch (if control is available)
    // Fallback to polling form values if control is not available
    const [selectedBranchId, setSelectedBranchId] = React.useState(() => {
      // Initialize from data.branchId
      if (data.branchId) {
        if (typeof data.branchId === 'string' && data.branchId.trim() !== '') {
          return data.branchId.trim();
        } else if (typeof data.branchId === 'object' && data.branchId !== null) {
          const extracted = data.branchId.value || data.branchId.id;
          return extracted ? String(extracted) : null;
        }
      }
      return null;
    });
    
    // Watch form value directly using polling (since we can't use useWatch without control)
    React.useEffect(() => {
      const interval = setInterval(() => {
        if (formRef.current?.getValues) {
          try {
            const formValues = formRef.current.getValues();
            const formBranchId = formValues?.branchId;
            
            if (formBranchId) {
              // Normalize formBranchId
              let normalized = null;
              if (typeof formBranchId === 'string' && formBranchId.trim() !== '') {
                normalized = formBranchId.trim();
              } else if (typeof formBranchId === 'object' && formBranchId !== null) {
                const extracted = formBranchId.value || formBranchId.id;
                normalized = extracted ? String(extracted) : null;
              } else if (formBranchId) {
                const str = String(formBranchId);
                if (str !== '[object Object]' && str !== 'null' && str !== 'undefined') {
                  normalized = str;
                }
              }
              
              if (normalized && normalized !== selectedBranchId) {
                setSelectedBranchId(normalized);
              }
            } else if (!formBranchId && selectedBranchId !== null) {
              // Form value is empty, clear selectedBranchId
              setSelectedBranchId(null);
            }
          } catch (error) {
            // Form might not be ready yet
          }
        }
      }, 200); // Poll every 200ms
      
      return () => clearInterval(interval);
    }, [selectedBranchId]);
    
    // Also sync when data.branchId changes (from parent updates)
    React.useEffect(() => {
      if (data.branchId) {
        if (typeof data.branchId === 'string' && data.branchId.trim() !== '') {
          const normalized = data.branchId.trim();
          if (normalized !== selectedBranchId) {
            setSelectedBranchId(normalized);
          }
        } else if (typeof data.branchId === 'object' && data.branchId !== null) {
          const extracted = data.branchId.value || data.branchId.id;
          if (extracted) {
            const normalized = String(extracted);
            if (normalized !== selectedBranchId) {
              setSelectedBranchId(normalized);
            }
          }
        }
      } else if (!data.branchId && selectedBranchId !== null) {
        // Only clear if form also doesn't have a value
        if (formRef.current?.getValues) {
          const formValues = formRef.current.getValues();
          if (!formValues?.branchId) {
            setSelectedBranchId(null);
          }
        } else {
          setSelectedBranchId(null);
        }
      }
    }, [data.branchId, selectedBranchId]);
    
    // Normalize branchId to string
    const normalizeBranchId = React.useCallback((branchId) => {
      if (!branchId) return null;
      
      // If it's already a string, use it
      if (typeof branchId === 'string' && branchId.trim() !== '') {
        return branchId.trim();
      }
      
      // If it's an object, try to extract value or id
      if (typeof branchId === 'object' && branchId !== null) {
        const extracted = branchId.value || branchId.id;
        if (extracted) {
          return String(extracted);
        }
        return null;
      }
      
      // Fallback: try to convert to string
      const str = String(branchId);
      // If it's [object Object], return null instead
      if (str === '[object Object]' || str === 'null' || str === 'undefined') {
        return null;
      }
      
      return str;
    }, []);
    
    // Use selectedBranchId (local state) for hooks - this updates immediately when user selects
    const finalBranchId = selectedBranchId;
    
    const { schools: branchSchools, loading: loadingBranchSchools, error: schoolsError } = useBranchSchools(finalBranchId);
    const { studentLevels: branchStudentLevels, loading: loadingBranchLevels, error: levelsError } = useBranchStudentLevels(finalBranchId);
    
    
    
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
        label: level.name || level.levelName || 'Không xác định',
        description: level.description || level.desc || null
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
        return [
          {
            section: 'Thông tin liên kết',
            sectionDescription: 'Chọn chi nhánh, trường học và cấp độ cho con bạn.',
            name: 'branchId',
            label: 'Chi nhánh',
            type: 'select',
            required: true,
            options: branchOptions,
            disabled: dependenciesLoading || branchOptions.length === 0,
            helperText: branchOptions.length === 0 ? 'Chưa có chi nhánh khả dụng' : undefined,
            gridSize: 12,
            onChange: (value) => {
              // Normalize value to string - handle all cases
              let branchIdValue = '';
              if (value) {
                if (typeof value === 'string' && value.trim() !== '') {
                  branchIdValue = value.trim();
                } else if (typeof value === 'object' && value !== null) {
                  // Extract from object if possible
                  branchIdValue = value.value || value.id || '';
                  // If still empty or invalid, try to convert
                  if (!branchIdValue || branchIdValue === '[object Object]') {
                    branchIdValue = '';
                  } else {
                    branchIdValue = String(branchIdValue);
                  }
                } else if (typeof value === 'number') {
                  branchIdValue = String(value);
                } else {
                  const str = String(value);
                  // Reject [object Object] or other invalid strings
                  if (str !== '[object Object]' && str !== 'null' && str !== 'undefined') {
                    branchIdValue = str;
                  }
                }
              }
              
              // Update local state immediately for hooks to react (CRITICAL: do this first!)
              setSelectedBranchId(branchIdValue || null);
              
              // Update parent data immediately
              updateData({ branchId: branchIdValue, schoolId: '', studentLevelId: '' });
            }
          },
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
            gridSize: 6
          },
          {
            name: 'studentLevelId',
            label: 'Cấp độ trẻ em',
            type: 'select',
            required: true,
            options: availableStudentLevelOptions,
            disabled: dependenciesLoading || loadingBranchLevels || !finalBranchId || availableStudentLevelOptions.length === 0,
            helperText: !finalBranchId
              ? 'Vui lòng chọn chi nhánh trước'
              : loadingBranchLevels 
                ? 'Đang tải danh sách cấp độ...' 
                : availableStudentLevelOptions.length === 0 
                  ? 'Chi nhánh này chưa có cấp độ trẻ em được gán' 
                  : undefined,
            gridSize: 6
          }
        ];
      },
      [dependenciesLoading, branchOptions, availableSchoolOptions, availableStudentLevelOptions, loadingBranchLevels, loadingBranchSchools, finalBranchId]
    );

    const defaultValues = useMemo(
      () => {
        // Ensure branchId is a string
        const branchIdValue = data.branchId 
          ? (typeof data.branchId === 'string' ? data.branchId : String(data.branchId))
          : '';
        return {
          branchId: branchIdValue,
          schoolId: data.schoolId || '',
          studentLevelId: data.studentLevelId || ''
        };
      },
      [data]
    );
    
    // Sync selectedBranchId with defaultValues.branchId when form is initialized or reset
    // But only if form doesn't already have a value (to avoid resetting user selection)
    React.useEffect(() => {
      const branchIdValue = defaultValues.branchId;
      
      // Check if form already has a value
      let formHasValue = false;
      if (formRef.current?.getValues) {
        try {
          const formValues = formRef.current.getValues();
          const formBranchId = formValues?.branchId;
          formHasValue = formBranchId && formBranchId.trim() !== '';
        } catch (error) {
          // Form might not be ready
        }
      }
      
      // Only sync from defaultValues if form doesn't have a value
      // This prevents resetting user selection when defaultValues change
      if (!formHasValue && branchIdValue && branchIdValue.trim() !== '') {
        const normalized = branchIdValue.trim();
        if (normalized !== selectedBranchId) {
          setSelectedBranchId(normalized);
        }
      } else if (!formHasValue && selectedBranchId !== null && !branchIdValue) {
        // Clear if defaultValues has no branchId and form also has no value
        setSelectedBranchId(null);
      }
    }, [defaultValues.branchId, selectedBranchId]);

    // Track previous branchId to detect changes and clear school/level when branch changes
    const prevBranchIdRef = React.useRef(data.branchId);
    
    useEffect(() => {
      // Only clear if branchId actually changed (not on initial mount)
      if (data.branchId && prevBranchIdRef.current !== null && prevBranchIdRef.current !== data.branchId) {
        // Clear school and student level when branch changes
        if (formRef.current?.setValue) {
          formRef.current.setValue('schoolId', '', { shouldValidate: false });
          formRef.current.setValue('studentLevelId', '', { shouldValidate: false });
        }
      }
      // Update ref for next comparison
      prevBranchIdRef.current = data.branchId;
    }, [data.branchId]);

    const handleSubmit = async (formValues) => {
      // Ensure all IDs are strings before updating data
      const normalizedValues = {
        ...formValues,
        branchId: formValues.branchId ? String(formValues.branchId) : '',
        schoolId: formValues.schoolId ? String(formValues.schoolId) : '',
        studentLevelId: formValues.studentLevelId ? String(formValues.studentLevelId) : ''
      };
      updateData(normalizedValues);
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
          Bước {stepIndex + 1}/{totalSteps}: Chi nhánh & Trường học
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.875rem' }}>
          Chọn chi nhánh, trường học và cấp độ tương ứng cho con bạn.
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
        {(availableSchoolOptions.length === 0 || availableStudentLevelOptions.length === 0) && !loadingBranchSchools && !loadingBranchLevels && !schoolsError && !levelsError && finalBranchId && (
          <Alert severity="info" sx={{ mb: 1 }}>
            Chi nhánh đã chọn chưa có trường học hoặc cấp độ được gán. Vui lòng chọn chi nhánh khác hoặc liên hệ quản lý để được hỗ trợ.
          </Alert>
        )}

        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Form
            ref={formRef}
            schema={userChildStep2Schema}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            fields={fields}
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
