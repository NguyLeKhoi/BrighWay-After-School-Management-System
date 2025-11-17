import React, { useCallback, useMemo, useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Box, Typography, Autocomplete, TextField, Checkbox, ListItemText, Button, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Business as BranchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import StepperForm from '../../../../components/Common/StepperForm';
import useLocationData from '../../../../hooks/useLocationData';
import branchService from '../../../../services/branch.service';
import benefitService from '../../../../services/benefit.service';
import { toast } from 'react-toastify';

const Step1BranchInfo = forwardRef(({ data, updateData }, ref) => {
  const [branchName, setBranchName] = useState(data.branchName || '');
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

const Step1AddressContact = forwardRef(({ data, updateData }, ref) => {
  const { provinces, fetchProvinces, handleProvinceChange, getProvinceOptions, getDistrictOptions, selectedProvinceId } = useLocationData();
  const [address, setAddress] = useState(data.address || '');
  const [phone, setPhone] = useState(data.phone || '');
  const [provinceId, setProvinceId] = useState('');
  const [districtId, setDistrictId] = useState('');

  useEffect(() => { fetchProvinces(); }, [fetchProvinces]);

  useImperativeHandle(ref, () => ({
    async submit() {
      if (!provinceId) { toast.error('Vui lòng chọn Tỉnh/Thành'); return false; }
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

      <FormControl fullWidth required>
        <InputLabel>Tỉnh/Thành Phố</InputLabel>
        <Select
          label="Tỉnh/Thành Phố"
          value={provinceId}
          onChange={(e) => {
            setProvinceId(e.target.value);
            handleProvinceChange(e.target.value);
            setDistrictId('');
          }}
          MenuProps={{ disableScrollLock: true }}
        >
          <MenuItem value="">Chọn Tỉnh/Thành</MenuItem>
          {provinceOptions.map(p => (
            <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth required disabled={!provinceId}>
        <InputLabel>Quận/Huyện</InputLabel>
        <Select
          label="Quận/Huyện"
          value={districtId}
          onChange={(e) => setDistrictId(e.target.value)}
          MenuProps={{ disableScrollLock: true }}
        >
          <MenuItem value="">Chọn Quận/Huyện</MenuItem>
          {districtOptions.map(d => (
            <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        placeholder="Địa chỉ"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <TextField
        fullWidth
        placeholder="Số điện thoại"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
    </Box>
  );
});

const Step2AssignBenefits = forwardRef(({ data }, ref) => {
  const [loading, setLoading] = useState(true);
  const [availableBenefits, setAvailableBenefits] = useState([]);
  const [selectedBenefitIds, setSelectedBenefitIds] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const allBenefits = await benefitService.getAllBenefits();
        setAvailableBenefits(allBenefits || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useImperativeHandle(ref, () => ({
    async submit() {
      if (!data?.createdBranchId) {
        toast.error('Không tìm thấy chi nhánh vừa tạo');
        return false;
      }
      try {
        await benefitService.assignBenefitsToBranch({ branchId: data.createdBranchId, benefitIds: selectedBenefitIds });
        toast.success('Gán lợi ích thành công');
        return true;
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || 'Gán lợi ích thất bại');
        return false;
      }
    }
  }));

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Gán Lợi Ích cho Chi Nhánh</Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
      ) : (
        <Autocomplete
          multiple
          options={availableBenefits}
          getOptionLabel={(option) => option.name}
          value={availableBenefits.filter(b => selectedBenefitIds.includes(b.id))}
          onChange={(event, newValue) => setSelectedBenefitIds(newValue.map(b => b.id))}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <Checkbox checked={selectedBenefitIds.includes(option.id)} />
              <ListItemText primary={option.name} secondary={option.description || 'Không có mô tả'} />
            </Box>
          )}
          renderInput={(params) => (
            <TextField {...params} placeholder="Tìm và chọn lợi ích..." />
          )}
        />
      )}
      <Typography variant="body2" color="text.secondary">Đã chọn: <b>{selectedBenefitIds.length}</b> lợi ích</Typography>
    </Box>
  );
});

const CreateBranch = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});

  const handleStep1Create = useCallback(async (data) => {
    try {
      const created = await branchService.createBranch({
        branchName: data.branchName,
        address: data.address,
        phone: data.phone,
        districtId: data.districtId
      });
      setFormData(prev => ({ ...prev, createdBranchId: created.id }));
      toast.success('Tạo chi nhánh thành công, tiếp tục gán lợi ích');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Tạo chi nhánh thất bại');
      return false;
    }
  }, []);

  const handleComplete = useCallback(async () => {
    navigate('/admin/branches');
  }, [navigate]);

  const handleCancel = useCallback(() => {
    navigate('/admin/branches');
  }, [navigate]);

  const steps = useMemo(() => ([
    { label: 'Thông tin cơ bản', component: Step1BranchInfo },
    { label: 'Địa chỉ & Liên hệ', component: Step1AddressContact, validation: handleStep1Create },
    { label: 'Gán Lợi Ích', component: Step2AssignBenefits }
  ]), [handleStep1Create]);

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px - 48px)', display: 'flex', flexDirection: 'column' }}>
      <StepperForm
        steps={steps}
        onComplete={handleComplete}
        onCancel={handleCancel}
        title="Tạo Chi Nhánh"
        icon={<BranchIcon />}
        initialData={formData}
      />
    </Box>
  );
};

export default CreateBranch;


