import React, { useMemo, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Box } from '@mui/material';
import { DashboardCustomize as TemplateIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import StepperForm from '../../../../components/Common/StepperForm';
import packageTemplateService from '../../../../services/packageTemplate.service';
import { createTemplateFormFields } from '../../../../definitions/package/formFields';
import Form from '../../../../components/Common/Form';
import { packageTemplateSchema, packageTemplateBasicSchema } from '../../../../utils/validationSchemas/packageSchemas';
import { getErrorMessage } from '../../../../utils/errorHandler';
import { toast } from 'react-toastify';

// Step 1: Basic Info (only validate, don't create template yet)
const Step1TemplateBasic = forwardRef(({ data, updateData }, ref) => {
  const formRef = React.useRef(null);
  useImperativeHandle(ref, () => ({
    async submit() {
      // Only validate, don't submit to API yet
      if (formRef.current?.validate) {
        const isValid = await formRef.current.validate();
        if (isValid) {
          // Get form values and save to data
          const formValues = formRef.current.getValues();
          updateData({ templateForm: formValues });
          return true;
        }
        return false;
      }
      // Fallback: use submit method but override handleSubmit
      if (formRef.current?.submit) {
        // Trigger validation only
        const isValid = await formRef.current.validate();
        if (isValid) {
          const formValues = formRef.current.getValues();
          updateData({ templateForm: formValues });
          return true;
        }
        return false;
      }
      return false;
    }
  }));

  const handleSubmit = async (formValues) => {
    // Only save data, don't create template yet
    updateData({ templateForm: formValues });
    return true;
  };

  // Use only basic fields
  const fields = useMemo(() => {
    const all = createTemplateFormFields({ templateActionLoading: false });
    const keep = new Set(['name', 'desc']);
    return all.filter(f => keep.has(f.name));
  }, []);

  return (
    <Box>
      <Form
        ref={formRef}
        key={`create-template-step`}
        schema={packageTemplateBasicSchema}
        defaultValues={data.templateForm || {}}
        onSubmit={handleSubmit}
        hideSubmitButton
        loading={false}
        disabled={false}
        fields={fields}
      />
    </Box>
  );
});

// Step 2: Pricing & Duration (create template here if not exists, then update)
const Step2PricingDuration = forwardRef(({ data, updateData }, ref) => {
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
    if (loading) return false;
    try {
      setLoading(true);
      const payload = (({ minPrice, defaultPrice, maxPrice, minDurationInMonths, defaultDurationInMonths, maxDurationInMonths }) =>
        ({ minPrice, defaultPrice, maxPrice, minDurationInMonths, defaultDurationInMonths, maxDurationInMonths }))(values);
      
      // If template not created yet, create it first with basic info + pricing
      if (!data?.createdTemplateId) {
        const basicInfo = data.templateForm || {};
        const { isActive, ...createPayload } = {
          ...basicInfo,
          ...payload
        };
        const created = await packageTemplateService.createTemplate(createPayload);
        updateData({ 
          createdTemplateId: created.id, 
          templateForm: { ...basicInfo, ...payload } 
        });
        toast.success('Tạo mẫu gói thành công');
      } else {
        // Update existing template
        await packageTemplateService.updateTemplate(data.createdTemplateId, payload);
        updateData({ templateForm: { ...(data.templateForm || {}), ...payload } });
      }
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


