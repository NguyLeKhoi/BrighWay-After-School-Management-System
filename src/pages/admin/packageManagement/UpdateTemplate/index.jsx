import React, { useMemo, useState, useCallback, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { DashboardCustomize as TemplateIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import StepperForm from '../../../../components/Common/StepperForm';
import packageTemplateService from '../../../../services/packageTemplate.service';
import { createTemplateFormFields } from '../../../../definitions/package/formFields';
import Form from '../../../../components/Common/Form';
import { packageTemplateSchema } from '../../../../utils/validationSchemas/packageSchemas';
import { getErrorMessage } from '../../../../utils/errorHandler';
import { toast } from 'react-toastify';

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
      // Ensure name is not empty
      if (!payload.name || payload.name.trim() === '') {
        toast.error('Tên mẫu gói không được để trống');
        return false;
      }
      // Only save to formData, don't call API yet
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
    const keep = new Set(['name', 'desc']);
    return all.filter(f => keep.has(f.name));
  }, [loading]);

  return (
    <Box>
      <Form
        ref={formRef}
        key={`update-template-step-${data.templateId}`}
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
    try {
      setLoading(true);
      const payload = (({ minPrice, defaultPrice, maxPrice, minDurationInMonths, defaultDurationInMonths, maxDurationInMonths }) =>
        ({ minPrice, defaultPrice, maxPrice, minDurationInMonths, defaultDurationInMonths, maxDurationInMonths }))(values);
      // Only save to formData, don't call API yet
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
        key={`template-pricing-${data.templateId}`}
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
    try {
      setLoading(true);
      const payload = (({ minSlots, defaultTotalSlots, maxSlots }) => ({ minSlots, defaultTotalSlots, maxSlots }))(values);
      // Only save to formData, don't call API yet
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
    const keep = new Set(['minSlots', 'defaultTotalSlots', 'maxSlots']);
    return all.filter(f => keep.has(f.name));
  }, [loading]);

  return (
    <Box>
      <Form
        ref={formRef}
        key={`template-slots-${data.templateId}`}
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


const UpdateTemplate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);


  useEffect(() => {
    const load = async () => {
      try {
        const template = await packageTemplateService.getTemplateById(id);
        setFormData({
          templateId: id,
          templateForm: template
        });
      } finally {
        setInitialLoading(false);
      }
    };
    load();
  }, [id]);

  const steps = useMemo(() => ([
    { label: 'Thông tin cơ bản', component: Step1TemplateBasic },
    { label: 'Giá & Thời hạn', component: Step2PricingDuration },
    { label: 'Giới hạn slot', component: Step3Slots }
  ]), []);

  const handleComplete = useCallback(async (finalData) => {
    try {
      const templateForm = finalData?.templateForm || formData?.templateForm;
      if (!templateForm) {
        toast.error('Không tìm thấy dữ liệu để cập nhật');
        return;
      }

      // Remove isActive from payload as backend DTO doesn't include it
      const { isActive, ...payload } = templateForm;
      
      // Ensure name is not empty
      if (!payload.name || payload.name.trim() === '') {
        toast.error('Tên mẫu gói không được để trống');
        return;
      }

      // Call API once with all collected data
      await packageTemplateService.updateTemplate(id, payload);
      toast.success('Cập nhật mẫu gói thành công!');
      navigate('/admin/packages');
    } catch (err) {
      const errorMessage = getErrorMessage(err) || 'Cập nhật mẫu gói thất bại';
      toast.error(errorMessage, {
        autoClose: 5000,
        style: { whiteSpace: 'pre-line' }
      });
    }
  }, [navigate, id, formData]);

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
        title="Cập nhật Mẫu Gói"
        icon={<TemplateIcon />}
        initialData={formData}
      />
    </Box>
  );
};

export default UpdateTemplate;


