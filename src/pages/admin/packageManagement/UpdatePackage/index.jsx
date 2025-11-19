import React, { useMemo, useState, useCallback, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Box, Typography, Autocomplete, TextField, Checkbox, ListItemText, CircularProgress } from '@mui/material';
import { ShoppingCart as PackageIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import StepperForm from '../../../../components/Common/StepperForm';
import benefitService from '../../../../services/benefit.service';
import packageService from '../../../../services/package.service';
import usePackageDependencies from '../../../../hooks/usePackageDependencies';
import useFacilityBranchData from '../../../../hooks/useFacilityBranchData';
import Form from '../../../../components/Common/Form';
import { createPackageFormFields } from '../../../../constants/package/formFields';
import { packageSchema } from '../../../../utils/validationSchemas/packageSchemas';
import { toast } from 'react-toastify';

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
      await packageService.updatePackage(data.packageId, formValues);
      updateData({ packageForm: formValues });
      toast.success('Cập nhật thông tin gói thành công');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Cập nhật gói thất bại');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Form
        ref={formRef}
        key={`update-package-step-${data.packageId}`}
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
    try {
      setLoading(true);
      await packageService.updatePackage(data.packageId, values);
      updateData({ packageForm: { ...(data.packageForm || {}), ...values } });
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Lưu thất bại');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Form
        ref={formRef}
        key={`package-assoc-${data.packageId}`}
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
      await packageService.updatePackage(data.packageId, values);
      updateData({ packageForm: { ...(data.packageForm || {}), ...values } });
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Lưu thất bại');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Form
        ref={formRef}
        key={`package-pricing-${data.packageId}`}
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

const Step4AssignBenefits = forwardRef(({ data }, ref) => {
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const benefits = await benefitService.getAllBenefits();
        setOptions(benefits || []);
        const existing = (data.packageForm?.benefitIds || data.benefitIds || []).filter(Boolean);
        setSelected(existing);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [data.packageForm, data.benefitIds]);

  useImperativeHandle(ref, () => ({
    async submit() {
      try {
        await packageService.assignBenefitsToPackage({ packageId: data.packageId, benefitIds: selected });
        toast.success('Cập nhật lợi ích cho gói thành công');
        return true;
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || 'Cập nhật lợi ích thất bại');
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

const UpdatePackage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const pkg = await packageService.getPackageById(id);
        setFormData({
          packageId: id,
          packageForm: pkg,
          benefitIds: (pkg?.benefits || []).map(b => b.id).filter(Boolean)
        });
      } finally {
        setInitialLoading(false);
      }
    };
    load();
  }, [id]);

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

  if (initialLoading || !formData) {
    return (
      <Box sx={{ minHeight: 'calc(100vh - 64px - 48px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Đang tải dữ liệu...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px - 48px)', display: 'flex', flexDirection: 'column' }}>
      <StepperForm
        steps={steps}
        onComplete={handleComplete}
        onCancel={handleCancel}
        title="Cập nhật Gói Bán"
        icon={<PackageIcon />}
        initialData={formData}
      />
    </Box>
  );
};

export default UpdatePackage;


