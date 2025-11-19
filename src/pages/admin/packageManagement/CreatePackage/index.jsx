import React, { useMemo, useState, useCallback, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Box, Typography, Autocomplete, TextField, Checkbox, ListItemText, CircularProgress } from '@mui/material';
import { ShoppingCart as PackageIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import StepperForm from '../../../../components/Common/StepperForm';
import benefitService from '../../../../services/benefit.service';
import packageService from '../../../../services/package.service';
import usePackageDependencies from '../../../../hooks/usePackageDependencies';
import useFacilityBranchData from '../../../../hooks/useFacilityBranchData';
import Form from '../../../../components/Common/Form';
import { createPackageFormFields } from '../../../../constants/package/formFields';
import { packageSchema } from '../../../../utils/validationSchemas/packageSchemas';
import { toast } from 'react-toastify';

// Step 1: Basic info (no benefits here)
const Step1PackageBasic = forwardRef(({ data, updateData }, ref) => {
  const {
    studentLevelOptions,
    branchOptions,
    loading: dependenciesLoading,
    error: dependenciesError
  } = usePackageDependencies();
  const { templateOptions, loadingTemplates } = useFacilityBranchData();
  const [loading, setLoading] = useState(false);
  const formRef = React.useRef(null);
  useImperativeHandle(ref, () => ({
    async submit() {
      if (formRef.current?.submit) {
        return await formRef.current.submit();
      }
      return false;
    }
  }));

  const templateSelectOptions = useMemo(() => (templateOptions || []).map(t => ({ value: t.id, label: t.name })), [templateOptions]);
  const branchSelectOptions = useMemo(() => (branchOptions || []).map(b => ({ value: b.id, label: b.branchName })), [branchOptions]);
  const studentLevelSelectOptions = useMemo(() => (studentLevelOptions || []).map(s => ({ value: s.id, label: s.name })), [studentLevelOptions]);
  const fields = useMemo(() => {
    return createPackageFormFields({
      packageActionLoading: loading,
      dependenciesLoading,
      loadingTemplates,
      templateSelectOptions,
      branchSelectOptions,
      studentLevelSelectOptions,
      benefitSelectOptions: []
    }).filter(f => ['name', 'isActive', 'desc'].includes(f.name));
  }, [loading, dependenciesLoading, loadingTemplates, templateSelectOptions, branchSelectOptions, studentLevelSelectOptions]);

  const handleSubmit = async (formValues) => {
    if (loading) return false;
    try {
      setLoading(true);
      const created = await packageService.createPackage(formValues);
      updateData({ createdPackageId: created.id, packageForm: formValues });
      toast.success('Tạo gói bán thành công, tiếp tục gán lợi ích');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Tạo gói thất bại');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Form
        ref={formRef}
        key={`create-package-step`}
        schema={packageSchema}
        defaultValues={data.packageForm || {}}
        onSubmit={handleSubmit}
        hideSubmitButton
        loading={loading || dependenciesLoading || loadingTemplates}
        disabled={loading || dependenciesLoading || loadingTemplates}
        fields={fields}
        showReset={false}
      />
    </Box>
  );
});

// Step 2: Associations
const Step2Associations = forwardRef(({ data, updateData }, ref) => {
  const {
    studentLevelOptions,
    branchOptions,
    loading: dependenciesLoading
  } = usePackageDependencies();
  const { templateOptions, loadingTemplates } = useFacilityBranchData();
  const [loading, setLoading] = useState(false);
  const formRef = React.useRef(null);
  useImperativeHandle(ref, () => ({
    async submit() {
      if (formRef.current?.submit) {
        return await formRef.current.submit();
      }
      return false;
    }
  }));

  const templateSelectOptions = useMemo(() => (templateOptions || []).map(t => ({ value: t.id, label: t.name })), [templateOptions]);
  const branchSelectOptions = useMemo(() => (branchOptions || []).map(b => ({ value: b.id, label: b.branchName })), [branchOptions]);
  const studentLevelSelectOptions = useMemo(() => (studentLevelOptions || []).map(s => ({ value: s.id, label: s.name })), [studentLevelOptions]);
  const fields = useMemo(() => {
    return createPackageFormFields({
      packageActionLoading: loading,
      dependenciesLoading,
      loadingTemplates,
      templateSelectOptions,
      branchSelectOptions,
      studentLevelSelectOptions,
      benefitSelectOptions: []
    }).filter(f => ['packageTemplateId', 'branchId', 'studentLevelId'].includes(f.name));
  }, [loading, dependenciesLoading, loadingTemplates, templateSelectOptions, branchSelectOptions, studentLevelSelectOptions]);

  const handleSubmit = async (values) => {
    // just carry forward associations
    updateData({ packageForm: { ...(data.packageForm || {}), ...values } });
    return true;
  };

  return (
    <Box>
      <Form
        ref={formRef}
        key={`package-assoc`}
        schema={packageSchema}
        defaultValues={data.packageForm || {}}
        onSubmit={handleSubmit}
        hideSubmitButton
        loading={loading || dependenciesLoading || loadingTemplates}
        disabled={loading || dependenciesLoading || loadingTemplates}
        fields={fields}
        showReset={false}
      />
    </Box>
  );
});

// Step 3: Pricing & Slots (create package here)
const Step3PricingSlots = forwardRef(({ data, updateData }, ref) => {
  const [loading, setLoading] = useState(false);
  const formRef = React.useRef(null);
  useImperativeHandle(ref, () => ({
    async submit() {
      if (formRef.current?.submit) {
        return await formRef.current.submit();
      }
      return false;
    }
  }));

  const fields = useMemo(() => {
    return createPackageFormFields({
      packageActionLoading: loading,
      dependenciesLoading: false,
      loadingTemplates: false,
      templateSelectOptions: [],
      branchSelectOptions: [],
      studentLevelSelectOptions: [],
      benefitSelectOptions: []
    }).filter(f => ['price', 'durationInMonths', 'totalSlots'].includes(f.name));
  }, [loading]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const payload = { ...(data.packageForm || {}), ...values };
      const created = await packageService.createPackage(payload);
      updateData({ packageForm: payload, createdPackageId: created.id });
      toast.success('Tạo gói bán thành công, tiếp tục gán lợi ích');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Tạo gói thất bại');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Form
        ref={formRef}
        key={`package-pricing`}
        schema={packageSchema}
        defaultValues={data.packageForm || {}}
        onSubmit={handleSubmit}
        hideSubmitButton
        loading={loading}
        disabled={loading}
        fields={fields}
        showReset={false}
      />
    </Box>
  );
});

// Step 4: Assign benefits
const Step4AssignBenefits = forwardRef(({ data }, ref) => {
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const benefits = await benefitService.getAllBenefits();
        setOptions(benefits || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useImperativeHandle(ref, () => ({
    async submit() {
      if (!data?.createdPackageId) {
        toast.error('Không tìm thấy gói vừa tạo');
        return false;
      }
      try {
        await packageService.assignBenefitsToPackage({ packageId: data.createdPackageId, benefitIds: selected });
        toast.success('Gán lợi ích cho gói thành công');
        return true;
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || 'Gán lợi ích thất bại');
        return false;
      }
    }
  }));

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Gán Lợi Ích cho Gói Bán</Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
      ) : (
        <Autocomplete
          multiple
          options={options}
          getOptionLabel={(option) => option.name}
          value={options.filter(b => selected.includes(b.id))}
          onChange={(e, newVal) => setSelected(newVal.map(b => b.id))}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <Checkbox checked={selected.includes(option.id)} />
              <ListItemText primary={option.name} secondary={option.description || 'Không có mô tả'} />
            </Box>
          )}
          renderInput={(params) => <TextField {...params} placeholder="Tìm và chọn lợi ích..." />}
        />
      )}
      <Typography variant="body2" color="text.secondary">Đã chọn: <b>{selected.length}</b> lợi ích</Typography>
    </Box>
  );
});

const CreatePackage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});

  const steps = useMemo(() => ([
    { label: 'Thông tin cơ bản', component: Step1PackageBasic },
    { label: 'Liên kết dữ liệu', component: Step2Associations },
    { label: 'Giá & Slot', component: Step3PricingSlots },
    { label: 'Gán lợi ích', component: Step4AssignBenefits }
  ]), []);

  const handleComplete = useCallback(() => {
    navigate('/admin/packages');
  }, [navigate]);

  const handleCancel = useCallback(() => {
    navigate('/admin/packages');
  }, [navigate]);

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px - 48px)', display: 'flex', flexDirection: 'column' }}>
      <StepperForm
        steps={steps}
        onComplete={handleComplete}
        onCancel={handleCancel}
        title="Tạo Gói Bán"
        icon={<PackageIcon />}
        initialData={formData}
      />
    </Box>
  );
};

export default CreatePackage;


