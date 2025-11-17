import React, { useCallback, useMemo, useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { Business as BranchIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import StepperForm from '../../../../components/Common/StepperForm';
import useLocationData from '../../../../hooks/useLocationData';
import branchService from '../../../../services/branch.service';
import { toast } from 'react-toastify';

const Step1BasicInfo = forwardRef(({ data, updateData }, ref) => {
  const [branchName, setBranchName] = useState(data.branchName || '');
  useEffect(() => { setBranchName(data.branchName || ''); }, [data.branchName]);
  useImperativeHandle(ref, () => ({
    async submit() {
      if (!branchName.trim()) {
        toast.error('Vui lòng nhập tên chi nhánh');
        return false;
      }
      updateData({ branchName: branchName.trim() });
      return true;
    }
  }));
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Thông tin chi nhánh</Typography>
      <input
        style={{ padding: 12, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
        placeholder="Tên Chi Nhánh"
        value={branchName}
        onChange={(e) => setBranchName(e.target.value)}
      />
    </Box>
  );
});

const Step2AddressContact = forwardRef(({ data, updateData }, ref) => {
  const { fetchProvinces, handleProvinceChange, getProvinceOptions, getDistrictOptions, selectedProvinceId } = useLocationData();
  const [address, setAddress] = useState(data.address || '');
  const [phone, setPhone] = useState(data.phone || '');
  const [provinceId, setProvinceId] = useState('');
  const [districtId, setDistrictId] = useState(data.districtId || '');

  useEffect(() => { fetchProvinces(); }, [fetchProvinces]);
  useEffect(() => { setAddress(data.address || ''); setPhone(data.phone || ''); setDistrictId(data.districtId || ''); }, [data.address, data.phone, data.districtId]);

  useImperativeHandle(ref, () => ({
    async submit() {
      if (!provinceId && !selectedProvinceId) { toast.error('Vui lòng chọn Tỉnh/Thành'); return false; }
      if (!districtId) { toast.error('Vui lòng chọn Quận/Huyện'); return false; }
      if (!address.trim()) { toast.error('Vui lòng nhập địa chỉ'); return false; }
      if (!phone.trim()) { toast.error('Vui lòng nhập số điện thoại'); return false; }
      updateData({ address: address.trim(), phone: phone.trim(), districtId });
      return true;
    }
  }));

  const provinceOptions = useMemo(() => getProvinceOptions(), [getProvinceOptions]);
  const districtOptions = useMemo(() => getDistrictOptions(), [getDistrictOptions]);

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Địa chỉ & Liên hệ</Typography>
      <select
        style={{ padding: 12, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
        value={provinceId}
        onChange={(e) => {
          setProvinceId(e.target.value);
          handleProvinceChange(e.target.value);
          setDistrictId('');
        }}
      >
        <option value="">Chọn Tỉnh/Thành</option>
        {provinceOptions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
      </select>
      <select
        style={{ padding: 12, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
        value={districtId}
        onChange={(e) => setDistrictId(e.target.value)}
      >
        <option value="">Chọn Quận/Huyện</option>
        {districtOptions.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
      </select>
      <input
        style={{ padding: 12, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
        placeholder="Địa chỉ"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <input
        style={{ padding: 12, fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
        placeholder="Số điện thoại"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
    </Box>
  );
});

const UpdateBranch = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const branch = await branchService.getBranchById(id);
        setFormData({
          branchName: branch.branchName || '',
          address: branch.address || '',
          phone: branch.phone || '',
          districtId: branch.districtId || ''
        });
      } finally {
        setInitialLoading(false);
      }
    };
    load();
  }, [id]);

  const handleComplete = useCallback(async (data) => {
    await branchService.updateBranch(id, {
      branchName: data.branchName,
      address: data.address,
      phone: data.phone,
      districtId: data.districtId
    });
    toast.success('Cập nhật chi nhánh thành công');
    navigate('/admin/branches');
  }, [navigate, id]);

  const handleCancel = useCallback(() => {
    navigate('/admin/branches');
  }, [navigate]);

  const steps = useMemo(() => ([
    { label: 'Thông tin cơ bản', component: Step1BasicInfo },
    { label: 'Địa chỉ & Liên hệ', component: Step2AddressContact }
  ]), []);

  if (initialLoading || !formData) {
    return (
      <Box sx={{ minHeight: 'calc(100vh - 64px - 48px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Đang tải dữ liệu chi nhánh...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px - 48px)', display: 'flex', flexDirection: 'column' }}>
      <StepperForm
        steps={steps}
        onComplete={handleComplete}
        onCancel={handleCancel}
        title="Cập nhật Chi Nhánh"
        icon={<BranchIcon />}
        initialData={formData}
      />
    </Box>
  );
};

export default UpdateBranch;


