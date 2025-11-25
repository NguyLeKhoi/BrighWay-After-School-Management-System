import React, { useMemo, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Box } from '@mui/material';
import { DashboardCustomize as TemplateIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import StepperForm from '../../../../components/Common/StepperForm';
import packageTemplateService from '../../../../services/packageTemplate.service';
import { createTemplateFormFields } from '../../../../constants/package/formFields';
import Form from '../../../../components/Common/Form';
import { packageTemplateSchema } from '../../../../utils/validationSchemas/packageSchemas';
import { getErrorMessage } from '../../../../utils/errorHandler';
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
      // Remove isActive from payload as backend DTO doesn't include it
      const { isActive, ...payload } = formValues;
      const created = await packageTemplateService.createTemplate(payload);
      updateData({ createdTemplateId: created.id, templateForm: formValues });
      toast.success('Tạo mẫu gói thành công');
      return true;
    } catch (err) {
      const errorMessage = getErrorMessage(err) || 'Tạo mẫu gói thất bại';
      toast.error(errorMessage, {
        autoClose: 5000,
        style: { whiteSpace: 'pre-line' }
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Use only basic fields
  const fields = useMemo(() => {
    const all = createTemplateFormFields({ templateActionLoading: loading });
    const keep = new Set(['name', 'desc']);
    return all.filter(f => keep.has(f.name));
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
      const errorMessage = getErrorMessage(err) || 'Lưu thất bại';
      toast.error(errorMessage, {
        autoClose: 5000,
        style: { whiteSpace: 'pre-line' }
      });
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

const CreateTemplate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});

  const steps = useMemo(() => ([
    { label: 'Thông tin cơ bản', component: Step1TemplateBasic },
    { label: 'Giá & Thời hạn', component: Step2PricingDuration },
    { label: 'Giới hạn slot', component: Step3Slots }
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


