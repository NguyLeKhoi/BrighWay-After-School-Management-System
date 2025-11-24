import React, { useMemo, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Box, Typography, Autocomplete, TextField, Checkbox, ListItemText, CircularProgress } from '@mui/material';
import { DashboardCustomize as TemplateIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import StepperForm from '../../../../components/Common/StepperForm';
import benefitService from '../../../../services/benefit.service';
import packageTemplateService from '../../../../services/packageTemplate.service';
import { createTemplateFormFields } from '../../../../constants/package/formFields';
import Form from '../../../../components/Common/Form';
import { packageTemplateSchema } from '../../../../utils/validationSchemas/packageSchemas';
import { toast } from 'react-toastify';

// Step 1: Basic Info (create template here to get id)
const Step1TemplateBasic = forwardRef(({ data, updateData }, ref) => {
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

  const handleSubmit = async (formValues) => {
    if (loading) return false;
    try {
      setLoading(true);
      const created = await packageTemplateService.createTemplate(formValues);
      updateData({ createdTemplateId: created.id, templateForm: formValues });
      toast.success('Tạo mẫu gói thành công, tiếp tục gán lợi ích');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Tạo mẫu gói thất bại');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Use only basic fields
  const fields = useMemo(() => {
    const all = createTemplateFormFields({ templateActionLoading: loading });
    const keep = new Set(['name', 'isActive', 'desc']);
    return all.filter(f => keep.has(f.name) || f.section === 'Thông tin cơ bản');
  }, [loading]);

  return (
    <Box>
      <Form
        ref={formRef}
        key={`create-template-step`}
        schema={packageTemplateSchema}
        defaultValues={data.templateForm || {}}
        onSubmit={handleSubmit}
        hideSubmitButton
        loading={loading}
        disabled={loading}
        fields={fields}
      />
    </Box>
  );
});

// Step 2: Pricing & Duration (update existing template)
const Step2PricingDuration = forwardRef(({ data, updateData }, ref) => {
  const [loading, setLoading] = useState(false);
  const formRef = React.useRef(null);
  useImperativeHandle(ref, () => ({ async submit() { return true; } }));
  useImperativeHandle(ref, () => ({
    async submit() {
      if (formRef.current?.submit) {
        return await formRef.current.submit();
      }
      return false;
    }
  }));

  const handleSubmit = async (values) => {
    if (!data?.createdTemplateId) return false;
    try {
      setLoading(true);
      const payload = (({ minPrice, defaultPrice, maxPrice, minDurationInMonths, defaultDurationInMonths, maxDurationInMonths }) =>
        ({ minPrice, defaultPrice, maxPrice, minDurationInMonths, defaultDurationInMonths, maxDurationInMonths }))(values);
      await packageTemplateService.updateTemplate(data.createdTemplateId, payload);
      updateData({ templateForm: { ...(data.templateForm || {}), ...payload } });
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Lưu thất bại');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fields = useMemo(() => {
    const all = createTemplateFormFields({ templateActionLoading: loading });
    const keep = new Set(['minPrice', 'defaultPrice', 'maxPrice', 'minDurationInMonths', 'defaultDurationInMonths', 'maxDurationInMonths']);
    return all.filter(f => keep.has(f.name));
  }, [loading]);

  return (
    <Box>
      <Form
        ref={formRef}
        key={`template-pricing`}
        schema={packageTemplateSchema}
        defaultValues={data.templateForm || {}}
        onSubmit={handleSubmit}
        hideSubmitButton
        loading={loading}
        disabled={loading}
        fields={fields}
      />
    </Box>
  );
});

// Step 3: Slot limits (update existing template)
const Step3Slots = forwardRef(({ data, updateData }, ref) => {
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

  const handleSubmit = async (values) => {
    if (!data?.createdTemplateId) return false;
    try {
      setLoading(true);
      const payload = (({ minSlots, defaultTotalSlots, maxSlots }) => ({ minSlots, defaultTotalSlots, maxSlots }))(values);
      await packageTemplateService.updateTemplate(data.createdTemplateId, payload);
      updateData({ templateForm: { ...(data.templateForm || {}), ...payload } });
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Lưu thất bại');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fields = useMemo(() => {
    const all = createTemplateFormFields({ templateActionLoading: loading });
    const keep = new Set(['minSlots', 'defaultTotalSlots', 'maxSlots']);
    return all.filter(f => keep.has(f.name));
  }, [loading]);

  return (
    <Box>
      <Form
        ref={formRef}
        key={`template-slots`}
        schema={packageTemplateSchema}
        defaultValues={data.templateForm || {}}
        onSubmit={handleSubmit}
        hideSubmitButton
        loading={loading}
        disabled={loading}
        fields={fields}
      />
    </Box>
  );
});

const Step4AssignBenefits = forwardRef(({ data }, ref) => {
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState([]);

  React.useEffect(() => {
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
      if (!data?.createdTemplateId) {
        toast.error('Không tìm thấy mẫu gói vừa tạo');
        return false;
      }
      try {
        await packageTemplateService.updateTemplate(data.createdTemplateId, { benefitIds: selected });
        toast.success('Gán lợi ích cho mẫu gói thành công');
        return true;
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || 'Gán lợi ích thất bại');
        return false;
      }
    }
  }));

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Gán Lợi Ích cho Mẫu Gói</Typography>
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

const CreateTemplate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});

  const steps = useMemo(() => ([
    { label: 'Thông tin cơ bản', component: Step1TemplateBasic },
    { label: 'Giá & Thời hạn', component: Step2PricingDuration },
    { label: 'Giới hạn slot', component: Step3Slots },
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
        title="Tạo Mẫu Gói"
        icon={<TemplateIcon />}
        initialData={formData}
      />
    </Box>
  );
};

export default CreateTemplate;


